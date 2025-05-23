import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Collision detection
function checkCollision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}

// Game state
let score = 0;
let health = 100;
let isGameOver = false;
let isPaused = false;
let currentDifficulty = 'easy';
let playerVelocity = new THREE.Vector3();
let playerOnGround = false;

// Physics variables
let gravity;
let jumpForce;
let moveSpeed;

// Difficulty settings
const difficultySettings = {
    easy: {
        moveSpeed: 0.08,
        jumpForce: 0.8,
        gravity: 0.05,
        health: 150,
        obstacleDamage: 1
    },
    medium: {
        moveSpeed: 0.1,
        jumpForce: 1.0,
        gravity: 0.06,
        health: 100,
        obstacleDamage: 2
    },
    hard: {
        moveSpeed: 0.12,
        jumpForce: 1.2,
        gravity: 0.07,
        health: 75,
        obstacleDamage: 3
    }
};

// Initialize physics with easy difficulty
const settings = difficultySettings[currentDifficulty];
gravity = settings.gravity;
jumpForce = settings.jumpForce;
moveSpeed = settings.moveSpeed;

// Audio setup
const listener = new THREE.AudioListener();
const sounds = {
    jump: new THREE.Audio(listener),
    coin: new THREE.Audio(listener),
    hit: new THREE.Audio(listener),
    gameOver: new THREE.Audio(listener),
    background: new THREE.Audio(listener)
};

// Simple beep sound generator
function createBeepSound(frequency = 440, duration = 0.1) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
}

// Sound effects
function playJumpSound() {
    createBeepSound(880, 0.1);
}

function playCoinSound() {
    createBeepSound(1320, 0.1);
}

function playHitSound() {
    createBeepSound(220, 0.2);
}

function playGameOverSound() {
    createBeepSound(110, 0.5);
}

// Background music
let backgroundMusicInterval;
function startBackgroundMusic() {
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
    }
    backgroundMusicInterval = setInterval(() => {
        createBeepSound(440 + Math.random() * 100, 0.1);
    }, 200);
}

function stopBackgroundMusic() {
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
        backgroundMusicInterval = null;
    }
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.add(listener); // Add audio listener to camera
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

// Player
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
player.castShadow = true;
player.receiveShadow = true;
scene.add(player);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x808080,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Platforms
const platforms = [];
function createPlatform(x, y, z, width, height, depth, color = 0x808080) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    platforms.push(platform);
    return platform;
}

// Create platform with walls
function createPlatformWithWalls(x, y, z, width, height, depth, color = 0x808080) {
    // Create main platform
    const platform = createPlatform(x, y, z, width, height, depth, color);
    
    return platform;
}

// Create a more interesting level layout
// Starting area - all platforms aligned in a line
createPlatformWithWalls(0, 0, 0, 10, 1, 10, 0x4CAF50); // Green starting platform
createPlatformWithWalls(12, 0, 0, 10, 1, 10, 0x2196F3); // Blue platform
createPlatformWithWalls(24, 0, 0, 10, 1, 10, 0xFFC107); // Yellow platform
createPlatformWithWalls(36, 0, 0, 10, 1, 10, 0xF44336); // Red platform

// Additional platforms - aligned with main path
createPlatformWithWalls(12, 0, 12, 8, 1, 8, 0x9C27B0); // Purple platform
createPlatformWithWalls(24, 0, -12, 8, 1, 8, 0x00BCD4); // Cyan platform
createPlatformWithWalls(36, 0, 12, 8, 1, 8, 0xFF9800); // Orange platform

// Moving platforms with walls - aligned with main path
const movingPlatforms = [];
function createMovingPlatformWithWalls(x, y, z, width, height, depth, moveRange, speed) {
    const platform = createPlatformWithWalls(x, y, z, width, height, depth, 0xE91E63);
    platform.userData = {
        startY: y,
        moveRange: moveRange,
        speed: speed,
        direction: 1
    };
    movingPlatforms.push(platform);
    return platform;
}

createMovingPlatformWithWalls(18, 0, 0, 6, 1, 6, 3, 0.02);
createMovingPlatformWithWalls(30, 0, 0, 6, 1, 6, 4, 0.03);

// Obstacles
const obstacles = [];
function createObstacle(x, y, z, width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, y, z);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
    return obstacle;
}

// Create some obstacles
createObstacle(15, 3, 5, 1, 2, 1);
createObstacle(30, 5, -5, 1, 2, 1);
createObstacle(45, 7, 5, 1, 2, 1);

// Coins
const coins = [];
function createCoin(x, y, z) {
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const coin = new THREE.Mesh(geometry, material);
    coin.position.set(x, y, z);
    coin.rotation.x = Math.PI / 2;
    coin.castShadow = true;
    scene.add(coin);
    coins.push(coin);
    return coin;
}

// Create some coins above platforms
function createCoinsAbovePlatform(platform) {
    const platformWidth = platform.geometry.parameters.width;
    const platformDepth = platform.geometry.parameters.depth;
    const platformHeight = platform.geometry.parameters.height;
    const platformX = platform.position.x;
    const platformY = platform.position.y;
    const platformZ = platform.position.z;

    // Create 3x3 grid of coins above the platform
    for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
            const coinX = platformX + (x * (platformWidth / 4));
            const coinZ = platformZ + (z * (platformDepth / 4));
            const coinY = platformY + platformHeight + 2; // 2 units above platform
            createCoin(coinX, coinY, coinZ);
        }
    }
}

// Create coins above each platform
platforms.forEach(platform => {
    createCoinsAbovePlatform(platform);
});

// Camera setup
camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 5;
controls.maxDistance = 15;
controls.target = player.position;
controls.enablePan = false;
controls.rotateSpeed = 0.5;

// Movement
const keys = {
    w: false,
    a: false,
    s: false,
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
    if (e.key === 'Escape') {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
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

// Player animations
const playerAnimations = {
    idle: { scale: 1, rotation: 0 },
    jump: { scale: 0.8, rotation: Math.PI / 4 },
    run: { scale: 1.2, rotation: 0 }
};

let currentAnimation = 'idle';
let animationProgress = 0;

// Particle effects
const particles = [];
function createParticle(x, y, z, color) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(x, y, z);
    particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.1
    );
    particle.life = 1.0;
    scene.add(particle);
    particles.push(particle);
    return particle;
}

// Trail effect
const trailParticles = [];
function createTrailParticle(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(x, y, z);
    particle.life = 1.0;
    scene.add(particle);
    trailParticles.push(particle);
    return particle;
}

// Menu handling
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('difficulty-button').addEventListener('click', showDifficultyMenu);
document.getElementById('instructions-button').addEventListener('click', showInstructions);
document.getElementById('back-button').addEventListener('click', showMainMenu);
document.getElementById('resume-button').addEventListener('click', resumeGame);
document.getElementById('main-menu-button').addEventListener('click', returnToMainMenu);

// Difficulty selection
document.querySelectorAll('[data-difficulty]').forEach(button => {
    button.addEventListener('click', (e) => {
        currentDifficulty = e.target.dataset.difficulty;
        showMainMenu();
    });
});

function startGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    document.getElementById('instructions').style.display = 'block';
    
    // Reset game state with easy difficulty
    currentDifficulty = 'easy';
    const settings = difficultySettings[currentDifficulty];
    gravity = settings.gravity;
    jumpForce = settings.jumpForce;
    moveSpeed = settings.moveSpeed;
    
    score = 0;
    health = settings.health;
    isGameOver = false;
    isPaused = false;
    
    // Reset player
    player.position.set(0, 1, 0);
    playerVelocity.set(0, 0, 0);
    
    // Update UI
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('health-bar').style.width = '100%';
    document.getElementById('game-over').style.display = 'none';
    
    // Start background music
    startBackgroundMusic();
    
    // Start game loop
    animate();
}

function showDifficultyMenu() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';
}

function showMainMenu() {
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function showInstructions() {
    document.getElementById('instructions').style.display = 'block';
    setTimeout(() => {
        document.getElementById('instructions').style.display = 'none';
    }, 3000);
}

function pauseGame() {
    if (!isGameOver) {
        isPaused = true;
        document.getElementById('pause-menu').style.display = 'block';
        stopBackgroundMusic();
    }
}

function resumeGame() {
    isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
    startBackgroundMusic();
}

function returnToMainMenu() {
    isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('ui').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    stopBackgroundMusic();
}

// Game loop
function animate() {
    if (isGameOver || isPaused) return;

    requestAnimationFrame(animate);

    // Get current difficulty settings
    const settings = difficultySettings[currentDifficulty];
    moveSpeed = settings.moveSpeed;
    jumpForce = settings.jumpForce;
    gravity = settings.gravity;

    // Update player animation
    if (playerOnGround) {
        if (Math.abs(playerVelocity.x) > 0 || Math.abs(playerVelocity.z) > 0) {
            currentAnimation = 'run';
        } else {
            currentAnimation = 'idle';
        }
    } else {
        currentAnimation = 'jump';
    }

    // Apply animation
    const targetAnimation = playerAnimations[currentAnimation];
    player.scale.lerp(new THREE.Vector3(
        targetAnimation.scale,
        targetAnimation.scale,
        targetAnimation.scale
    ), 0.1);
    player.rotation.x = THREE.MathUtils.lerp(
        player.rotation.x,
        targetAnimation.rotation,
        0.1
    );

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.position.add(particle.velocity);
        particle.life -= 0.02;
        particle.material.opacity = particle.life;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            particles.splice(i, 1);
        }
    }

    // Update trail particles
    if (Math.abs(playerVelocity.x) > 0 || Math.abs(playerVelocity.z) > 0) {
        createTrailParticle(
            player.position.x,
            player.position.y - 1,
            player.position.z
        );
    }

    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const particle = trailParticles[i];
        particle.life -= 0.05;
        particle.material.opacity = particle.life;
        particle.scale.multiplyScalar(0.95);
        
        if (particle.life <= 0) {
            scene.remove(particle);
            trailParticles.splice(i, 1);
        }
    }

    // Update moving platforms
    for (const platform of movingPlatforms) {
        platform.position.y += platform.userData.speed * platform.userData.direction;
        
        if (platform.position.y > platform.userData.startY + platform.userData.moveRange) {
            platform.userData.direction = -1;
        } else if (platform.position.y < platform.userData.startY) {
            platform.userData.direction = 1;
        }
    }

    // Player movement relative to camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    cameraRight.normalize();

    if (keys.w) {
        playerVelocity.add(cameraDirection.clone().multiplyScalar(moveSpeed));
    }
    if (keys.s) {
        playerVelocity.add(cameraDirection.clone().multiplyScalar(-moveSpeed));
    }
    if (keys.a) {
        playerVelocity.add(cameraRight.clone().multiplyScalar(-moveSpeed));
    }
    if (keys.d) {
        playerVelocity.add(cameraRight.clone().multiplyScalar(moveSpeed));
    }

    // Jump with sound
    if (keys.space && playerOnGround) {
        playerVelocity.y = jumpForce;
        playerOnGround = false;
        playJumpSound();
    }

    // Apply gravity
    playerVelocity.y -= gravity;

    // Update player position
    player.position.x += playerVelocity.x;
    player.position.y += playerVelocity.y;
    player.position.z += playerVelocity.z;

    // Reset horizontal velocity
    playerVelocity.x = 0;
    playerVelocity.z = 0;

    // Platform collisions with improved detection
    playerOnGround = false;
    for (const platform of platforms) {
        if (checkCollision(player, platform)) {
            const playerBottom = player.position.y - 1;
            const platformTop = platform.position.y + platform.geometry.parameters.height / 2;
            const playerTop = player.position.y + 1;
            const platformBottom = platform.position.y - platform.geometry.parameters.height / 2;

            // Check if player is above platform
            if (playerBottom <= platformTop && playerVelocity.y < 0) {
                player.position.y = platformTop + 1;
                playerVelocity.y = 0;
                playerOnGround = true;
            }
            // Check if player is below platform
            else if (playerTop >= platformBottom && playerVelocity.y > 0) {
                player.position.y = platformBottom - 1;
                playerVelocity.y = 0;
            }
            // Check if player is on the side of platform
            else {
                const playerLeft = player.position.x - 0.5;
                const playerRight = player.position.x + 0.5;
                const platformLeft = platform.position.x - platform.geometry.parameters.width / 2;
                const platformRight = platform.position.x + platform.geometry.parameters.width / 2;

                if (playerRight > platformLeft && playerLeft < platformRight) {
                    // Collision from left or right
                    if (player.position.x < platform.position.x) {
                        player.position.x = platformLeft - 0.5;
                    } else {
                        player.position.x = platformRight + 0.5;
                    }
                    playerVelocity.x = 0;
                }
            }
        }
    }

    // Obstacle collisions with sound
    for (const obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            // Create particle burst
            for (let i = 0; i < 10; i++) {
                createParticle(
                    player.position.x,
                    player.position.y,
                    player.position.z,
                    0xFF0000
                );
            }
            
            health -= settings.obstacleDamage;
            document.getElementById('health-bar').style.width = `${(health / settings.health) * 100}%`;
            playHitSound();
            
            if (health <= 0) {
                gameOver();
            }
            
            // Bounce back from obstacle
            const pushDirection = new THREE.Vector3()
                .subVectors(player.position, obstacle.position)
                .normalize()
                .multiplyScalar(0.5);
            
            player.position.add(pushDirection);
        }
    }

    // Coin collection with particles
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (checkCollision(player, coin)) {
            // Create particle burst
            for (let j = 0; j < 10; j++) {
                createParticle(
                    coin.position.x,
                    coin.position.y,
                    coin.position.z,
                    0xFFD700
                );
            }
            
            scene.remove(coin);
            coins.splice(i, 1);
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            playCoinSound();
        }
        coin.rotation.y += 0.02;
    }

    // Update camera target to follow player
    controls.target.copy(player.position);
    controls.update();

    // Check game over
    if (player.position.y < -10) {
        gameOver();
    }

    renderer.render(scene, camera);
}

// Game over with sound
function gameOver() {
    isGameOver = true;
    document.getElementById('game-over').style.display = 'block';
    playGameOverSound();
    stopBackgroundMusic();
}

// Restart game
document.getElementById('restart-button').addEventListener('click', () => {
    startGame();
});

// Start background music when game starts
window.addEventListener('click', () => {
    if (!sounds.background.isPlaying) {
        sounds.background.play();
    }
}, { once: true });

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start game
animate();