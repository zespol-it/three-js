import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Materials
const wallsMaterial = new THREE.MeshStandardMaterial({ color: '#E0E0E0' });
const roofMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' });
const doorMaterial = new THREE.MeshStandardMaterial({ color: '#4A4A4A' });
const windowsMaterial = new THREE.MeshStandardMaterial({ color: '#87CEEB' });
const chimneyMaterial = new THREE.MeshStandardMaterial({ color: '#A52A2A' });

// Create house elements
function createHouse() {
    const house = new THREE.Group();

    // Main walls
    const wallsGeometry = new THREE.BoxGeometry(10, 8, 8);
    const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
    walls.position.y = 4;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Door
    const doorGeometry = new THREE.PlaneGeometry(2, 4);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, 4.01);
    house.add(door);

    // Windows
    const windowGeometry = new THREE.PlaneGeometry(2, 2);
    
    // Front windows
    const window1 = new THREE.Mesh(windowGeometry, windowsMaterial);
    window1.position.set(-3, 5, 4.01);
    house.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowsMaterial);
    window2.position.set(3, 5, 4.01);
    house.add(window2);

    // Side windows
    const window3 = new THREE.Mesh(windowGeometry, windowsMaterial);
    window3.position.set(5.01, 5, 0);
    window3.rotation.y = Math.PI / 2;
    house.add(window3);

    const window4 = new THREE.Mesh(windowGeometry, windowsMaterial);
    window4.position.set(-5.01, 5, 0);
    window4.rotation.y = Math.PI / 2;
    house.add(window4);

    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(1, 3, 1);
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(3, 11, 2);
    chimney.castShadow = true;
    house.add(chimney);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: '#90EE90',
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(house);
    return house;
}

const house = createHouse();

// Color picker functionality
const wallsColorPicker = document.getElementById('walls-color');
const roofColorPicker = document.getElementById('roof-color');
const doorColorPicker = document.getElementById('door-color');
const windowsColorPicker = document.getElementById('windows-color');
const chimneyColorPicker = document.getElementById('chimney-color');

wallsColorPicker.addEventListener('input', (e) => {
    wallsMaterial.color.set(e.target.value);
});

roofColorPicker.addEventListener('input', (e) => {
    roofMaterial.color.set(e.target.value);
});

doorColorPicker.addEventListener('input', (e) => {
    doorMaterial.color.set(e.target.value);
});

windowsColorPicker.addEventListener('input', (e) => {
    windowsMaterial.color.set(e.target.value);
});

chimneyColorPicker.addEventListener('input', (e) => {
    chimneyMaterial.color.set(e.target.value);
});

// Camera position
camera.position.set(15, 10, 15);
camera.lookAt(0, 0, 0);

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 