import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const stage = document.querySelector('#stage');
const toggle = document.querySelector('#toggle');
const reset = document.querySelector('#reset');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
} catch {
  document.querySelector('#fallback').hidden = false;
  toggle.disabled = reset.disabled = true;
  document.querySelector('#motion-state').textContent = 'SVG FALLBACK';
}
if (renderer) init(renderer);

function init(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  stage.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const home = new THREE.Vector3(4.4, 2.3, 10.5);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 17;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = Math.PI - 0.3;
  controls.rotateSpeed = 0.65;
  controls.target.set(0, 0, 0);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xe7d4ff, 0x251437, 3));
  function light(color, intensity, x, y, z) {
    const l = new THREE.DirectionalLight(color, intensity);
    l.position.set(x, y, z); scene.add(l);
  }
  light(0xf5eaff, 4.5, -3, 5, 7);
  light(0x934dff, 5, 5, -1, -4);
  light(0xcbb0ff, 2, -4, -3, 3);
  const logo = new THREE.Group();
  scene.add(logo);
  const depth = 0.5;
  const toPoint = ([x,y]) => new THREE.Vector2((x-600)/88, (310-y)/88);
  const outline = [[500,402],[500,218],[547,218],[653,338],[653,218],[700,218],[700,402],[653,402],[547,282],[547,402]].map(toPoint);
  const bolt = [[586,272],[626,311],[601,311],[637,363],[567,299],[593,299]].map(toPoint);
  const shape = new THREE.Shape(outline);
  shape.holes.push(new THREE.Path(bolt));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.045, bevelThickness: 0.045, curveSegments: 12 });
  geometry.translate(0,0,-depth/2);
  const position = geometry.attributes.position;
  const colors = [];
  const bottom = new THREE.Color('#873aff'), top = new THREE.Color('#eedaff');
  for (let i=0;i<position.count;i++) {
    const t = THREE.MathUtils.clamp((position.getY(i)+1.1)/2.5 + position.getX(i)*0.13,0,1);
    const c = bottom.clone().lerp(top,t);
    colors.push(c.r,c.g,c.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
  const front = new THREE.MeshStandardMaterial({ vertexColors:true, metalness:0.38, roughness:0.27 });
  const sides = new THREE.MeshStandardMaterial({ color:0x7837ce, metalness:0.55, roughness:0.24 });
  const letter = new THREE.Mesh(geometry,[front,sides]);
  letter.name = 'Extruded N with through-cut lightning';
  logo.add(letter);

  // Frame, orbit and nodes are geometry too, never an image-bearing plane.
  const frame = new THREE.Shape();
  const s=1.69,r=0.42;
  frame.moveTo(-s+r,-s); frame.lineTo(s-r,-s); frame.quadraticCurveTo(s,-s,s,-s+r);
  frame.lineTo(s,s-r); frame.quadraticCurveTo(s,s,s-r,s); frame.lineTo(-s+r,s);
  frame.quadraticCurveTo(-s,s,-s,s-r); frame.lineTo(-s,-s+r); frame.quadraticCurveTo(-s,-s,-s+r,-s);
  // A fine rounded outline leaves the letter and cutout unobscured from either side.
  const frameCurve = new THREE.CatmullRomCurve3(frame.getPoints(24).map(p=>new THREE.Vector3(p.x,p.y,-0.46)),true);
  logo.add(new THREE.Mesh(new THREE.TubeGeometry(frameCurve,200,0.009,6,true),new THREE.MeshStandardMaterial({color:0xa673d5,metalness:0.5,roughness:0.4,transparent:true,opacity:0.5})));
  const orbit = new THREE.Group();
  orbit.rotation.z = THREE.MathUtils.degToRad(23);
  logo.add(orbit);
  const points = [];
  for(let i=0;i<=160;i++) {
    const a=i/160*Math.PI*2;
    points.push(new THREE.Vector3(2.63*Math.cos(a),1.98*Math.sin(a),-0.07+0.26*Math.sin(a)));
  }
  const orbitCurve = new THREE.CatmullRomCurve3(points.slice(0,-1),true);
  const orbitMat = new THREE.MeshStandardMaterial({ color:0xab70e8,emissive:0x49235d,emissiveIntensity:0.3,metalness:0.65,roughness:0.27 });
  orbit.add(new THREE.Mesh(new THREE.TubeGeometry(orbitCurve,200,0.012,8,true),orbitMat));
  for (const a of [0.72,2.99,4.93]) {
    const p = new THREE.Vector3(2.63*Math.cos(a),1.98*Math.sin(a),-0.07+0.26*Math.sin(a));
    const node=new THREE.Mesh(new THREE.SphereGeometry(0.075,24,16),new THREE.MeshStandardMaterial({color:0xe4bfff,emissive:0xa15be3,emissiveIntensity:0.75,metalness:0.3,roughness:0.2}));
    node.position.copy(p); orbit.add(node);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.145,0.006,6,48),orbitMat);
    ring.position.copy(p); orbit.add(ring);
  }
  let rotating=!motion.matches, raf=0, last=0;
  const render=()=>renderer.render(scene,camera);
  function resize(){const {width,height}=stage.getBoundingClientRect(); renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
  new ResizeObserver(resize).observe(stage);
  function tick(time){raf=0;if(!rotating)return;const delta=last?Math.min((time-last)/1000,0.05):0;last=time;logo.rotation.y+=delta*0.24;render();raf=requestAnimationFrame(tick);}
  function sync(){
    toggle.setAttribute('aria-pressed',String(!rotating));
    document.querySelector('#toggle-label').textContent=rotating?'Pause rotation':'Resume rotation';
    document.querySelector('#toggle-icon').textContent=rotating?'Ⅱ':'▷';
    document.querySelector('#motion-state').textContent=rotating?'AUTO ROTATION':motion.matches?'REDUCED MOTION / PAUSED':'ROTATION PAUSED';
    if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(rotating)raf=requestAnimationFrame(tick);render();
  }
  toggle.addEventListener('click',()=>{rotating=!rotating;sync();});
  reset.addEventListener('click',()=>{logo.rotation.set(0,0,0);camera.position.copy(home);controls.target.set(0,0,0);controls.update();render();});
  motion.addEventListener('change',()=>{rotating=!motion.matches;sync();});
  controls.addEventListener('change',render);
  stage.addEventListener('keydown',event=>{
    const step=0.12;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(event.key)) {
      event.preventDefault();
      if(event.key==='ArrowLeft')logo.rotation.y-=step;
      if(event.key==='ArrowRight')logo.rotation.y+=step;
      if(event.key==='ArrowUp')logo.rotation.x-=step;
      if(event.key==='ArrowDown')logo.rotation.x+=step;
      if(event.key==='+'||event.key==='=')camera.position.multiplyScalar(0.93);
      if(event.key==='-')camera.position.multiplyScalar(1.07);
      camera.position.setLength(THREE.MathUtils.clamp(camera.position.length(),7,17));
      controls.update();render();
    }
  });
  resize();sync();
  if(new URLSearchParams(location.search).has('test')) {
    window.__relaySignal={snapshot:()=>({rotating,rotation:logo.rotation.toArray().slice(0,3),camera:camera.position.toArray(),triangles:renderer.info.render.triangles,geometry:geometry.type,depth:geometry.parameters.options.depth,holes:shape.holes.length,canvas:{width:renderer.domElement.width,height:renderer.domElement.height}})};
  }
}
