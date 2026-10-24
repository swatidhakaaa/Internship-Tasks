// --- Scene, Camera, and Renderer Setup ---
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(7, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- Orbit Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't allow camera below floor
controls.minDistance = 3;
controls.maxDistance = 20;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
sunLight.position.set(10, 15, 8);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 30;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
fillLight.position.set(-10, 8, -5);
scene.add(fillLight);

// --- Materials ---
const concreteMaterial = new THREE.MeshStandardMaterial({
  color: 0xd0d0d0,
  roughness: 0.5,
  metalness: 0.1
});

const steelMaterial = new THREE.MeshStandardMaterial({
  color: 0x22252a,
  roughness: 0.3,
  metalness: 0.85
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.35,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.9,
  ior: 1.5,
  reflectivity: 0.9,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});

const pinMaterial = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  roughness: 0.2,
  metalness: 0.9
});

// --- Staircase Group ---
const staircaseGroup = new THREE.Group();

const stepCount = 12;
const stepWidth = 2.4;
const stepDepth = 0.7;
const stepHeight = 0.14;
const stepRise = 0.32;
const stepRun = 0.45;

// 1. Concrete Treads
const treadGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);

for (let i = 0; i < stepCount; i++) {
  const tread = new THREE.Mesh(treadGeometry, concreteMaterial);
  tread.position.set(0, i * stepRise, i * stepRun);
  tread.castShadow = true;
  tread.receiveShadow = true;
  staircaseGroup.add(tread);

  // Standoff pins on the side of each tread
  for (let side of [-1, 1]) {
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 16);
    pinGeo.rotateZ(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, pinMaterial);
    pin.position.set(
      side * (stepWidth / 2 + 0.03),
      i * stepRise,
      i * stepRun
    );
    staircaseGroup.add(pin);
  }
}

// 2. Central Steel Stringer (Spine)
const totalLength = Math.sqrt(
  Math.pow(stepCount * stepRun, 2) + Math.pow(stepCount * stepRise, 2)
);
const stringerAngle = Math.atan2(stepCount * stepRise, stepCount * stepRun);
const stringerGeometry = new THREE.BoxGeometry(0.3, 0.2, totalLength);

const stringer = new THREE.Mesh(stringerGeometry, steelMaterial);
stringer.rotation.x = stringerAngle;
stringer.position.set(
  0,
  (stepCount * stepRise) / 2 - 0.2,
  (stepCount * stepRun) / 2 - 0.1
);
stringer.castShadow = true;
stringer.receiveShadow = true;
staircaseGroup.add(stringer);

// 3. Glass Balustrades (Left & Right)
const glassLength = totalLength + 0.5;
const glassHeight = 1.1;
const glassGeometry = new THREE.BoxGeometry(0.02, glassHeight, glassLength);

for (let side of [-1, 1]) {
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.rotation.x = stringerAngle;
  glass.position.set(
    side * (stepWidth / 2 + 0.06),
    (stepCount * stepRise) / 2 + 0.4,
    (stepCount * stepRun) / 2 - 0.1
  );
  staircaseGroup.add(glass);

  // Top Handrail
  const railGeo = new THREE.CylinderGeometry(0.025, 0.025, glassLength, 16);
  const rail = new THREE.Mesh(railGeo, steelMaterial);
  rail.rotation.x = Math.PI / 2 + stringerAngle;
  rail.position.set(
    side * (stepWidth / 2 + 0.06),
    (stepCount * stepRise) / 2 + 0.95,
    (stepCount * stepRun) / 2 - 0.1
  );
  staircaseGroup.add(rail);
}

// 4. Floor Grid Plane
const gridHelper = new THREE.GridHelper(20, 20, 0x38bdf8, 0x334155);
gridHelper.position.y = -0.08;
scene.add(gridHelper);

// Center group in scene
staircaseGroup.position.set(0, 0, - (stepCount * stepRun) / 3);
scene.add(staircaseGroup);

// --- Target point for controls ---
controls.target.set(0, (stepCount * stepRise) / 2, 0);

// --- Window Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();