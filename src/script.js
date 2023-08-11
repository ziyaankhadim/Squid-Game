import "./style.css";
import * as THREE from "three";
//import { OrbitControls } from "three/examples/jsm/controls/Orbitcontrols.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Sky } from "three/examples/jsm/objects/Sky";
import gsap from "gsap";
import * as dat from "dat.gui";

let scene, renderer, camera;
let mixer;
let tree;
let dollFacingBack = false;
let textureRandom, colorTextureRandom;
let won = false;
let lost = false;
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
scene.background = new THREE.Color(0xadcbea); //.setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 5000);
//Grid Helper
//const gridHelper = new THREE.GridHelper(100);
//scene.add(gridHelper);

//Loading Mananger
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

/**
 * Textures
 */
textureRandom = Math.random() * 10 + 1;
colorTextureRandom = Math.random() * 10 + 2;
const textureLoader = new THREE.TextureLoader(loadingManager);

//Floor Texture
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

const aoTexture = textureLoader.load("/Dirt/dirt_floor_ao_1k.jpg");
const heightTexture = textureLoader.load("/Dirt/dirt_floor_disp_1k.png");

// Floor
const floorMaterial = new THREE.MeshStandardMaterial();
const floorGeometry = new THREE.PlaneBufferGeometry(100, 250, 100, 100);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floorMaterial.side = THREE.DoubleSide;
// floorGeometry.computeFaceNormals();
// floorGeometry.computeVertexNormals();
colorTexture.wrapS = THREE.MirroredRepeatWrapping;
colorTexture.wrapT = THREE.MirroredRepeatWrapping;
colorTexture.repeat.x = colorTextureRandom;
colorTexture.repeat.y = colorTextureRandom;
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
aoTexture.wrapS = THREE.MirroredRepeatWrapping;
aoTexture.wrapT = THREE.MirroredRepeatWrapping;
aoTexture.repeat.x = textureRandom;
aoTexture.repeat.y = textureRandom;
floorMaterial.aoMap = aoTexture;
floorMaterial.aoMapIntensity = 1.5;
//floorMaterial.normalMap = normalTexture;
floorMaterial.color = new THREE.Color(0xffffff);
floorMaterial.displacementMap = heightTexture;
//floorMaterial.roughnessMap = roughnessTexture;
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
    tree = gltf.scene;
    tree.scale.set(0.1, 0.1, 0.1);
    tree.position.set(0, 1, -60);
    tree.rotation.y = Math.PI / 4;
    scene.add(tree);
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
    guards = gltf.scene;
    guards.scale.set(7.5, 7.5, 7.5);
    guards.position.set(20, 0.3, -60);
    scene.add(guards);
    guardsClone = guards.clone();
    guardsClone.position.set(-20, 0.3, -60);
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
    //console.log(gltf);
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

  if (!won && !lost) {
    startDoll();
  }
}

//Player
let modelPlayer;
let modelPlayerReady = false;
const animationActions = [];
let activeAction;
let lastAction;
const fbxLoader = new FBXLoader();
fbxLoader.load(
  "/Player/Idle (1).fbx",
  (object) => {
    object.scale.set(5, 5, 5);
    object.position.set(0, 0, 160);
    mixer = new THREE.AnimationMixer(object);
    const animationAction = mixer.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    activeAction = animationActions[0];
    activeAction.play();
    modelPlayer = object;
    scene.add(object);

    fbxLoader.load(
      "/Player/Walking.fbx",
      (object) => {
        console.log("loaded walk");

        const animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);

        fbxLoader.load(
          "/Player/Running.fbx",
          (object) => {
            console.log("loaded run");
            const animationAction = mixer.clipAction(object.animations[0]);
            animationActions.push(animationAction);

            fbxLoader.load(
              "/Player/Victory.fbx",
              (object) => {
                console.log("loaded victory");
                const animationAction = mixer.clipAction(object.animations[0]);
                animationActions.push(animationAction);

                fbxLoader.load(
                  "/Player/Zombie Dying.fbx",
                  (object) => {
                    console.log("loaded dead");
                    const animationAction = mixer.clipAction(
                      object.animations[0]
                    );
                    animationActions.push(animationAction);
                    modelPlayerReady = true;
                    if (modelPlayerReady) {
                      document.querySelector(".parentLoader").style.display =
                        "none";
                      tick();
                    }
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

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // soft white light
scene.add(ambientLight);

const pointLightRight = new THREE.PointLight(0xffffbb, 50, 20, 2);
pointLightRight.position.set(22, 20, -55);
scene.add(pointLightRight);
const pointLightLeft = new THREE.PointLight(0xffffbb, 50, 20, 2);
pointLightLeft.position.set(-18, 20, -55);
scene.add(pointLightLeft);
// const sphereSize = 1;
// const pointLightHelperRight = new THREE.PointLightHelper(pointLightRight, sphereSize);
// scene.add(pointLightHelperRight);
// const pointLightHelperLeft = new THREE.PointLightHelper(pointLightLeft, sphereSize);
// scene.add(pointLightHelperLeft);

const directLight = new THREE.DirectionalLight(0xffffff, 0.75);
//const helper = new THREE.DirectionalLightHelper(directLight, 5);
//scene.add(helper);
directLight.position.set(2, 0.5, 1.5);
scene.add(directLight);

const light = new THREE.HemisphereLight(0xffffff, 0x080820, 2);
scene.add(light);

/**
 * Camera
 */
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 175;
//camera.lookAt(mesh.position);
scene.add(camera);

//Orbit Controls
//const controls = new OrbitControls(camera, canvas);
//controls.enable = false;
//controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI({
  hide: true,
  closed: false,
  width: 400,
});
gui.hide();

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
//renderer.toneMapping = THREE.ACESFilmicToneMapping;
//renderer.toneMappingExposure = 0.5;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 0.5;
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
//let exposure = renderer.toneMappingExposure;
const uniforms = sky.material.uniforms;
uniforms["turbidity"].value = turbidity;
uniforms["rayleigh"].value = rayleigh;
uniforms["mieCoefficient"].value = mieCoefficient;
uniforms["mieDirectionalG"].value = mieDirectionalG;
//renderer.toneMappingExposure = exposure;

const phi = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuth);

sun.setFromSphericalCoords(1, phi, theta);

uniforms["sunPosition"].value.copy(sun);

//Restart
document.querySelector(".restart").addEventListener("click", function () {
  modelPlayer.position.set(0, 0, 160);
  camera.position.set(0, 10, 175);
  won = false;
  lost = false;
  movementSpeed = 0.1;
  mixerUpdated = false;
  rotationAnglePlayer = Math.PI;
  angle = Math.PI;
  currentRotationAnglePlayer = Math.PI;
  startDoll();
  //console.log("restart pressed");
});

//Clock
const clock = new THREE.Clock();
//console.log(clock);

let movementSpeed = 0.1;
let mixerUpdated = false; // Add a flag to track if mixer.update has been called
let rotationAnglePlayer = Math.PI; // Variable to store the desired rotation angle
let angle = Math.PI;
let currentRotationAnglePlayer = Math.PI;
let xAxis, zAxis;

// Animate
const tick = () => {
  //const elapsedTime = clock.getElapsedTime();
  //console.log(elapsedTime);

  const mixerUpdateDelta = clock.getDelta();

  rotationAnglePlayer = Math.PI; // Reset the rotation angle for each frame

  // Check if Shift is pressed to determine if the character is running
  const isRunning =
    keys.shift && (keys.forward || keys.backward || keys.left || keys.right);
  const isWalking = keys.forward || keys.backward || keys.left || keys.right;
  const bothWS = keys.forward && keys.backward;
  const bothAD = keys.left && keys.right;
  if (!won && !lost) {
    if (isRunning && !bothWS && !bothAD) {
      if (!dollFacingBack) {
        lost = true;
        console.log("you lose");
      }
      setAction(animationActions[2]);
      movementSpeed = 0.2;
      mixerUpdated = true;
    } else if (isWalking && !bothWS && !bothAD) {
      if (!dollFacingBack) {
        lost = true;
        console.log("you lose");
      }
      setAction(animationActions[1]);
      movementSpeed = 0.1;
      mixerUpdated = true;
    } else {
      setAction(animationActions[0]);
      rotationAnglePlayer = currentRotationAnglePlayer;
      mixerUpdated = true;
    }
    if (keys.forward && !bothWS && !bothAD) {
      if (!(zAxis <= -73)) {
        zAxis = modelPlayer.position.z -= movementSpeed;
        camera.position.z -= movementSpeed;
      }
      if (keys.left) {
        rotationAnglePlayer += angle / -8;
      } else if (keys.right) {
        rotationAnglePlayer += angle / 8;
      } else {
        rotationAnglePlayer += angle * 2;
      }
    }
    if (keys.backward && !bothWS && !bothAD) {
      if (!(zAxis >= 160)) {
        zAxis = modelPlayer.position.z += movementSpeed;
        camera.position.z += movementSpeed;
      }
      if (keys.left) {
        rotationAnglePlayer += angle / 4;
      } else if (keys.right) {
        rotationAnglePlayer += angle / -4;
      } else {
        rotationAnglePlayer += angle;
      }
    }
    if (keys.left && !bothWS && !bothAD) {
      modelPlayer.rotation.set(0, Math.PI / 2, 0);
      rotationAnglePlayer += Math.PI / 2;
      if (!(xAxis <= -48)) {
        xAxis = modelPlayer.position.x -= movementSpeed;
        camera.position.x -= movementSpeed;
      }
    }
    if (keys.right && !bothWS && !bothAD) {
      modelPlayer.rotation.set(0, -Math.PI / 2, 0);
      rotationAnglePlayer -= Math.PI / 2;
      if (!(xAxis >= 48)) {
        xAxis = modelPlayer.position.x += movementSpeed;
        camera.position.x += movementSpeed;
      }
    }

    modelPlayer.rotation.set(0, rotationAnglePlayer, 0);
    currentRotationAnglePlayer = rotationAnglePlayer;
  }
  if (lost) {
    setAction(animationActions[4]);
    //animationActions[4].reset();
    animationActions[4].setLoop(THREE.LoopOnce);
    animationActions[4].clampWhenFinished = true;
    animationActions[4].enable = true;
    mixerUpdated = true;
  }
  if (won) {
    setAction(animationActions[3]);
    //animationActions[4].reset();
    animationActions[3].setLoop(THREE.LoopOnce);
    animationActions[3].clampWhenFinished = true;
    animationActions[3].enable = true;
    mixerUpdated = true;
  }
  if (mixerUpdated) {
    mixer.update(mixerUpdateDelta);
    mixerUpdated = false; // Reset the flag for the next frame
  }

  raycaster.set(modelPlayer.position, rayDirection);

  // Check if the ray intersects the line
  const intersects = raycaster.intersectObject(line);
  //console.log(intersects);

  if (intersects.length > 0 && !won) {
    won = true;
    modelPlayer.rotation.set(0, 0, 0);
    console.log("You Win");
  }
  // Call tick again on the next frame
  requestAnimationFrame(tick);

  // Required if controls.enableDamping or controls.autoRotate are set to true
  //controls.update();

  // if (model && mixer) {
  // Update the animation mixer only when both 'model' and 'mixer' are defined
  //mixer.update(mixerUpdateDelta);
  // }

  // Render
  renderer.render(scene, camera);
};

//tick();
