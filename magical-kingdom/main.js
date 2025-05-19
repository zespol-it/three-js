import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 10;
controls.maxDistance = 100;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Create castle
function createCastle() {
    const castle = new THREE.Group();

    // Main tower
    const towerGeometry = new THREE.CylinderGeometry(5, 6, 20, 8);
    const towerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.2,
        emissive: 0xffd700,
        emissiveIntensity: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 10;
    tower.castShadow = true;
    castle.add(tower);

    // Tower roof
    const roofGeometry = new THREE.ConeGeometry(6, 8, 8);
    const roofMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff69b4,
        metalness: 0.1,
        roughness: 0.2,
        emissive: 0xff69b4,
        emissiveIntensity: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 24;
    roof.castShadow = true;
    castle.add(roof);

    // Add smaller towers
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const smallTower = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2.5, 12, 8),
            towerMaterial
        );
        smallTower.position.set(
            Math.cos(angle) * 8,
            6,
            Math.sin(angle) * 8
        );
        smallTower.castShadow = true;
        castle.add(smallTower);

        const smallRoof = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 4, 8),
            roofMaterial
        );
        smallRoof.position.set(
            Math.cos(angle) * 8,
            14,
            Math.sin(angle) * 8
        );
        smallRoof.castShadow = true;
        castle.add(smallRoof);
    }

    // Add windows with magical glow
    const windowGeometry = new THREE.PlaneGeometry(1, 1.5);
    const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
            Math.cos(angle) * 5,
            10,
            Math.sin(angle) * 5
        );
        window.lookAt(0, 10, 0);
        castle.add(window);

        // Add window glow
        const glowGeometry = new THREE.PlaneGeometry(2, 3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(window.position);
        glow.lookAt(0, 10, 0);
        glow.position.z += 0.1;
        castle.add(glow);
    }

    // Add magical crystals
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0);
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00ffff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(
            Math.cos(angle) * 12,
            15,
            Math.sin(angle) * 12
        );
        crystal.scale.set(0.5, 1, 0.5);
        crystal.castShadow = true;
        castle.add(crystal);
    }

    return castle;
}

const castle = createCastle();
scene.add(castle);

// Create magical particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    const radius = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
    posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    posArray[i + 2] = radius * Math.cos(phi);

    // Magical colors (gold, silver, blue, pink)
    const colors = [
        [1, 0.84, 0],    // Gold
        [0.75, 0.75, 0.75], // Silver
        [0, 0.5, 1],     // Blue
        [1, 0.41, 0.7]   // Pink
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    colorArray[i] = color[0];
    colorArray[i + 1] = color[1];
    colorArray[i + 2] = color[2];
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Ground
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x90EE90,
    metalness: 0.1,
    roughness: 0.8
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Camera position
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Controls functionality
const sparkleIntensityControl = document.getElementById('sparkleIntensity');
const castleGlowControl = document.getElementById('castleGlow');
const floatSpeedControl = document.getElementById('floatSpeed');

sparkleIntensityControl.addEventListener('input', (e) => {
    particlesMaterial.opacity = parseFloat(e.target.value) * 0.8;
});

castleGlowControl.addEventListener('input', (e) => {
    const intensity = parseFloat(e.target.value);
    castle.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = intensity * 0.2;
        }
    });
});

floatSpeedControl.addEventListener('input', (e) => {
    floatSpeed = parseFloat(e.target.value);
});

let floatSpeed = 1;

// Add rainbow bridge
function createRainbowBridge() {
    const bridge = new THREE.Group();
    const segments = 20;
    const radius = 15;
    const height = 5;

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI;
        const nextAngle = ((i + 1) / segments) * Math.PI;
        
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(nextAngle) * radius;
        const z2 = Math.sin(nextAngle) * radius;

        const bridgeSegment = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))),
            new THREE.MeshPhysicalMaterial({
                color: new THREE.Color().setHSL(i / segments, 1, 0.5),
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.8,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            })
        );

        bridgeSegment.position.set(
            (x1 + x2) / 2,
            height * Math.sin(angle),
            (z1 + z2) / 2
        );
        bridgeSegment.rotation.y = Math.atan2(z2 - z1, x2 - x1);
        bridge.add(bridgeSegment);
    }

    return bridge;
}

const rainbowBridge = createRainbowBridge();
scene.add(rainbowBridge);

// Add magical portal
const portalGeometry = new THREE.RingGeometry(8, 10, 32);
const portalMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
});
const portal = new THREE.Mesh(portalGeometry, portalMaterial);
portal.rotation.x = Math.PI / 2;
portal.position.set(0, 0.1, 0);
scene.add(portal);

// Add magical butterflies
function createButterfly() {
    const butterfly = new THREE.Group();
    
    const wingGeometry = new THREE.PlaneGeometry(1, 1.5);
    const wingMaterial = new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.scale.x = -1;

    butterfly.add(leftWing);
    butterfly.add(rightWing);

    return butterfly;
}

const butterflies = [];
for (let i = 0; i < 20; i++) {
    const butterfly = createButterfly();
    butterfly.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 40
    );
    scene.add(butterfly);
    butterflies.push({
        mesh: butterfly,
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
    });
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Animate castle
    castle.rotation.y += 0.001 * floatSpeed;
    castle.position.y = Math.sin(Date.now() * 0.001) * 0.5 * floatSpeed;

    // Animate rainbow bridge
    rainbowBridge.rotation.y += 0.0005 * floatSpeed;
    rainbowBridge.children.forEach((segment, index) => {
        segment.material.color.setHSL(
            (index / rainbowBridge.children.length + Date.now() * 0.0001) % 1,
            1,
            0.5
        );
    });

    // Animate portal
    portal.rotation.z += 0.01 * floatSpeed;
    portal.material.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.2;

    // Animate butterflies
    butterflies.forEach(butterfly => {
        const time = Date.now() * butterfly.speed + butterfly.phase;
        butterfly.mesh.position.y += Math.sin(time) * 0.02 * floatSpeed;
        butterfly.mesh.rotation.y += 0.01 * floatSpeed;
        butterfly.mesh.children[0].rotation.z = Math.sin(time) * 0.5;
        butterfly.mesh.children[1].rotation.z = -Math.sin(time) * 0.5;
    });

    // Animate particles
    const positions = particlesGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Create a spiral motion
        const angle = Date.now() * 0.0005 * floatSpeed;
        const radius = Math.sqrt(x * x + z * z);
        const newAngle = Math.atan2(z, x) + 0.01 * floatSpeed;
        
        positions[i] = radius * Math.cos(newAngle);
        positions[i + 1] = y + Math.sin(Date.now() * 0.001 + i) * 0.02 * floatSpeed;
        positions[i + 2] = radius * Math.sin(newAngle);
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    controls.update();
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 