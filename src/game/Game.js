import * as THREE from 'three';
import { Player } from './entities/Player.js';
import { InputHandler } from './InputHandler.js';
import { Spawner } from './systems/Spawner.js';
import { Combat } from './systems/Combat.js';
import { DropSystem } from './systems/DropSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { FloatingTextManager } from './ui/FloatingTextManager.js';
import { Burnout } from './entities/Burnout.js';
import { OfficeLevel } from './environment/OfficeLevel.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Game States: 'start', 'playing', 'gameover', 'levelup'
        this.state = 'start';

        this.player = null;
        this.inputHandler = null;
        this.spawner = null;
        this.combat = null;
        this.dropSystem = null;
        this.particleSystem = null;
        this.uiManager = null;
        this.floatingTextManager = null;
        this.burnout = null;
        this.officeLevel = null;

        this.gameTime = 0;
    }

    init() {
        // 1. Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);

        // 2. Setup Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.container.appendChild(this.renderer.domElement);

        // 4. Add Lights
        // Hemisphere Light (Natural Ambient: Sky vs Ground)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);

        // Directional Light (Sun/Main Office Light)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true;

        // Shadow Quality Settings
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;
        const d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0005; // Remove shadow acne

        this.scene.add(dirLight);

        // 5. Add Floor (Corporate Office Tiles)
        const tileSize = 512;
        const canvas = document.createElement('canvas');
        canvas.width = tileSize;
        canvas.height = tileSize;
        const context = canvas.getContext('2d');

        // Background (Corporate Bluish-Gray)
        context.fillStyle = '#2a2a35';
        context.fillRect(0, 0, tileSize, tileSize);

        // Draw 64x64px tiles with lighter borders
        const tileCount = tileSize / 64;
        for (let x = 0; x < tileCount; x++) {
            for (let y = 0; y < tileCount; y++) {
                const px = x * 64;
                const py = y * 64;

                // Tile base
                context.fillStyle = '#2a2a35';
                context.fillRect(px, py, 64, 64);

                // Lighter border to simulate carpet tiles
                context.strokeStyle = '#3a3a45';
                context.lineWidth = 2;
                context.strokeRect(px, py, 64, 64);

                // Add subtle texture variation
                if (Math.random() > 0.7) {
                    context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
                    context.fillRect(px + 2, py + 2, 60, 60);
                }
            }
        }

        // Add coffee stains (dark circles) randomly
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * tileSize;
            const y = Math.random() * tileSize;
            const radius = Math.random() * 8 + 4;

            context.fillStyle = `rgba(40, 30, 20, ${Math.random() * 0.3 + 0.2})`;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }

        // Add some random dirt/wear marks
        for (let i = 0; i < 20; i++) {
            context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
            const x = Math.random() * tileSize;
            const y = Math.random() * tileSize;
            const size = Math.random() * 15 + 5;
            context.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20); // Repeat 20 times over the 100x100 area

        const floorGeo = new THREE.PlaneGeometry(100, 100);
        const floorMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Removed GridHelper for cleaner look

        // 6. Initialize Systems
        this.inputHandler = new InputHandler();
        this.player = new Player(this.scene);
        this.spawner = new Spawner(this.scene);
        this.combat = new Combat(this.scene);
        this.dropSystem = new DropSystem(this.scene);
        this.particleSystem = new ParticleSystem(this.scene);
        this.uiManager = new UIManager(this);
        this.floatingTextManager = new FloatingTextManager(this);
        this.burnout = new Burnout(this.scene);
        this.officeLevel = new OfficeLevel(this.scene);

        // Event Listeners
        window.addEventListener('resize', () => this.onResize());
    }

    start() {
        // Initial render to show the scene behind the start screen
        this.render();
    }

    startGame() {
        this.state = 'playing';
        this.clock.start();
        this.gameTime = 0;
        this.loop();
    }

    loop() {
        if (this.state !== 'playing') return;
        requestAnimationFrame(() => this.loop());

        const dt = this.clock.getDelta();
        this.gameTime += dt;
        this.update(dt);
        this.render();
    }

    update(dt) {
        if (this.player) {
            this.player.update(dt, this.inputHandler, this.officeLevel);

            // --- ECONOMY UPDATE ---
            // 1. Burn Rate: -$10/sec
            this.player.cash -= 10 * dt;

            // 2. Revenue: + (Users * 0.5)/sec
            // Users = this.player.xp
            const revenue = (this.player.xp * 0.5) * dt;
            this.player.cash += revenue;


            // Camera Follow
            const playerPos = this.player.getPosition();
            this.camera.position.x = playerPos.x;
            this.camera.position.z = playerPos.z + 20;
            this.camera.lookAt(playerPos.x, 0, playerPos.z);

            // Update Office Level (animations)
            if (this.officeLevel) {
                this.officeLevel.update(dt);
            }

            // Update Spawner
            if (this.spawner) {
                this.spawner.update(dt, playerPos, this.gameTime);
            }

            // Update Drop System
            if (this.dropSystem) {
                if (this.dropSystem.update(dt, this.player)) {
                    this.triggerLevelUp();
                }
            }

            // Update Particles
            if (this.particleSystem) {
                this.particleSystem.update(dt);
            }

            // Update Floating Text
            if (this.floatingTextManager) {
                this.floatingTextManager.update(dt);
            }

            // Update Burnout
            if (this.burnout) {
                if (!this.burnout.active && this.gameTime > 30) { // Spawn after 30s
                    this.burnout.spawn(playerPos);
                    // Notify user via Floating Text?
                    this.floatingTextManager.showDamage(playerPos, "BURNOUT IS COMING!", 0xff0000);
                }
                this.burnout.update(dt, playerPos);

                if (this.burnout.checkCollision(this.player)) {
                    this.player.takeDamage(this.burnout.damage * dt);
                    this.player.takeHypeDamage(10 * dt); // Also drains Hype
                }
            }

            // Update Combat
            if (this.combat && this.spawner) {
                this.combat.update(dt, this.player, this.spawner.getEnemies(), this.inputHandler, this.dropSystem, this.particleSystem, this.floatingTextManager, this.spawner);
            }

            // Update UI
            this.uiManager.updateHUD(this.player, this.combat, this.gameTime);

            // Check Game Over
            if (this.player.cash <= 0) {
                this.gameOver();
            }
        }
    }

    triggerLevelUp() {
        this.state = 'levelup';

        const options = [
            { name: "Growth Hacking", icon: "⚡", desc: "Dispara 3 proyectiles (Fan Shot)" },
            { name: "Series A Funding", icon: "💰", desc: "Recibe $5000 Cash" },
            { name: "Viral Marketing", icon: "🔥", desc: "Aumenta el daño (+50% Damage)" },
            { name: "Referral Program", icon: "🤝", desc: "Enemigos explotan al morir (Chain Reaction)" },
            { name: "Referral Program", icon: "🤝", desc: "Enemigos explotan al morir (Chain Reaction)" },
            { name: "NFT Drop", icon: "💎", desc: "Explosión masiva cada 10s (Passive Nuke)" },
            { name: "Hiring Spree", icon: "👶", desc: "Genera un Junior Dev cada 5s" },
            { name: "Pivote", icon: "🔄", desc: "Cambia tu arma aleatoriamente (Riesgo/Recompensa)" }
        ];

        // Show 3 random unique options
        const shuffled = options.sort(() => 0.5 - Math.random());
        const selectedOptions = shuffled.slice(0, 3);

        this.uiManager.showPitchRound(selectedOptions, (selected) => {
            this.applyUpgrade(selected);
            this.state = 'playing';
            this.loop();
        });
    }

    applyUpgrade(upgrade) {
        console.log("Applied upgrade:", upgrade.name);
        if (upgrade.name === "Growth Hacking") {
            this.combat.shootRate *= 0.8; // Faster fire
            this.combat.weaponType = 'fan'; // Unlock Fan Shot
        } else if (upgrade.name === "Series A Funding") {
            this.player.cash += 5000;
        } else if (upgrade.name === "Viral Marketing") {
            // Need to implement damage modifier in Combat or Projectile
            this.combat.damageMultiplier = (this.combat.damageMultiplier || 1) + 0.5;
        } else if (upgrade.name === "Referral Program") {
            this.combat.referralProgramEnabled = true;
        } else if (upgrade.name === "NFT Drop") {
            this.combat.enableNFTDrop();
        } else if (upgrade.name === "Hiring Spree") {
            this.combat.enableHiringSpree();
        } else if (upgrade.name === "Pivote") {
            this.combat.activatePivote();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameOver() {
        this.state = 'gameover';
        this.uiManager.showGameOver();
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
