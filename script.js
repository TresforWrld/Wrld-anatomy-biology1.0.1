// 3D Human Anatomy Explorer - Main JavaScript

class AnatomyExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.anatomyModels = {};
        this.currentSystem = 'all';
        this.selectedPart = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.labels = [];
        this.showLabels = true;
        this.showGrid = false;
        this.transparentMode = false;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.createAnatomyModels();
        this.animate();
        
        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loadingOverlay').style.display = 'none';
        }, 2000);
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Create camera
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 5, 10);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Additional light for better visibility
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
    }

    setupEventListeners() {
        // Mouse events for interaction
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));

        // System toggles
        document.querySelectorAll('.system-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const system = e.target.closest('.system-item').dataset.system;
                this.toggleSystem(system, e.target.checked);
            });
        });

        // View controls
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        document.getElementById('front-view').addEventListener('click', () => this.setView('front'));
        document.getElementById('back-view').addEventListener('click', () => this.setView('back'));
        document.getElementById('top-view').addEventListener('click', () => this.setView('top'));
        document.getElementById('side-view').addEventListener('click', () => this.setView('side'));

        // Display options
        document.getElementById('show-labels').addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.updateLabels();
        });

        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.toggleGrid();
        });

        document.getElementById('transparent-mode').addEventListener('change', (e) => {
            this.transparentMode = e.target.checked;
            this.updateTransparency();
        });

        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchAnatomy());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAnatomy();
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const system = e.target.getAttribute('href').substring(1);
                this.focusOnSystem(system);
            });
        });

        // Close info panel
        document.getElementById('closeInfo').addEventListener('click', () => {
            document.getElementById('infoPanel').style.display = 'none';
            this.selectedPart = null;
        });
    }

    createAnatomyModels() {
        // Skeletal System
        this.anatomyModels.skeletal = this.createSkeletalSystem();
        
        // Muscular System
        this.anatomyModels.muscular = this.createMuscularSystem();
        
        // Circulatory System
        this.anatomyModels.circulatory = this.createCirculatorySystem();
        
        // Nervous System
        this.anatomyModels.nervous = this.createNervousSystem();
        
        // Digestive System
        this.anatomyModels.digestive = this.createDigestiveSystem();
        
        // Respiratory System
        this.anatomyModels.respiratory = this.createRespiratorySystem();

        // Add all models to scene
        Object.values(this.anatomyModels).forEach(system => {
            system.forEach(part => this.scene.add(part.mesh));
        });

        // Create labels
        this.createLabels();
    }

    createSkeletalSystem() {
        const skeletalParts = [];

        // Skull
        const skullGeometry = new THREE.SphereGeometry(1, 32, 32);
        const skullMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.set(0, 6, 0);
        skull.userData = {
            name: 'Skull',
            system: 'skeletal',
            description: 'The skull protects the brain and forms the structure of the face.',
            function: 'Protection of brain, support for facial features',
            related: ['Mandible', 'Cervical Vertebrae']
        };
        skeletalParts.push({ mesh: skull, name: 'Skull' });

        // Spine
        for (let i = 0; i < 7; i++) {
            const vertebraGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
            const vertebraMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const vertebra = new THREE.Mesh(vertebraGeometry, vertebraMaterial);
            vertebra.position.set(0, 4.5 - i * 0.6, 0);
            vertebra.userData = {
                name: `Cervical Vertebra ${i + 1}`,
                system: 'skeletal',
                description: 'Cervical vertebrae support the neck and allow head movement.',
                function: 'Support head, enable neck movement',
                related: ['Skull', 'Thoracic Vertebrae']
            };
            skeletalParts.push({ mesh: vertebra, name: `C${i + 1}` });
        }

        // Rib cage
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const ribGeometry = new THREE.TorusGeometry(2, 0.1, 8, 16);
            const ribMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const rib = new THREE.Mesh(ribGeometry, ribMaterial);
            rib.position.set(0, 1, 0);
            rib.rotation.z = Math.PI / 2;
            rib.userData = {
                name: `Rib ${i + 1}`,
                system: 'skeletal',
                description: 'Ribs protect the thoracic organs and assist in breathing.',
                function: 'Protection, breathing assistance',
                related: ['Sternum', 'Thoracic Vertebrae']
            };
            skeletalParts.push({ mesh: rib, name: `Rib ${i + 1}` });
        }

        // Pelvis
        const pelvisGeometry = new THREE.BoxGeometry(3, 0.8, 2);
        const pelvisMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const pelvis = new THREE.Mesh(pelvisGeometry, pelvisMaterial);
        pelvis.position.set(0, -1, 0);
        pelvis.userData = {
            name: 'Pelvis',
            system: 'skeletal',
            description: 'The pelvis connects the spine to the lower limbs.',
            function: 'Support upper body, connect to legs',
            related: ['Lumbar Vertebrae', 'Femur']
        };
        skeletalParts.push({ mesh: pelvis, name: 'Pelvis' });

        return skeletalParts;
    }

    createMuscularSystem() {
        const muscularParts = [];

        // Biceps
        const bicepsGeometry = new THREE.CylinderGeometry(0.4, 0.3, 2, 16);
        const bicepsMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6B6B });
        const leftBiceps = new THREE.Mesh(bicepsGeometry, bicepsMaterial);
        leftBiceps.position.set(-2, 3, 0);
        leftBiceps.rotation.z = Math.PI / 2;
        leftBiceps.userData = {
            name: 'Biceps Brachii',
            system: 'muscular',
            description: 'The biceps is located in the upper arm and flexes the elbow.',
            function: 'Elbow flexion, forearm supination',
            related: ['Triceps', 'Brachialis']
        };
        muscularParts.push({ mesh: leftBiceps, name: 'Biceps' });

        const rightBiceps = new THREE.Mesh(bicepsGeometry, bicepsMaterial);
        rightBiceps.position.set(2, 3, 0);
        rightBiceps.rotation.z = Math.PI / 2;
        rightBiceps.userData = {
            name: 'Biceps Brachii',
            system: 'muscular',
            description: 'The biceps is located in the upper arm and flexes the elbow.',
            function: 'Elbow flexion, forearm supination',
            related: ['Triceps', 'Brachialis']
        };
        muscularParts.push({ mesh: rightBiceps, name: 'Biceps' });

        // Pectoral muscles
        const pectoralGeometry = new THREE.BoxGeometry(3, 0.5, 1);
        const pectoralMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6B6B });
        const pectorals = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectorals.position.set(0, 4, 0.5);
        pectorals.userData = {
            name: 'Pectoralis Major',
            system: 'muscular',
            description: 'Large chest muscle involved in shoulder movement.',
            function: 'Shoulder flexion, adduction, rotation',
            related: ['Serratus Anterior', 'Deltoid']
        };
        muscularParts.push({ mesh: pectorals, name: 'Pectorals' });

        return muscularParts;
    }

    createCirculatorySystem() {
        const circulatoryParts = [];

        // Heart
        const heartGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const heartMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.position.set(0, 2, 1);
        heart.scale.set(1, 1.2, 0.8);
        heart.userData = {
            name: 'Heart',
            system: 'circulatory',
            description: 'The heart pumps blood throughout the body.',
            function: 'Pump blood, circulate oxygen and nutrients',
            related: ['Lungs', 'Aorta', 'Vena Cava']
        };
        circulatoryParts.push({ mesh: heart, name: 'Heart' });

        // Major arteries
        const aortaGeometry = new THREE.CylinderGeometry(0.2, 0.15, 4, 8);
        const aortaMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const aorta = new THREE.Mesh(aortaGeometry, aortaMaterial);
        aorta.position.set(0, 2, 0);
        aorta.userData = {
            name: 'Aorta',
            system: 'circulatory',
            description: 'The largest artery carrying oxygenated blood from the heart.',
            function: 'Distribute oxygenated blood',
            related: ['Heart', 'Carotid Arteries']
        };
        circulatoryParts.push({ mesh: aorta, name: 'Aorta' });

        return circulatoryParts;
    }

    createNervousSystem() {
        const nervousParts = [];

        // Brain
        const brainGeometry = new THREE.SphereGeometry(0.9, 32, 32);
        const brainMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
        const brain = new THREE.Mesh(brainGeometry, brainMaterial);
        brain.position.set(0, 6.5, 0);
        brain.userData = {
            name: 'Brain',
            system: 'nervous',
            description: 'The brain is the center of the nervous system.',
            function: 'Control body functions, thinking, memory',
            related: ['Spinal Cord', 'Cranial Nerves']
        };
        nervousParts.push({ mesh: brain, name: 'Brain' });

        // Spinal cord
        const spinalCordGeometry = new THREE.CylinderGeometry(0.15, 0.15, 8, 8);
        const spinalCordMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
        const spinalCord = new THREE.Mesh(spinalCordGeometry, spinalCordMaterial);
        spinalCord.position.set(0, 1, 0);
        spinalCord.userData = {
            name: 'Spinal Cord',
            system: 'nervous',
            description: 'The spinal cord transmits signals between brain and body.',
            function: 'Signal transmission, reflex control',
            related: ['Brain', 'Peripheral Nerves']
        };
        nervousParts.push({ mesh: spinalCord, name: 'Spinal Cord' });

        return nervousParts;
    }

    createDigestiveSystem() {
        const digestiveParts = [];

        // Stomach
        const stomachGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const stomachMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA500 });
        const stomach = new THREE.Mesh(stomachGeometry, stomachMaterial);
        stomach.position.set(-0.5, 1, 0.5);
        stomach.scale.set(1, 1.2, 0.8);
        stomach.userData = {
            name: 'Stomach',
            system: 'digestive',
            description: 'The stomach breaks down food with acid and enzymes.',
            function: 'Food digestion, nutrient absorption',
            related: ['Esophagus', 'Small Intestine']
        };
        digestiveParts.push({ mesh: stomach, name: 'Stomach' });

        // Liver
        const liverGeometry = new THREE.BoxGeometry(2, 1, 1.5);
        const liverMaterial = new THREE.MeshPhongMaterial({ color: 0xFFA500 });
        const liver = new THREE.Mesh(liverGeometry, liverMaterial);
        liver.position.set(1, 1, 0);
        liver.userData = {
            name: 'Liver',
            system: 'digestive',
            description: 'The liver processes nutrients and detoxifies blood.',
            function: 'Detoxification, metabolism, bile production',
            related: ['Gallbladder', 'Pancreas']
        };
        digestiveParts.push({ mesh: liver, name: 'Liver' });

        return digestiveParts;
    }

    createRespiratorySystem() {
        const respiratoryParts = [];

        // Lungs
        const lungGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const lungMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });
        
        const leftLung = new THREE.Mesh(lungGeometry, lungMaterial);
        leftLung.position.set(-1, 2, 0);
        leftLung.scale.set(0.8, 1.2, 0.9);
        leftLung.userData = {
            name: 'Left Lung',
            system: 'respiratory',
            description: 'The left lung facilitates gas exchange.',
            function: 'Gas exchange, oxygen intake',
            related: ['Right Lung', 'Heart', 'Diaphragm']
        };
        respiratoryParts.push({ mesh: leftLung, name: 'Left Lung' });

        const rightLung = new THREE.Mesh(lungGeometry, lungMaterial);
        rightLung.position.set(1, 2, 0);
        rightLung.scale.set(0.8, 1.2, 0.9);
        rightLung.userData = {
            name: 'Right Lung',
            system: 'respiratory',
            description: 'The right lung facilitates gas exchange.',
            function: 'Gas exchange, oxygen intake',
            related: ['Left Lung', 'Heart', 'Diaphragm']
        };
        respiratoryParts.push({ mesh: rightLung, name: 'Right Lung' });

        return respiratoryParts;
    }

    createLabels() {
        // Create label sprites for anatomy parts
        Object.values(this.anatomyModels).forEach(system => {
            system.forEach(part => {
                const labelDiv = document.createElement('div');
                labelDiv.className = 'anatomy-label';
                labelDiv.textContent = part.name;
                labelDiv.style.position = 'absolute';
                labelDiv.style.background = 'rgba(0, 0, 0, 0.8)';
                labelDiv.style.color = 'white';
                labelDiv.style.padding = '4px 8px';
                labelDiv.style.borderRadius = '4px';
                labelDiv.style.fontSize = '12px';
                labelDiv.style.pointerEvents = 'none';
                labelDiv.style.display = this.showLabels ? 'block' : 'none';
                
                this.labels.push({
                    element: labelDiv,
                    mesh: part.mesh,
                    name: part.name
                });
            });
        });
    }

    updateLabels() {
        this.labels.forEach(label => {
            if (this.showLabels) {
                const vector = new THREE.Vector3();
                label.mesh.getWorldPosition(vector);
                vector.project(this.camera);

                const x = (vector.x * 0.5 + 0.5) * this.renderer.domElement.clientWidth;
                const y = (-vector.y * 0.5 + 0.5) * this.renderer.domElement.clientHeight;

                label.element.style.left = x + 'px';
                label.element.style.top = y + 'px';
                label.element.style.display = vector.z < 1 ? 'block' : 'none';
                
                if (!this.renderer.domElement.parentElement.contains(label.element)) {
                    this.renderer.domElement.parentElement.appendChild(label.element);
                }
            } else {
                label.element.style.display = 'none';
            }
        });
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const allMeshes = [];
        Object.values(this.anatomyModels).forEach(system => {
            system.forEach(part => {
                if (part.mesh.visible) {
                    allMeshes.push(part.mesh);
                }
            });
        });

        const intersects = this.raycaster.intersectObjects(allMeshes);

        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            this.selectAnatomyPart(selectedMesh);
        }
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.g