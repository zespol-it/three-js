import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb3e0ff);
scene.fog = new THREE.FogExp2(0xb3e0ff, 0.008);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.target.set(0, 0, 0);

document.body.addEventListener('click', () => {
    controls.lock();
});

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(30, 50, 30);
dirLight.castShadow = true;
scene.add(dirLight);

// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshPhysicalMaterial({ color: 0x90ee90, roughness: 0.8 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// ZAMEK KSIĘŻNICZKI
function createCastle() {
    const group = new THREE.Group();
    // Główna wieża
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 5, 18, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xffb6c1, metalness: 0.2, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 0xffe4ec, emissiveIntensity: 0.3 })
    );
    tower.position.y = 9;
    group.add(tower);
    // Dach
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(6, 6, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xff69b4, metalness: 0.3, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1 })
    );
    roof.position.y = 18;
    group.add(roof);
    // Małe wieżyczki + serduszka + flagi
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const tw = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.5, 8, 8),
            new THREE.MeshPhysicalMaterial({ color: 0xffb6c1, clearcoat: 1, clearcoatRoughness: 0.1 })
        );
        tw.position.set(Math.cos(angle)*7, 4, Math.sin(angle)*7);
        group.add(tw);
        const twRoof = new THREE.Mesh(
            new THREE.ConeGeometry(2, 3, 8),
            new THREE.MeshPhysicalMaterial({ color: 0xff69b4, clearcoat: 1, clearcoatRoughness: 0.1 })
        );
        twRoof.position.set(Math.cos(angle)*7, 8.5, Math.sin(angle)*7);
        group.add(twRoof);
        // Serduszko
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.2);
        heartShape.bezierCurveTo(0, 0.4, 0.4, 0.4, 0.4, 0.2);
        heartShape.bezierCurveTo(0.4, 0, 0, -0.2, 0, -0.4);
        heartShape.bezierCurveTo(0, -0.2, -0.4, 0, -0.4, 0.2);
        heartShape.bezierCurveTo(-0.4, 0.4, 0, 0.4, 0, 0.2);
        const heartGeom = new THREE.ShapeGeometry(heartShape);
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
        const heart = new THREE.Mesh(heartGeom, heartMat);
        heart.position.set(Math.cos(angle)*7, 12, Math.sin(angle)*7);
        heart.scale.set(0.7, 0.7, 0.7);
        heart.rotation.x = -Math.PI/2;
        group.add(heart);
        // Flaga
        const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 0.4),
            new THREE.MeshBasicMaterial({ color: [0xffe4e1,0x87cefa,0xfff176,0xb39ddb][i], side: THREE.DoubleSide })
        );
        flag.position.set(Math.cos(angle)*7, 12.7, Math.sin(angle)*7);
        flag.rotation.y = angle + Math.PI/2;
        group.add(flag);
    }
    // Girlanda (kolorowe kulki)
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const bead = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshPhysicalMaterial({ color: [0xff69b4,0x87cefa,0xfff176,0xb39ddb,0x90ee90][i%5] })
        );
        bead.position.set(Math.cos(angle)*8.2, 7.5 + Math.sin(angle*2)*0.5, Math.sin(angle)*8.2);
        group.add(bead);
    }
    // Most
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.5, 8),
        new THREE.MeshPhysicalMaterial({ color: 0xf8bbd0 })
    );
    bridge.position.set(0, 0.5, 7);
    group.add(bridge);
    // Magiczna poświata
    const glowGeom = new THREE.RingGeometry(10, 13, 64);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.y = 0.1;
    glow.rotation.x = -Math.PI/2;
    group.add(glow);
    group.position.set(0, 0, 0);
    return group;
}
const castle = createCastle();
castle.position.set(-30, 0, 0);
scene.add(castle);

// SMOK
function createDragon() {
    const group = new THREE.Group();
    // Tułów
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(2, 7, 8, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x4bce4b, metalness: 0.3, roughness: 0.4 })
    );
    body.position.y = 3;
    group.add(body);
    // Głowa
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x4bce4b })
    );
    head.position.set(0, 5, 4.5);
    group.add(head);
    // Oczy
    for (let i = -1; i <= 1; i += 2) {
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshPhysicalMaterial({ color: 0x000000 })
        );
        eye.position.set(0.4*i, 5.5, 5.3);
        group.add(eye);
    }
    // Skrzydła
    for (let i = -1; i <= 1; i += 2) {
        const wing = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 3, 7),
            new THREE.MeshPhysicalMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 })
        );
        wing.position.set(2.5*i, 6, 1);
        wing.rotation.z = i * Math.PI/6;
        group.add(wing);
    }
    // Ogon
    const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.7, 7, 8),
        new THREE.MeshPhysicalMaterial({ color: 0x4bce4b })
    );
    tail.position.set(0, 2, -5.5);
    tail.rotation.x = -Math.PI/6;
    group.add(tail);
    group.position.set(-12, 0, 10);
    return group;
}
const dragon = createDragon();
dragon.position.set(0, 0, 30);
scene.add(dragon);

// KARUZELA
function createCarousel() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.5, 32), new THREE.MeshPhysicalMaterial({ color: 0xffe4e1 }));
    base.position.y = 0.25;
    group.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.2, 32), new THREE.MeshPhysicalMaterial({ color: 0xff69b4 }));
    roof.position.y = 2.2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 16), new THREE.MeshPhysicalMaterial({ color: 0xffff00 }));
    pole.position.y = 1.25;
    group.add(pole);
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const horse = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.15), new THREE.MeshPhysicalMaterial({ color: [0xffd700,0x87cefa,0xff69b4,0x90ee90,0xff6347][i] }));
        horse.position.set(Math.cos(angle)*2, 0.6, Math.sin(angle)*2);
        group.add(horse);
    }
    group.position.set(30, 0, 0);
    return group;
}
const carousel = createCarousel();
scene.add(carousel);

// DWIE KSIĘŻNICZKI
function createPrincess(colorDress, colorHair, pos) {
    const princess = new THREE.Group();
    const dress = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), new THREE.MeshPhysicalMaterial({ color: colorDress, metalness: 0.3, roughness: 0.5 }));
    dress.position.y = 1;
    princess.add(dress);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0xffe0bd }));
    head.position.y = 2.3;
    princess.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7), new THREE.MeshPhysicalMaterial({ color: colorHair }));
    hair.position.y = 2.15;
    princess.add(hair);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 8), new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.2 }));
    crown.position.y = 3.1;
    princess.add(crown);
    princess.position.copy(pos);
    return princess;
}
// KSIĘŻNICZKI - ścieżki
const princessPaths = [
    [new THREE.Vector3(-2,0,7), new THREE.Vector3(0,0,0), new THREE.Vector3(20,0,20), new THREE.Vector3(0,0,0), new THREE.Vector3(-2,0,7)],
    [new THREE.Vector3(2,0,7), new THREE.Vector3(0,0,0), new THREE.Vector3(-20,0,-20), new THREE.Vector3(0,0,0), new THREE.Vector3(2,0,7)]
];
let princesses = [
    createPrincess(0xff69b4, 0xf1c40f, princessPaths[0][0].clone()),
    createPrincess(0x87cefa, 0x8b4513, princessPaths[1][0].clone())
];
princesses.forEach(p=>scene.add(p));

// KOTKI
function createCat(position, color) {
    const cat = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshPhysicalMaterial({ color }));
    body.position.y = 0.3;
    cat.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshPhysicalMaterial({ color }));
    head.position.y = 0.6;
    cat.add(head);
    for (let i = -1; i <= 1; i += 2) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 8), new THREE.MeshPhysicalMaterial({ color }));
        ear.position.set(i * 0.11, 0.78, 0);
        cat.add(ear);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), new THREE.MeshPhysicalMaterial({ color }));
    tail.position.set(0, 0.3, -0.25);
    tail.rotation.x = Math.PI / 4;
    cat.add(tail);
    cat.position.copy(position);
    return cat;
}
scene.add(createCat(new THREE.Vector3(-6, 0, 5), 0x222222));
scene.add(createCat(new THREE.Vector3(8, 0, -8), 0xffe4b5));
scene.add(createCat(new THREE.Vector3(12, 0, 12), 0xff69b4));

// ZJEŻDŻALNIA
function createSlide() {
    const group = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 7, 18),
        new THREE.Vector3(-7, 5, 15),
        new THREE.Vector3(-4, 3, 12),
        new THREE.Vector3(-2, 1, 10),
        new THREE.Vector3(0, 0, 8)
    ]);
    const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.7, 16, false);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x00c3ff, metalness: 0.3, roughness: 0.2, clearcoat: 1.0 });
    const slide = new THREE.Mesh(tubeGeometry, tubeMaterial);
    slide.castShadow = true;
    group.add(slide);
    // Poręcz
    const railCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-9.5, 7.7, 18.5),
        new THREE.Vector3(-6.5, 5.7, 15.5),
        new THREE.Vector3(-3.5, 3.7, 12.5),
        new THREE.Vector3(-1.5, 1.7, 10.5),
        new THREE.Vector3(0.5, 0.7, 8.5)
    ]);
    const railGeometry = new THREE.TubeGeometry(railCurve, 50, 0.15, 8, false);
    const railMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff69b4, metalness: 0.5, roughness: 0.2 });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    group.add(rail);
    return group;
}
const slide = createSlide();
slide.position.set(0, 0, -30);
scene.add(slide);

// PTASZKI
function createBird(position, color) {
    const bird = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshPhysicalMaterial({ color }));
    body.position.y = 0.15;
    bird.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshPhysicalMaterial({ color }));
    head.position.y = 0.28;
    bird.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 8), new THREE.MeshPhysicalMaterial({ color: 0xffa500 }));
    beak.position.set(0, 0.28, 0.11);
    beak.rotation.x = Math.PI / 2;
    bird.add(beak);
    bird.position.copy(position);
    return bird;
}
scene.add(createBird(new THREE.Vector3(0, 8, 0), 0xffff00)); // na wieży zamku
scene.add(createBird(new THREE.Vector3(-12, 2, 10), 0x87ceeb)); // przy smoku
scene.add(createBird(new THREE.Vector3(15, 2, -10), 0xff6347)); // przy karuzeli
// Latające ptaszki
const flyingBirds = [];
for (let i = 0; i < 4; i++) {
    const bird = createBird(new THREE.Vector3(Math.cos(i/4*Math.PI*2)*10, 10+Math.sin(i), Math.sin(i/4*Math.PI*2)*10), 0xffffff);
    scene.add(bird);
    flyingBirds.push({ mesh: bird, speed: Math.random()*0.01+0.005, phase: Math.random()*Math.PI*2 });
}

// CHMURKI
function createCloud(pos, scale=1) {
    const group = new THREE.Group();
    for(let i=0;i<3;i++) {
        const cloud = new THREE.Mesh(
            new THREE.SphereGeometry(1.2+Math.random()*0.7, 16, 16),
            new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.7, transparent: true, opacity: 0.85 })
        );
        cloud.position.set(i*1.1, Math.random()*0.5, Math.random()*0.7);
        group.add(cloud);
    }
    group.position.copy(pos);
    group.scale.set(scale,scale,scale);
    return group;
}
scene.add(createCloud(new THREE.Vector3(7,14,0),1.2));
scene.add(createCloud(new THREE.Vector3(-8,16,4),1.5));
scene.add(createCloud(new THREE.Vector3(0,18,-7),1.1));

// TĘCZOWY MOST
function createRainbowBridge() {
    const group = new THREE.Group();
    const segments = 32;
    const radius = 13;
    const height = 6;
    const rainbowColors = [0xff1744,0xff9100,0xffea00,0x00e676,0x2979ff,0xc51162];
    for(let i=0;i<segments;i++) {
        const angle = (i/segments)*Math.PI;
        const nextAngle = ((i+1)/segments)*Math.PI;
        const x1 = Math.cos(angle)*radius;
        const z1 = Math.sin(angle)*radius;
        const x2 = Math.cos(nextAngle)*radius;
        const z2 = Math.sin(nextAngle)*radius;
        const seg = new THREE.Mesh(
            new THREE.BoxGeometry(1,0.4,Math.sqrt((x2-x1)**2+(z2-z1)**2)),
            new THREE.MeshPhysicalMaterial({ color: rainbowColors[i%rainbowColors.length], metalness: 0.7, roughness: 0.2 })
        );
        seg.position.set((x1+x2)/2, height+Math.sin(angle)*2, (z1+z2)/2);
        seg.rotation.y = Math.atan2(z2-z1, x2-x1);
        group.add(seg);
    }
    return group;
}
const rainbowBridge = createRainbowBridge();
rainbowBridge.position.set(-15, 0, 15);
scene.add(rainbowBridge);

// FONTANNA
function createFountain() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.5, 0.7, 32), new THREE.MeshPhysicalMaterial({ color: 0x90caf9 }));
    base.position.y = 0.35;
    group.add(base);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.3, 32), new THREE.MeshPhysicalMaterial({ color: 0x40c4ff, transparent: true, opacity: 0.7 }));
    water.position.y = 0.7;
    group.add(water);
    return group;
}
const fountain = createFountain();
fountain.position.set(0, 0, 0);
scene.add(fountain);

// DOMKI
function createHouse(pos, color=0xffe082) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshPhysicalMaterial({ color }));
    base.position.y = 1;
    group.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.5, 8), new THREE.MeshPhysicalMaterial({ color: 0xff7043 }));
    roof.position.y = 2.75;
    group.add(roof);
    group.position.copy(pos);
    return group;
}
scene.add(createHouse(new THREE.Vector3(-20,0,20),0xffe082));
scene.add(createHouse(new THREE.Vector3(20,0,20),0xb2dfdb));
scene.add(createHouse(new THREE.Vector3(-20,0,-20),0xfff176));
scene.add(createHouse(new THREE.Vector3(20,0,-20),0xd1c4e9));

// DRZEWA
function createTree(pos) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,2,8), new THREE.MeshPhysicalMaterial({ color: 0x8d6e63 }));
    trunk.position.y = 1;
    group.add(trunk);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), new THREE.MeshPhysicalMaterial({ color: 0x66bb6a }));
    leaves.position.y = 2.5;
    group.add(leaves);
    group.position.copy(pos);
    return group;
}
scene.add(createTree(new THREE.Vector3(-35,0,10)));
scene.add(createTree(new THREE.Vector3(35,0,10)));
scene.add(createTree(new THREE.Vector3(-35,0,-10)));
scene.add(createTree(new THREE.Vector3(35,0,-10)));
scene.add(createTree(new THREE.Vector3(0,0,35)));
scene.add(createTree(new THREE.Vector3(0,0,-35)));

// ANIMACJA
function animate() {
    requestAnimationFrame(animate);
    // Karuzela obraca się
    scene.children.forEach(obj => {
        if (obj.type === 'Group' && obj.children.length > 6 && obj.children[1]?.geometry?.type === 'ConeGeometry') {
            obj.rotation.y += 0.008;
        }
    });
    // Latające ptaszki
    flyingBirds.forEach((bird, i) => {
        const t = Date.now() * bird.speed + bird.phase;
        bird.mesh.position.x += Math.sin(t) * 0.03;
        bird.mesh.position.z += Math.cos(t) * 0.03;
        bird.mesh.position.y += Math.sin(t*0.7) * 0.01;
    });
    controls.update();
    renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Dodaję overlay z instrukcją sterowania
const infoDiv = document.createElement('div');
infoDiv.textContent = '✨ Use mouse to look around | Scroll to zoom | Click and drag to move ✨';
infoDiv.style.position = 'fixed';
infoDiv.style.top = '16px';
infoDiv.style.left = '50%';
infoDiv.style.transform = 'translateX(-50%)';
infoDiv.style.background = 'rgba(255,255,255,0.85)';
infoDiv.style.color = '#333';
infoDiv.style.padding = '8px 18px';
infoDiv.style.borderRadius = '18px';
infoDiv.style.fontFamily = 'sans-serif';
infoDiv.style.fontSize = '1.1em';
infoDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
infoDiv.style.zIndex = '1000';
document.body.appendChild(infoDiv);