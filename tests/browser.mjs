import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://127.0.0.1:18743/';
const remote = !!process.env.BASE_URL;
const label = remote ? 'deployed' : 'local';
const server = remote ? null : spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','18743','--strictPort'],{stdio:'ignore'});
let browser;
const errors=[]; const warnings=[];
const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});};
try {
  for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1440,height:1050}});watch(page);
  const response=await page.goto(`${base}?test=1`);assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.__relaySignal?.snapshot().triangles>100);
  const snap=()=>page.evaluate(()=>window.__relaySignal.snapshot());
  const initial=await snap();await page.waitForTimeout(650);const moving=await snap();
  assert.ok(moving.rotation[1]-initial.rotation[1]>0.05,'Automatic rotation must advance');
  if(process.env.ROTATION_ONLY){console.log('Rotation assertion passed');process.exitCode=0;}
  else {
    assert.equal(initial.geometry,'ExtrudeGeometry');assert.equal(initial.depth,0.5);assert.equal(initial.holes,1);
    await page.getByRole('button',{name:'Pause rotation'}).click();
    const paused=await snap();await page.waitForTimeout(400);assert.deepEqual((await snap()).rotation,paused.rotation);
    const box=await page.locator('#stage').boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+110,box.y+box.height/2+40,{steps:10});await page.mouse.up();
    assert.notDeepEqual((await snap()).camera,paused.camera,'Mouse drag must orbit');
    await page.getByRole('button',{name:'Reset camera and model view'}).click();assert.deepEqual((await snap()).rotation,[0,0,0]);
    await page.screenshot({path:`artifacts/${label}-desktop.png`,fullPage:true});
    const svg=await page.request.get(new URL('nostr-relay-signal.svg',base).href);assert.equal(svg.status(),200);assert.match(await svg.text(),/<svg/);
    assert.equal(await page.locator('a[download]').count(),1);
    await page.getByRole('button',{name:'Resume rotation'}).click();assert.equal((await snap()).rotating,true);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!window.__relaySignal.snapshot().rotating);assert.equal((await snap()).rotating,false);
    await page.locator('#stage').focus();const keyBefore=await snap();await page.keyboard.press('ArrowRight');assert.ok((await snap()).rotation[1]>keyBefore.rotation[1]);
    const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const mp=await mobile.newPage();watch(mp);await mp.goto(`${base}?test=1`);await mp.waitForFunction(()=>window.__relaySignal);
    assert.equal(await mp.evaluate(()=>window.__relaySignal.snapshot().rotating),false);
    assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const beforeTouch=await mp.evaluate(()=>window.__relaySignal.snapshot().camera);
    const mb=await mp.locator('#stage').boundingBox();
    const session=await mobile.newCDPSession(mp);const x=mb.x+mb.width/2,y=mb.y+mb.height/2;
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*10,y:y+i*3}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.notDeepEqual(await mp.evaluate(()=>window.__relaySignal.snapshot().camera),beforeTouch,'Touch must orbit');
    await mp.getByRole('button',{name:'Reset camera and model view'}).click();
    await mp.screenshot({path:`artifacts/${label}-mobile.png`,fullPage:true});
    // Test a missing WebGL context rather than assuming the fallback works.
    const fp=await browser.newPage();await fp.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=function(){return null;};});await fp.goto(base);await fp.waitForSelector('#fallback',{state:'visible'});assert.equal(await fp.locator('#toggle').isDisabled(),true);await fp.close();
    assert.deepEqual(errors,[],'No page or console errors in WebGL-enabled tests');
    await mkdir('artifacts',{recursive:true});
    const result={target:label,httpStatus:response.status(),geometry:initial.geometry,depth:initial.depth,holes:initial.holes,triangles:initial.triangles,checks:['auto-rotation','pause/resume','mouse-orbit','reset','SVG download HTTP 200','reduced-motion initial + dynamic','keyboard','mobile layout','emulated touch orbit','WebGL fallback'],errors,warnings,environment:`Playwright ${process.env.BROWSER_CHANNEL || 'Chromium'} headless, SwiftShader; emulated mobile/touch (not physical device)`};
    await writeFile(`artifacts/${label}-test-results.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
  }
}catch(error){console.error(JSON.stringify({errors,warnings}));throw error;}finally{await browser?.close();server?.kill('SIGTERM');}
