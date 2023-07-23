import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/Orbitcontrols.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import * as dat from "dat.gui";

// const parameters = {
//   color: 0xffff00,
//   spin: () => {
//     gsap.to(mesh.rotation, 1, { x: mesh.rotation.x + Math.PI * 2 });
//   },
// };

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  //Update Sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  //renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// Scene
const scene = new THREE.Scene();

//Grid Helper
const gridHelper = new THREE.GridHelper(100);
scene.add(gridHelper);

// Object
// const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: parameters.color });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// Instantiate a loader
const gltfLoader = new GLTFLoader();

// Load a glTF resource
gltfLoader.load(
  // resource URL
  "/doll/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    gltf.scene.scale.set(1, 1, 1);
    gltf.scene.position.set(0, 4.75, -45);
    scene.add(gltf.scene);
  },
  //called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  //called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);

//Lights
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);
// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 15;
//camera.lookAt(mesh.position);
scene.add(camera);

//Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.enable = false;
controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI({
  // closed: true,
  width: 400,
});
// gui.hide()
//gui.add(mesh.position, "y").min(-3).max(3).step(0.01).name("elevation");
//gui.add(mesh, "visible");
//gui.add(material, "wireframe");

// gui.addColor(parameters, "color").onChange(() => {
//   material.color.set(parameters.color);
// });

// gui.add(parameters, "spin");

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
//renderer.setPixelRatio(window.devicePixelRatio);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Animate
const clock = new THREE.Clock();
//console.log(clock);
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  //console.log(elapsedTime);

  // Update objects
  //mesh.rotation.y = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
};

tick();
