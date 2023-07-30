import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/Orbitcontrols.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import * as dat from "dat.gui";

const parameters = {
  color: 0xffff00,
  //   spin: () => {
  //     gsap.to(mesh.rotation, 1, { x: mesh.rotation.x + Math.PI * 2 });
  //   },
};
let scene, renderer, camera, stats;
let model, skeleton, mixer;

const crossFadeControls = [];

let idleAction, walkAction, runAction;
let idleWeight, walkWeight, runWeight;
let actions, settings;

let singleStepMode = false;
let sizeOfNextStep = 0;
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
scene = new THREE.Scene();

//Grid Helper
const gridHelper = new THREE.GridHelper(100);
scene.add(gridHelper);

// // Object
// const boxGeometry = new THREE.BoxBufferGeometry(5, 5, 5);
// // const boxMaterial = new THREE.MeshBasicMaterial({ color: parameters.color });
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);
// boxMesh.position.z = 47.5;
// boxMesh.position.y = 2.5;

// Line
const lineStart = new THREE.Vector3(-50, 0, -40);
const lineEnd = new THREE.Vector3(50, 0, -40);
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  lineStart,
  lineEnd,
]);
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff0000,
  //linewidth: 10,
});
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Raycaster
const raycaster = new THREE.Raycaster();
const rayDirection = new THREE.Vector3(0, -1, 0); // Customize the direction based on your scene setup

// Intersection Check
const lineBox = new THREE.Box3(
  new THREE.Vector3(-50, -0, -0),
  new THREE.Vector3(50, 0, 0)
);

// Visualization
// const lineBoxHelper = new THREE.Box3Helper(lineBox, 0x00ff00);
// scene.add(lineBoxHelper);

//console.log(lineBox);

// Instantiate a loader
const gltfLoader = new GLTFLoader();

// Load a glTF resource
gltfLoader.load(
  // resource URL
  "/Soldier.glb",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(0, 0, 50);
    model = gltf.scene;
    // model.traverse(function (object) {
    //   if (object.isMesh) object.castShadow = true;
    // });
    const animations = gltf.animations;

    mixer = new THREE.AnimationMixer(model);
    console.log(mixer);

    // Set the time scale for the mixer to make the animation play faster (e.g., 2.0 for double speed)
    //mixer.timeScale = 100.0;

    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[3]);
    runAction = mixer.clipAction(animations[1]);

    //console.log(walkAction);

    actions = [idleAction, walkAction, runAction];
    //idleAction.play();
    //walkAction.play();
    //runAction.play();
    scene.add(gltf.scene);
    tick();
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
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 0;
camera.position.y = 35;
camera.position.z = 70;
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
  closed: true,
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

/**
 * Controls
 */
let keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  space: false,
  shift: false,
};

document.addEventListener("keydown", (event) => onKeyDown(event), false);
document.addEventListener("keyup", (event) => onKeyUp(event), false);

function onKeyDown(event) {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.forward = true;
      //console.log("Keydown: w");
      break;
    case "a":
      keys.left = true;
      //console.log("Keydown: a");
      break;
    case "s":
      keys.backward = true;
      //console.log("Keydown: s");
      break;
    case "d":
      keys.right = true;
      //console.log("Keydown: d");
      break;
    case " ": // SPACE
      keys.space = true;
      //console.log("Keydown: SPACE");
      break;
    case "shift":
      keys.shift = true;
      //console.log("Keydown: SHIFT");
      break;
  }
}

function onKeyUp(event) {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.forward = false;
      //console.log("Keyup: w");
      break;
    case "a":
      keys.left = false;
      //console.log("Keyup: a");
      break;
    case "s":
      keys.backward = false;
      //console.log("Keyup: s");
      break;
    case "d":
      keys.right = false;
      //console.log("Keyup: d");
      break;
    case " ": // SPACE
      keys.space = false;
      //console.log("Keyup: SPACE");
      break;
    case "shift":
      keys.shift = false;
      //console.log("Keyup: SHIFT");
      break;
  }
}
// Renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
//renderer.setPixelRatio(window.devicePixelRatio);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Animate
const clock = new THREE.Clock();
console.log(clock);

//console.log(clock);

let movementSpeed = 0.1;

let mixerUpdated = false; // Add a flag to track if mixer.update has been called
let rotationAngle = 0; // Variable to store the desired rotation angle
let angle = Math.PI;
let currentRotationAngle = 0;
const tick = () => {
  //const elapsedTime = clock.getElapsedTime();
  const mixerUpdateDelta = clock.getDelta();
  //console.log(elapsedTime);

  // Update objects
  //mesh.rotation.y = elapsedTime;

  // Update position based on keys
  rotationAngle = 0; // Reset the rotation angle for each frame

  // Update position based on keys

  // Check if Shift is pressed to determine if the character is running
  const isRunning =
    keys.shift && (keys.forward || keys.backward || keys.left || keys.right);
  const isWalking = keys.forward || keys.backward || keys.left || keys.right;

  if (isRunning) {
    walkAction.setEffectiveTimeScale(1.0);
    //mixer.stopAllAction();
    movementSpeed = 0.2;
    runAction.play();
    walkAction.stop();
    idleAction.stop();
    mixerUpdated = true; // Adjust the animation speed for running
  } else if (isWalking) {
    walkAction.setEffectiveTimeScale(1.0);
    //mixer.stopAllAction();
    walkAction.play();
    runAction.stop();
    idleAction.stop();
    mixerUpdated = true; // Reset the animation speed for walking
  } else {
    //mixer.stopAllAction();
    idleAction.play();
    rotationAngle = currentRotationAngle;
    walkAction.stop();
    runAction.stop();
    mixerUpdated = true;
  }

  if (keys.forward) {
    //walkAction.play();
    //mixerUpdated = true;
    //model.rotation.set(0, 0, 0);
    model.position.z -= movementSpeed;
    //boxMesh.position.z -= movementSpeed;
    // Calculate the rotation angle based on the direction of movement
    if (keys.left) {
      rotationAngle += angle / -8; // Rotate -90 degrees if moving backward and left
    } else if (keys.right) {
      rotationAngle += angle / 8; // Rotate 90 degrees if moving backward and right
    } else {
      rotationAngle += angle * 2; // Rotate 180 degrees if moving backward without any lateral movement
    }
    //rotationAngle += angle * (keys.left ? -0.25 : 2);
    //rotationAngle += angle * (keys.right ? 0.25 : 2);
  }
  if (keys.backward) {
    //walkAction.play();
    //mixerUpdated = true;
    //model.rotation.set(0, Math.PI, 0);
    model.position.z += movementSpeed;
    //boxMesh.position.z += movementSpeed;
    // Calculate the rotation angle based on the direction of movement
    if (keys.left) {
      rotationAngle += angle / 4; // Rotate -90 degrees if moving backward and left
    } else if (keys.right) {
      rotationAngle += angle / -4; // Rotate 90 degrees if moving backward and right
    } else {
      rotationAngle += angle; // Rotate 180 degrees if moving backward without any lateral movement
    }
    //rotationAngle += angle * (keys.left ? -0.75 : 1);
    //rotationAngle += angle * (keys.right ? 0.75 : 1); // Rotate 180 degrees if moving backward
  }
  if (keys.left) {
    //walkAction.play();
    //mixerUpdated = true;
    model.rotation.set(0, Math.PI / 2, 0);
    model.position.x -= movementSpeed;
    //boxMesh.position.x -= movementSpeed;
    rotationAngle += Math.PI / 2; // Rotate 90 degrees if moving left
  }
  if (keys.right) {
    //walkAction.play();
    //mixerUpdated = true;
    model.rotation.set(0, -Math.PI / 2, 0);
    model.position.x += movementSpeed;
    //boxMesh.position.x += movementSpeed;
    rotationAngle -= Math.PI / 2; // Rotate -90 degrees if moving right
  }

  // Apply the accumulated rotationAngle to the model
  model.rotation.set(0, rotationAngle, 0);
  // Save the current rotationAngle to be used when keys are released
  currentRotationAngle = rotationAngle;

  if (mixerUpdated) {
    mixer.update(mixerUpdateDelta); // Call mixer.update only once if any key is pressed
    mixerUpdated = false; // Reset the flag for the next frame
  }
  // if (keys.space) {
  //   boxMesh.position.y = 10;
  // } else {
  //   boxMesh.position.y = 0;
  // }
  // if (keys.shift) {
  //   boxMesh.position.z -= movementSpeed * 2;
  // }

  // Update the raycaster origin based on the box's position
  //raycaster.set(boxMesh.position, rayDirection);
  raycaster.set(model.position, rayDirection);

  // Check if the ray intersects the line
  const intersects = raycaster.intersectObject(line);
  //console.log(intersects);

  if (intersects.length > 0) {
    console.log("Soldier Crossed line");
  }
  // Call tick again on the next frame
  requestAnimationFrame(tick);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  // if (model && mixer) {
  // Update the animation mixer only when both 'model' and 'mixer' are defined
  //mixer.update(mixerUpdateDelta);
  // }

  // Render
  renderer.render(scene, camera);
};

//tick();
