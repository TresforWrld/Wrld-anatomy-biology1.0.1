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

// Raycaster and mouse for clicks
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Tooltip and info panel
const tooltip = document.getElementById('tooltip');
const infoPanel = document.getElementById('infoPanel');
const partNameEl = document.getElementById('partName');
const partDescriptionEl = document.getElementById('partDescription');
const partFunctionEl = document.getElementById('partFunction');
const partRelatedEl = document.getElementById('partRelated');
const closeInfoBtn = document.getElementById('closeInfo');

closeInfoBtn.addEventListener('click', () => {
    infoPanel.style.display = 'none';
});

// Anatomy systems with local GLB links
const systems = {
    fullbody: 'models/human-anatomy.glb',       // your full human anatomy model
    heart: 'models/realistic_human_heart.glb'  // your heart model
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

                // Make every child clickable
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.userData = {
                            name: child.name || name,
                            description: `This is the ${child.name || name}.`,
                            function: 'Function information here.',
                            related: ['Related parts here.']
                        };
                        child.material.transparent = false; // ensure visible
                    }
                });

                resolve();
            },
            function (xhr) {},
            function (error) {
                console.error(`Error loading ${name}:`, error);
                resolve();
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

// Handle clicks
renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
        Object.values(loadedModels).flatMap(model => model.children),
        true
    );

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const data = mesh.userData;

        // Show tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
        tooltip.innerHTML = data.name;

        // Show info panel
        infoPanel.style.display = 'block';
        partNameEl.textContent = data.name;
        partDescriptionEl.textContent = data.description;
        partFunctionEl.textContent = data.function;
        partRelatedEl.innerHTML = data.related.map(r => `<li>${r}</li>`).join('');
    } else {
        tooltip.style.display = 'none';
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();