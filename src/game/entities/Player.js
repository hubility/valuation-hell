import * as THREE from 'three';

export class Player {
    // Añadimos valores por defecto a bounds para evitar el error "undefined"
    constructor(scene, bounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }) {
        this.scene = scene;
        this.bounds = bounds;

        // Estadísticas de Juego (Requeridas por Game.js)
        this.speed = 10;
        this.cash = 10000;
        this.equity = 100;
        this.hype = 50;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.isDead = false;

        this.init();
    }

    init() {
        // 1. Grupo Principal
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0.5, 0);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // --- MATERIALES (Estilo Founder) ---
        const matSkin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
        const matHoodie = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }); // Gris oscuro
        const matJeans = new THREE.MeshStandardMaterial({ color: 0x3b5998, roughness: 0.8 });
        const matLaptop = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.2 });
        const matScreen = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x4444ff, emissiveIntensity: 0.5 });

        // --- GEOMETRÍA VÓXEL ---

        // A. TORSO (Sudadera)
        this.body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), matHoodie);
        this.body.position.y = 0.8;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // B. CABEZA (Hijo del torso)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.5, 0);
        this.body.add(headGroup);

        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matSkin);
        this.head.position.z = 0.05;
        headGroup.add(this.head);

        // Capucha
        const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.1), matHoodie);
        hoodBack.position.set(0, 0.02, -0.15);
        headGroup.add(hoodBack);
        const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.35), matHoodie);
        hoodTop.position.set(0, 0.2, -0.02);
        headGroup.add(hoodTop);

        // C. BRAZOS
        const armGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15);

        // Brazo Izquierdo
        this.armL = new THREE.Mesh(armGeo, matHoodie);
        this.armL.position.set(0.35, 0, 0);
        this.body.add(this.armL);
        const handL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), matSkin);
        handL.position.y = -0.3;
        this.armL.add(handL);

        // Brazo Derecho (Sosteniendo Laptop)
        this.armR = new THREE.Mesh(armGeo, matHoodie);
        this.armR.position.set(-0.35, 0, 0);
        this.armR.rotation.x = -0.5; // Posición de sostener
        this.body.add(this.armR);
        const handR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), matSkin);
        handR.position.y = -0.3;
        this.armR.add(handR);

        // D. LAPTOP (En mano derecha)
        const laptopGroup = new THREE.Group();
        laptopGroup.position.set(0, -0.35, 0.15);
        this.armR.add(laptopGroup);

        const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), matLaptop);
        laptopGroup.add(lapBase);

        const screenGroup = new THREE.Group();
        screenGroup.position.set(0, 0.01, -0.15);
        screenGroup.rotation.x = 0.5; // Abierta
        laptopGroup.add(screenGroup);

        const lapScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), matLaptop);
        lapScreenFrame.position.set(0, 0, 0.15);
        lapScreenFrame.rotation.x = -Math.PI / 2;
        screenGroup.add(lapScreenFrame);

        const lapGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), matScreen);
        lapGlow.position.set(0, 0.011, 0.15);
        lapGlow.rotation.x = -Math.PI / 2;
        screenGroup.add(lapGlow);

        // E. PIERNAS
        const legGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
        this.legL = new THREE.Mesh(legGeo, matJeans);
        this.legL.position.set(0.15, -0.6, 0);
        this.body.add(this.legL);

        this.legR = new THREE.Mesh(legGeo, matJeans);
        this.legR.position.set(-0.15, -0.6, 0);
        this.body.add(this.legR);
    }

    // --- MÉTODOS DE INTERFAZ REQUERIDOS POR GAME.JS ---

    // Restaurado: Game.js llama a esto, no a un getter
    getPosition() {
        return this.mesh.position;
    }

    getFacingDirection() {
        const rotation = this.mesh.rotation.y;
        return new THREE.Vector3(Math.sin(rotation), 0, Math.cos(rotation));
    }

    // Restaurado: El orden de argumentos es (delta, inputHandler, levelObstacles)
    update(dt, inputHandler, levelObstacles) {
        if (this.isDead) return;

        const moveVector = inputHandler.getMovementVector();

        if (moveVector.x !== 0 || moveVector.z !== 0) {
            const oldPos = this.mesh.position.clone();

            this.mesh.position.x += moveVector.x * this.speed * dt;
            this.mesh.position.z += moveVector.z * this.speed * dt;

            // Límites del mapa
            this.mesh.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.mesh.position.x));
            this.mesh.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.mesh.position.z));

            // Colisiones con obstáculos (si existen)
            if (levelObstacles && levelObstacles.checkCollision(this.mesh.position, 0.5)) {
                this.mesh.position.copy(oldPos);
            }

            // Rotación suave hacia la dirección de movimiento
            const angle = Math.atan2(moveVector.x, moveVector.z);
            this.mesh.rotation.y = angle;

            // Animación de caminar
            const time = Date.now() * 0.01;
            this.legL.rotation.x = Math.sin(time) * 0.5;
            this.legR.rotation.x = Math.sin(time + Math.PI) * 0.5;
            this.armL.rotation.x = Math.sin(time + Math.PI) * 0.3;
            // Animación sutil del brazo con laptop
            this.armR.rotation.x = -0.5 + Math.sin(time) * 0.1;
        } else {
            // Resetear pose (Idle)
            this.legL.rotation.x = 0;
            this.legR.rotation.x = 0;
            this.armL.rotation.x = 0;
            this.armR.rotation.x = -0.5;
        }
    }

    takeDamage(amount) {
        this.cash -= amount;
        // Efecto visual de daño (parpadeo rojo opcional)
        if (this.body) {
            const oldColor = this.body.material.color.getHex();
            this.body.material.color.setHex(0xff0000);
            setTimeout(() => {
                if (this.body) this.body.material.color.setHex(oldColor);
            }, 100);
        }
    }

    takeHypeDamage(amount) {
        this.hype -= amount;
        if (this.hype < 0) this.hype = 0;
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
            return true;
        }
        return false;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    }

    dilute() {
        if (this.equity >= 10) {
            this.equity -= 10;
            this.cash += 5000;
            return true;
        }
        return false;
    }

    loseEquityPercent(percent) {
        const amount = this.equity * (percent / 100);
        this.equity = Math.max(0, this.equity - amount);
    }

    getValuation() {
        return this.xp * 100 * (this.hype / 50);
    }
}