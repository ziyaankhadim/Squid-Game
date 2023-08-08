import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/Orbitcontrols.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
//import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Sky } from "three/examples/jsm/objects/Sky";
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
let dollFacingBack = false;
const crossFadeControls = [];

let idleAction, walkAction, runAction;
let idleWeight, walkWeight, runWeight;
let actions, settings;
let textureRandom;

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

// //RGBE LOADER
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load("/bell_park_dawn_4k.hdr", function (texture) {
//   texture.mapping = THREE.EquirectangularReflectionMapping;

//   scene.background = texture;
//   //scene.environment = texture;
// });

// Scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0xadcbea); //.setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 5000);
//Grid Helper
const gridHelper = new THREE.GridHelper(100);
//scene.add(gridHelper);

/**
 * Textures
 */
textureRandom = Math.random() * 10 + 1;
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("loadingManager: loading started");
};
loadingManager.onLoaded = () => {
  console.log("loadingManager: loading finished");
};
loadingManager.onProgress = () => {
  console.log("loadingManager: loading progressing");
};
loadingManager.onError = () => {
  console.log("loadingManager: loading error");
};

const textureLoader = new THREE.TextureLoader(loadingManager);

// const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')
// const colorTexture = textureLoader.load('/textures/checkerboard-2x2.png')
const colorTexture = textureLoader.load(
  "/Dirt/dirt_floor_diff_1k.jpg",
  () => {
    console.log("textureLoader: loading finished");
  },
  () => {
    console.log("textureLoader: loading progressing");
  },
  () => {
    console.log("textureLoader: loading error");
  }
);

// const aoTexture = textureLoader.load("/Sand 002/Sand 002_OCC.jpg");
// const heightTexture = textureLoader.load("/Sand 002/Sand 002_DISP.png");
// const normalTexture = textureLoader.load("/Sand 002/Sand 002_NRM.jpg");
// // const ambientOcclusionTexture = textureLoader.load(
// //   "/textures/door/ambientOcclusion.jpg"
// // );
// const metalnessTexture = textureLoader.load("/Sand 002/Sand 002_SPEC.jpg");
// //const roughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const aoTexture = textureLoader.load("/Dirt/dirt_floor_ao_1k.jpg");
const heightTexture = textureLoader.load("/Dirt/dirt_floor_disp_1k.png");
//const normalTexture = textureLoader.load("/Dirt/dirt_floor_nor_gl_1k.jpg");
//const normalTexture = textureLoader.load("/Dirt/dirt_floor_nor_dx_1k.jpg");
// const ambientOcclusionTexture = textureLoader.load(
//   "/textures/door/ambientOcclusion.jpg"
// );
//const metalnessTexture = textureLoader.load("/Sand 002/Sand 002_SPEC.jpg");
//const roughnessTexture = textureLoader.load("/Dirt/dirt_floor_rough_1k.jpg");
//const alphaTexture = textureLoader.load("/Dirt/dirt_floor_arm_1k.jpg");

// Floor
const floorMaterial = new THREE.MeshStandardMaterial();
const floorGeometry = new THREE.PlaneBufferGeometry(100, 250, 100, 100);
// After creating the floorGeometry, compute the face normals and vertex normals
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floorMaterial.side = THREE.DoubleSide;
floorGeometry.computeFaceNormals();
floorGeometry.computeVertexNormals();
colorTexture.wrapS = THREE.MirroredRepeatWrapping;
colorTexture.wrapT = THREE.MirroredRepeatWrapping;
colorTexture.repeat.x = Math.random() * 10 + 2;
colorTexture.repeat.y = Math.random() * 10 + 2;
colorTexture.offset.x = 0.5;
colorTexture.offset.y = 0.5;
colorTexture.rotation = Math.PI * 0.25;
colorTexture.center.x = 0.5;
colorTexture.center.y = 0.5;
// colorTexture.generateMipmaps = false;
//colorTexture.minFilter = THREE.NearestFilter;
//colorTexture.magFilter = THREE.NearestFilter;
floorMaterial.map = colorTexture;
//floorMaterial.alphaMap = alphaTexture;
//console.log(floorMaterial);
aoTexture.wrapS = THREE.MirroredRepeatWrapping;
aoTexture.wrapT = THREE.MirroredRepeatWrapping;
aoTexture.repeat.x = textureRandom;
aoTexture.repeat.y = textureRandom;
floorMaterial.aoMap = aoTexture;
floorMaterial.aoMapIntensity = 1.5;
//floorMaterial.normalMap = normalTexture;
// normalTexture.wrapS = THREE.MirroredRepeatWrapping;
// normalTexture.wrapT = THREE.MirroredRepeatWrapping;
// normalTexture.repeat.x = random;
// normalTexture.repeat.y = random;
// console.log(floorMaterial);
floorMaterial.color = new THREE.Color(0xffffff);
floorMaterial.displacementMap = heightTexture;
//floorMaterial.roughnessMap = roughnessTexture;
//roughnessTexture.wrapS = THREE.MirroredRepeatWrapping;
//roughnessTexture.wrapT = THREE.MirroredRepeatWrapping;
//roughnessTexture.repeat.x = random;
//roughnessTexture.repeat.y = random;
//floorMaterial.roughness = 5;
//floorMaterial.metalness = 0;
//floorMaterial.normalMap = normalTexture;
//floorMaterial.normalScale.set(1000, 1000);
floorMaterial.displacementScale = 2;
heightTexture.wrapS = THREE.MirroredRepeatWrapping;
heightTexture.wrapT = THREE.MirroredRepeatWrapping;
heightTexture.repeat.x = textureRandom;
heightTexture.repeat.y = textureRandom;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -1;
floor.position.z = 50;
scene.add(floor);

//Side Walls
const wallTexture = textureLoader.load(
  "/background/sideWall.png",
  () => {
    console.log("textureLoader: loading finished");
  },
  () => {
    console.log("textureLoader: loading progressing");
  },
  () => {
    console.log("textureLoader: loading error");
  }
);
const wallMaterial = new THREE.MeshStandardMaterial();
const wallGeometry = new THREE.PlaneBufferGeometry(250, 50, 100, 100);
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
// wall.geometry.setAttribute(
//   "uv2",
//   new THREE.BufferAttribute(wall.geometry.attributes.uv.array, 2)
// );
//wallMaterial.side = THREE.DoubleSide;
wallTexture.wrapS = THREE.MirroredRepeatWrapping;
wallTexture.wrapT = THREE.MirroredRepeatWrapping;
wallTexture.repeat.x = 5;
wallTexture.repeat.y = 1;
wallMaterial.map = wallTexture;
rightWall.rotation.x = Math.PI;
rightWall.rotation.y = -Math.PI / 2;
rightWall.rotation.z = -Math.PI;
rightWall.position.x = 49.5;
rightWall.position.y = 50 / 2;
rightWall.position.z = 50;
scene.add(rightWall);
const leftWall = rightWall.clone();
//console.log(`left wall ${leftWall}`);
leftWall.rotation.x = Math.PI;
leftWall.rotation.y = Math.PI / 2;
leftWall.rotation.z = -Math.PI;
leftWall.position.x = -49.5;
leftWall.position.y = 50 / 2;
scene.add(leftWall);

//Front Wall
const frontWallTexture = textureLoader.load(
  "/background/FrontFNF.png",
  () => {
    console.log("textureLoader: loading finished");
  },
  () => {
    console.log("textureLoader: loading progressing");
  },
  () => {
    console.log("textureLoader: loading error");
  }
);
const frontWallMaterial = new THREE.MeshStandardMaterial();
const frontWallGeometry = new THREE.PlaneBufferGeometry(100, 50, 100, 100);
const frontWall = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
//frontWallMaterial.side = THREE.DoubleSide;
frontWallTexture.wrapS = THREE.MirroredRepeatWrapping;
frontWallTexture.wrapT = THREE.MirroredRepeatWrapping;
frontWallTexture.repeat.x = 1;
frontWallTexture.repeat.y = 1;
frontWallMaterial.map = frontWallTexture;
frontWall.rotation.x = 0;
frontWall.rotation.y = 0;
frontWall.rotation.z = 0;
frontWall.position.x = 0;
frontWall.position.y = 50 / 2;
frontWall.position.z = -74.5;
scene.add(frontWall);

//Back Wall
const backWallTexture = textureLoader.load(
  "/background/backWallFullEditedTrim.png",
  () => {
    console.log("textureLoader: loading finished");
  },
  () => {
    console.log("textureLoader: loading progressing");
  },
  () => {
    console.log("textureLoader: loading error");
  }
);
const backWallMaterial = new THREE.MeshStandardMaterial();
const backWallGeometry = new THREE.PlaneBufferGeometry(100, 50, 100, 100);
const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
//backWallMaterial.side = THREE.DoubleSide;
backWallTexture.wrapS = THREE.MirroredRepeatWrapping;
backWallTexture.wrapT = THREE.MirroredRepeatWrapping;
backWallTexture.repeat.x = 1;
backWallTexture.repeat.y = 1;
backWallMaterial.map = backWallTexture;
backWall.rotation.x = 0;
backWall.rotation.y = Math.PI;
backWall.rotation.z = 0;
backWall.position.x = 0;
backWall.position.y = 50 / 2;
backWall.position.z = 174.5;
scene.add(backWall);
// // Object
// const boxGeometry = new THREE.BoxBufferGeometry(5, 5, 5);
// // const boxMaterial = new THREE.MeshBasicMaterial({ color: parameters.color });
// const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add(boxMesh);
// boxMesh.position.z = 47.5;
// boxMesh.position.y = 2.5;

// Line
const lineStart = new THREE.Vector3(-50, 0.2, -40);
const lineEnd = new THREE.Vector3(50, 0.2, -40);
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
//TREE
gltfLoader.load(
  // resource URL
  "/tree.glb",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    // tree = gltf.scene;
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.position.set(0, 1, -60);
    gltf.scene.rotation.y = Math.PI / 4;
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

//Guards
let guards;
let guardsClone;
gltfLoader.load(
  // resource URL
  "/Guards/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    guards = gltf.scene;
    guards.scale.set(7.5, 7.5, 7.5);
    guards.position.set(20, 0.5, -60);
    scene.add(guards);
    guardsClone = guards.clone();
    guardsClone.position.set(-20, 0.5, -60);
    scene.add(guardsClone);
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

//DOLL
let doll;
// Load a glTF resource
gltfLoader.load(
  // resource URL
  "/doll/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    doll = gltf.scene;
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.position.set(0, 4.75 * 2, -45);
    scene.add(gltf.scene);
    //lookBackward();
    //setTimeout(lookForward, 1000);
    startDoll();
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

function lookBackward() {
  if (doll) {
    // Check if the 3D model has finished loading
    gsap.to(doll.rotation, { duration: 0.5, y: -3.15 });
    setTimeout(() => (dollFacingBack = true), 150);
    // } else {
    //   console.warn('Doll model not loaded yet!');
  }
}

function lookForward() {
  if (doll) {
    // Check if the 3D model has finished loading
    gsap.to(doll.rotation, { duration: 0.5, y: 0 });
    setTimeout(() => (dollFacingBack = false), 450);
    // } else {
    //   console.warn('Doll model not loaded yet!');
  }
}
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function startDoll() {
  lookBackward();
  await delay(Math.random() * 2500 + 1000);
  //console.log(dollFacingBack);

  lookForward();
  await delay(Math.random() * 1000 + 750);
  //console.log(dollFacingBack);

  startDoll();
}
//lookBackward();
//lookForward();
// Load a glTF resource
//Soldier
gltfLoader.load(
  // resource URL
  "/Soldier.glb",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    gltf.scene.scale.set(5, 5, 5);
    gltf.scene.position.set(0, 0, 165);
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
    //scene.add(gltf.scene);
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
// let idleAction1;
// let walkAction1;
// let mixer1;
// let mixer2;
// //Player
// const fbxLoader = new FBXLoader();
// const idleLoader = fbxLoader;
// //loader.setPath("./resources/zombie/");
// idleLoader.load("/Player/Idle (1).fbx", (fbx) => {
//   console.log(fbx);
//   fbx.scale.setScalar(10);
//   fbx.traverse((c) => {
//     c.castShadow = true;
//   });
//   const animations = fbx.animations;
//   mixer1 = new THREE.AnimationMixer(fbx);
//   idleAction1 = mixer1.clipAction(animations[0]);
//   idleAction1.play();
//   scene.add(fbx);
// });
// const walkLoader = fbxLoader;
// //loader.setPath("./resources/zombie/");
// walkLoader.load("/Player/Walking.fbx", (walk) => {
//   console.log(walk);
//   walk.scale.setScalar(10);
//   walk.traverse((c) => {
//     c.castShadow = true;
//   });
//   const animations = walk.animations;
//   mixer2 = new THREE.AnimationMixer(walk);
//   walkAction1 = mixer2.clipAction(animations[0]);
//   walkAction1.play();
//   scene.add(walk);
// });
//Player
let mixer1;
let model1;
let modelReady = false;
const animationActions = [];
let activeAction;
let lastAction;
const fbxLoader = new FBXLoader();
fbxLoader.load(
  "/Player/Idle (1).fbx",
  (object) => {
    object.scale.set(5, 5, 5);
    object.position.set(0, 0, 165);
    //object.rotation.y = Math.PI;
    mixer1 = new THREE.AnimationMixer(object);
    const animationAction = mixer1.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    //animationsFolder.add(animations, "default");
    activeAction = animationActions[0];
    activeAction.play();
    model1 = object;
    scene.add(object);

    fbxLoader.load(
      "/Player/Walking.fbx",
      (object) => {
        console.log("loaded walk");

        const animationAction = mixer1.clipAction(object.animations[0]);
        animationActions.push(animationAction);
        //animationsFolder.add(animations, "samba");

        fbxLoader.load(
          "/Player/Running.fbx",
          (object) => {
            console.log("loaded run");
            const animationAction = mixer1.clipAction(object.animations[0]);
            animationActions.push(animationAction);
            //animationsFolder.add(animations, "bellydance");

            fbxLoader.load(
              "/Player/Victory.fbx",
              (object) => {
                console.log("loaded victory");
                //object.animations[0].tracks.shift();
                const animationAction = mixer1.clipAction(object.animations[0]);
                animationActions.push(animationAction);
                //animationsFolder.add(animations, "goofyrunning");

                fbxLoader.load(
                  "/Player/Zombie Dying.fbx",
                  (object) => {
                    console.log("loaded dead");
                    //object.animations[0].tracks.shift();
                    const animationAction = mixer1.clipAction(
                      object.animations[0]
                    );
                    animationActions.push(animationAction);
                    //animationsFolder.add(animations, "goofyrunning");

                    modelReady = true;
                  },
                  (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                  },
                  (error) => {
                    console.log(error);
                  }
                );
                modelReady = true;
              },
              (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
              },
              (error) => {
                console.log(error);
              }
            );
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);
const setAction = (toAction) => {
  if (toAction !== activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    lastAction.fadeOut(0.3);
    activeAction.reset();
    activeAction.fadeIn(0.3);
    activeAction.play();
  }
};

//Lights
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);
// Camera
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 185;
//camera.lookAt(mesh.position);
scene.add(camera);

//Orbit Controls
//const controls = new OrbitControls(camera, canvas);
//ontrols.enable = false;
//controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI({
  closed: false,
  width: 400,
});

// gui
//   .add(floorGeometry.parameters, "widthSegments")
//   .min(0)
//   .max(1000)
//   .step(0.0001);
// gui
//   .add(floorGeometry.parameters, "heightSegments")
//   .min(0)
//   .max(1000)
//   .step(0.0001);
//gui.add(floorMaterial, "aoMapIntensity").min(0).max(100).step(0.0001);
//gui.add(floorMaterial, "displacementScale").min(0).max(100).step(0.0001);
//gui.add(floorMaterial, "metalness").min(0).max(100).step(0.0001);
//gui.add(floorMaterial.normalScale, "y").min(0).max(100).step(0.0001);
//gui.add(floorMaterial.normalScale, "x").min(0).max(100).step(0.0001);
//gui.add(floorMaterial, "color").min(0).max(100).step(0.0001);
//gui.add(floorMaterial, "roughness").min(0).max(100).step(0.0001);
// gui.hide()
//gui.add(mesh.position, "y").min(-3).max(3).step(0.01).name("elevation");
//gui.add(mesh, "visible");
//gui.add(floorMaterial, "wireframe");

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

// Add Sky
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
let sky, sun;
sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

sun = new THREE.Vector3();

let turbidity = 10;
let rayleigh = 3;
let mieCoefficient = 0.01;
let mieDirectionalG = 0.99;
let elevation = 90 / 4;
let azimuth = 180 / 3;
let exposure = renderer.toneMappingExposure;
const uniforms = sky.material.uniforms;
uniforms["turbidity"].value = turbidity;
uniforms["rayleigh"].value = rayleigh;
uniforms["mieCoefficient"].value = mieCoefficient;
uniforms["mieDirectionalG"].value = mieDirectionalG;
renderer.toneMappingExposure = exposure;

const phi = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuth);

sun.setFromSphericalCoords(1, phi, theta);

uniforms["sunPosition"].value.copy(sun);

// Animate
const clock = new THREE.Clock();
console.log(clock);

//console.log(clock);

let movementSpeed = 0.1;
let mixerUpdated = false; // Add a flag to track if mixer.update has been called
let rotationAngle = 0; // Variable to store the desired rotation angle
let rotationAngle1 = Math.PI; // Variable to store the desired rotation angle
let angle = Math.PI;
let currentRotationAngle = 0;
let currentRotationAngle1 = Math.PI;
const tick = () => {
  //const elapsedTime = clock.getElapsedTime();
  const mixerUpdateDelta = clock.getDelta();
  //console.log(elapsedTime);

  // Update objects
  //mesh.rotation.y = elapsedTime;

  // Update position based on keys
  rotationAngle = 0; // Reset the rotation angle for each frame
  rotationAngle1 = Math.PI; // Reset the rotation angle for each frame

  // Update position based on keys

  // Check if Shift is pressed to determine if the character is running
  const isRunning =
    keys.shift && (keys.forward || keys.backward || keys.left || keys.right);
  const isWalking = keys.forward || keys.backward || keys.left || keys.right;
  const bothWS = keys.forward && keys.backward;
  const bothAD = keys.left && keys.right;
  if (isRunning && !bothWS && !bothAD) {
    if (!dollFacingBack) {
      console.log("you lose");
    }
    //walkAction.setEffectiveTimeScale(1.0);
    //mixer.stopAllAction();
    setAction(animationActions[2]);
    movementSpeed = 0.2;
    runAction.play();
    walkAction.stop();
    idleAction.stop();
    mixerUpdated = true; // Adjust the animation speed for running
  } else if (isWalking && !bothWS && !bothAD) {
    if (!dollFacingBack) {
      console.log("you lose");
    }
    setAction(animationActions[1]);
    walkAction.setEffectiveTimeScale(1.0);
    //mixer.stopAllAction();
    walkAction.play();
    runAction.stop();
    idleAction.stop();
    mixerUpdated = true; // Reset the animation speed for walking
  } else {
    //mixer.stopAllAction();
    setAction(animationActions[0]);
    idleAction.play();
    rotationAngle = currentRotationAngle;
    //rotationAngle = currentRotationAngle1;
    //rotationAngle1 = currentRotationAngle;
    rotationAngle1 = currentRotationAngle1;
    walkAction.stop();
    runAction.stop();
    mixerUpdated = true;
  }

  if (keys.forward && !bothWS && !bothAD) {
    //walkAction.play();
    //mixerUpdated = true;
    //model.rotation.set(0, 0, 0);
    model.position.z -= movementSpeed;
    model1.position.z -= movementSpeed;
    camera.position.z -= movementSpeed;
    //boxMesh.position.z -= movementSpeed;
    // Calculate the rotation angle based on the direction of movement
    if (keys.left) {
      rotationAngle += angle / -8; // Rotate -90 degrees if moving backward and left
      rotationAngle1 += angle / -8; // Rotate -90 degrees if moving backward and left
    } else if (keys.right) {
      rotationAngle += angle / 8; // Rotate 90 degrees if moving backward and right
      rotationAngle1 += angle / 8; // Rotate 90 degrees if moving backward and right
    } else {
      rotationAngle += angle * 2; // Rotate 180 degrees if moving backward without any lateral movement
      rotationAngle1 += angle * 2; // Rotate 180 degrees if moving backward without any lateral movement
    }
    //rotationAngle += angle * (keys.left ? -0.25 : 2);
    //rotationAngle1 += angle * (keys.left ? -0.25 : 2);
    //rotationAngle += angle * (keys.right ? 0.25 : 2);
    //rotationAngle1 += angle * (keys.right ? 0.25 : 2);
  }
  if (keys.backward && !bothWS && !bothAD) {
    //walkAction.play();
    //mixerUpdated = true;
    //model.rotation.set(0, Math.PI, 0);
    model.position.z += movementSpeed;
    model1.position.z += movementSpeed;
    camera.position.z += movementSpeed;
    //boxMesh.position.z += movementSpeed;
    // Calculate the rotation angle based on the direction of movement
    if (keys.left) {
      rotationAngle += angle / 4; // Rotate -90 degrees if moving backward and left
      rotationAngle1 += angle / 4; // Rotate -90 degrees if moving backward and left
    } else if (keys.right) {
      rotationAngle += angle / -4; // Rotate 90 degrees if moving backward and right
      rotationAngle1 += angle / -4; // Rotate 90 degrees if moving backward and right
    } else {
      rotationAngle += angle; // Rotate 180 degrees if moving backward without any lateral movement
      rotationAngle1 += angle; // Rotate 180 degrees if moving backward without any lateral movement
    }
    //rotationAngle += angle * (keys.left ? -0.75 : 1);
    //rotationAngle1 += angle * (keys.left ? -0.75 : 1);
    //rotationAngle += angle * (keys.right ? 0.75 : 1); // Rotate 180 degrees if moving backward
    //rotationAngle1 += angle * (keys.right ? 0.75 : 1); // Rotate 180 degrees if moving backward
  }
  if (keys.left && !bothWS && !bothAD) {
    //walkAction.play();
    //mixerUpdated = true;
    model.rotation.set(0, Math.PI / 2, 0);
    model.position.x -= movementSpeed;
    model1.rotation.set(0, Math.PI / 2, 0);
    model1.position.x -= movementSpeed;
    //boxMesh.position.x -= movementSpeed;
    rotationAngle += Math.PI / 2; // Rotate 90 degrees if moving left
    rotationAngle1 += Math.PI / 2; // Rotate 90 degrees if moving left
    camera.position.x -= movementSpeed;
  }
  if (keys.right && !bothWS && !bothAD) {
    //walkAction.play();
    //mixerUpdated = true;
    model.rotation.set(0, -Math.PI / 2, 0);
    model.position.x += movementSpeed;
    model1.rotation.set(0, -Math.PI / 2, 0);
    model1.position.x += movementSpeed;
    //boxMesh.position.x += movementSpeed;
    rotationAngle -= Math.PI / 2; // Rotate -90 degrees if moving right
    rotationAngle1 -= Math.PI / 2; // Rotate -90 degrees if moving right
    camera.position.x += movementSpeed;
  }

  // Apply the accumulated rotationAngle to the model
  // Apply the accumulated rotationAngle1 to the model
  model.rotation.set(0, rotationAngle, 0);
  //model.rotation.set(0, rotationAngle1, 0);
  //model1.rotation.set(0, rotationAngle, 0);
  model1.rotation.set(0, rotationAngle1, 0);
  // Save the current rotationAngle to be used when keys are released
  // Save the current rotationAngle1 to be used when keys are released
  currentRotationAngle = rotationAngle;
  //currentRotationAngle1 = rotationAngle;
  //currentRotationAngle = rotationAngle1;
  currentRotationAngle1 = rotationAngle1;

  if (mixerUpdated) {
    mixer.update(mixerUpdateDelta); // Call mixer.update only once if any key is pressed
    mixer1.update(mixerUpdateDelta);
    mixerUpdated = false; // Reset the flag for the next frame
  }
  //mixer2.update(mixerUpdateDelta);

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
    console.log("You Win");
  }
  // Call tick again on the next frame
  requestAnimationFrame(tick);

  // required if controls.enableDamping or controls.autoRotate are set to true
  //controls.update();

  // if (model && mixer) {
  // Update the animation mixer only when both 'model' and 'mixer' are defined
  //mixer.update(mixerUpdateDelta);
  // }

  // Render
  renderer.render(scene, camera);
};

//tick();
