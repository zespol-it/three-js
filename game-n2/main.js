import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures
const textures = {
    metal: textureLoader.load('https://ambientcg.com/get/5e9c0c6c-8c3c-4c3c-8c3c-4c3c8c3c4c3c/1K/BaseColor.jpg'),
    grass: textureLoader.load('https://ambientcg.com/get/5e9c0c6c-8c3c-4c3c-8c3c-4c3c8c3c4c3c/1K/BaseColor.jpg'),
    dirt: textureLoader.load('https://ambientcg.com/get/5e9c0c6c-8c3c-4c3c-8c3c-4c3c8c3c4c3c/1K/BaseColor.jpg'),
    concrete: textureLoader.load('https://ambientcg.com/get/5e9c0c6c-8c3c-4c3c-8c3c-4c3c8c3c4c3c/1K/BaseColor.jpg'),
    glass: textureLoader.load('https://ambientcg.com/get/5e9c0c6c-8c3c-4c3c-8c3c-4c3c8c3c4c3c/1K/BaseColor.jpg')
};

// Configure texture repeat
textures.grass.wrapS = textures.grass.wrapT = THREE.RepeatWrapping;
textures.grass.repeat.set(25, 25);
textures.dirt.wrapS = textures.dirt.wrapT = THREE.RepeatWrapping;
textures.dirt.repeat.set(25, 25);

// Game state
let score = 0;
let health = 100;
let speed = 0;
let maxSpeed = 0.3;
let acceleration = 0.005;
let deceleration = 0.002;
let turnSpeed = 0.02;
let isGameOver = false;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Helicopter
function createHelicopter() {
    const heliGroup = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3498db, // Bright blue
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    heliGroup.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2ecc71, // Emerald green
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 1;
    cockpit.position.z = -0.5;
    cockpit.rotation.x = Math.PI;
    heliGroup.add(cockpit);
    
    // Main rotor
    const rotorGeometry = new THREE.BoxGeometry(6, 0.1, 0.5);
    const rotorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe74c3c, // Red
        shininess: 100
    });
    const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
    rotor.position.y = 1.5;
    heliGroup.add(rotor);
    
    // Tail rotor
    const tailRotorGeometry = new THREE.BoxGeometry(0.5, 0.1, 1);
    const tailRotor = new THREE.Mesh(tailRotorGeometry, rotorMaterial);
    tailRotor.position.set(0, 1, 2);
    heliGroup.add(tailRotor);
    
    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 0.5, 2);
    heliGroup.add(tail);
    
    // Landing skids
    const skidGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const skidMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf1c40f, // Yellow
        shininess: 100
    });
    
    const leftSkid = new THREE.Mesh(skidGeometry, skidMaterial);
    leftSkid.position.set(-1, 0, 0);
    leftSkid.rotation.z = Math.PI / 2;
    heliGroup.add(leftSkid);
    
    const rightSkid = new THREE.Mesh(skidGeometry, skidMaterial);
    rightSkid.position.set(1, 0, 0);
    rightSkid.rotation.z = Math.PI / 2;
    heliGroup.add(rightSkid);
    
    return heliGroup;
}

const helicopter = createHelicopter();
scene.add(helicopter);

// Terrain
function createTerrain() {
    const terrainGroup = new THREE.Group();
    
    // Base terrain
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2ecc71, // Emerald green
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    terrainGroup.add(ground);
    
    // Add some hills
    for (let i = 0; i < 20; i++) {
        const hillGeometry = new THREE.ConeGeometry(5 + Math.random() * 10, 5 + Math.random() * 10, 32);
        const hillMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x27ae60, // Darker green
            shininess: 30
        });
        const hill = new THREE.Mesh(hillGeometry, hillMaterial);
        
        hill.position.x = (Math.random() - 0.5) * 180;
        hill.position.z = (Math.random() - 0.5) * 180;
        hill.position.y = 0;
        
        hill.castShadow = true;
        hill.receiveShadow = true;
        terrainGroup.add(hill);
    }
    
    return terrainGroup;
}

const terrain = createTerrain();
scene.add(terrain);

// Enemy targets
const enemies = [];
function createEnemy(x, z) {
    const enemyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const enemyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe74c3c, // Red
        shininess: 100
    });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
    return enemy;
}

// Create some enemies
for (let i = 0; i < 10; i++) {
    createEnemy(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
}

// Projectiles
const projectiles = [];
function createProjectile() {
    const projectileGeometry = new THREE.SphereGeometry(0.2);
    const projectileMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf1c40f, // Yellow
        emissive: 0xf1c40f,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // Set initial position at helicopter's position
    projectile.position.copy(helicopter.position);
    projectile.position.y -= 0.5;
    
    // Set direction based on helicopter's rotation
    projectile.userData.velocity = new THREE.Vector3(
        Math.sin(helicopter.rotation.y),
        0,
        Math.cos(helicopter.rotation.y)
    ).multiplyScalar(0.5);
    
    scene.add(projectile);
    projectiles.push(projectile);
    return projectile;
}

// Camera setup
camera.position.set(0, 10, 20);
camera.lookAt(helicopter.position);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.target = helicopter.position;
controls.enablePan = false;

// Movement
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    space: false
};

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
    if (e.code === 'Space') {
        keys.space = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
    if (e.code === 'Space') {
        keys.space = false;
    }
});

// Game loop
function animate() {
    if (isGameOver) return;
    
    requestAnimationFrame(animate);
    
    // Get camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    cameraRight.normalize();
    
    // Helicopter movement relative to camera
    if (keys.w) {
        speed = Math.min(speed + acceleration, maxSpeed);
        helicopter.position.add(cameraDirection.clone().multiplyScalar(speed));
    } else if (keys.s) {
        speed = Math.max(speed - acceleration, -maxSpeed/2);
        helicopter.position.add(cameraDirection.clone().multiplyScalar(speed));
    } else {
        speed *= (1 - deceleration);
    }
    
    // Turning relative to camera
    if (Math.abs(speed) > 0.01) {
        if (keys.a) {
            helicopter.position.add(cameraRight.clone().multiplyScalar(speed * 0.5));
            helicopter.rotation.y = Math.atan2(
                cameraDirection.x - cameraRight.x,
                cameraDirection.z - cameraRight.z
            );
        }
        if (keys.d) {
            helicopter.position.add(cameraRight.clone().multiplyScalar(-speed * 0.5));
            helicopter.rotation.y = Math.atan2(
                cameraDirection.x + cameraRight.x,
                cameraDirection.z + cameraRight.z
            );
        }
    }
    
    // Keep helicopter above ground
    helicopter.position.y = Math.max(helicopter.position.y, 2);
    
    // Rotate main rotor
    helicopter.children[2].rotation.y += 0.2;
    
    // Shooting
    if (keys.space) {
        createProjectile();
    }
    
    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.position.add(projectile.userData.velocity);
        
        // Check for collisions with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (projectile.position.distanceTo(enemy.position) < 2) {
                scene.remove(enemy);
                enemies.splice(j, 1);
                scene.remove(projectile);
                projectiles.splice(i, 1);
                score += 100;
                break;
            }
        }
        
        // Remove projectiles that are too far
        if (projectile.position.distanceTo(helicopter.position) > 100) {
            scene.remove(projectile);
            projectiles.splice(i, 1);
        }
    }
    
    // Update camera
    controls.target.copy(helicopter.position);
    controls.update();
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start game
animate(); 