import * as THREE from 'three';
import { DXFLoader } from 'three-dxf-loader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x949494);
const loader = new DXFLoader();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.render(scene, camera);

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', onWindowResize);

document.addEventListener('dragover', (e) => e.preventDefault());
(new FontLoader()).load("fonts/helvetiker_regular.typeface.json", (font) => {
  loader.setFont(font);
  loader.setEnableLayer(true);
  document.addEventListener('drop', function (event) {
    event.preventDefault();
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        loader.loadString(reader.result, (data) => {
          console.log(data.dxf.entities);
          if (data?.entity) {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x949494);
            const min = data.dxf.header.$EXTMIN, max = data.dxf.header.$EXTMAX;
            const bounds = new THREE.Box3(min, max);
            bounds.getCenter(camera.position);
            camera.position.sub(min);
            data.entity.position.sub(min);
            controls.target.copy(camera.position);
            const sz = bounds.getSize(new THREE.Vector3());
            camera.position.z = 2 * Math.max(Math.max(sz.x, sz.y), sz.z);
            scene.add(data.entity);
            animate();
          }
        });
      },
      false,
    );
    reader.readAsText(event.dataTransfer.files[0]);
  });
});
