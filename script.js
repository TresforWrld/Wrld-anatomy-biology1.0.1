// script.js

// Scene, Camera, Renderer
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

let camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 3);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controls
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// GLTF Loader
let loader = new THREE.GLTFLoader();
const loadingOverlay = document.getElementById('loadingOverlay');

// List of systems and model files (AnatomyTOOL hosted GLBs)
const systems = {
    skeletal: 'https://anatomytool.org/open3dmodel/models/skeleton.glb',
    muscular: 'https://anatomytool.org/open3dmodel/models/muscles.glb',
    circulatory: 'https://anatomytool.org/open3dmodel/models/circulatory.glb',
    nervous: 'https://anatomytool.org/open3dmodel/models/nervous.glb',
    digestive: 'https://anatomytool.org/open3dmodel/models/digestive.glb',
    respiratory: 'https://anatomytool.org/open3dmodel/models/respiratory.glb'
};

let loadedModels = {};

// Function to load a system
function loadSystem(name, path) {
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            function (gltf) {
                gltf.scene.name = name;
                scene.add(gltf.scene);
                loadedModels[name] = gltf.scene;
                resolve();
            },
            function (xhr) {
                // Optional: progress logging
                // console.log(`${name}: ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`);
            },
            function (error) {
                console.error(`Error loading ${name}:`, error);
                resolve(); // Resolve anyway so spinner won't stay forever
            }
        );
    });
}

// Load all systems
async function loadAllSystems() {
    let promises = [];
    for (let [name, path] of Object.entries(systems)) {
        promises.push(loadSystem(name, path));
    }
    await Promise.all(promises);
    // Hide overlay after all finished
    loadingOverlay.style.display = 'none';
}
loadAllSystems();

// Checkbox toggles
document.querySelectorAll('.system-item input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
        const systemName = e.target.closest('.system-item').dataset.system;
        if (loadedModels[systemName]) {
            loadedModels[systemName].visible = e.target.checked;
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();