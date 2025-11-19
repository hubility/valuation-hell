import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;

        // Parts for animation
        this.head = null;
        this.body = null;
        this.armL = null;
        this.armR = null;
        this.legL = null;
        this.legR = null;

        // Stats
        this.speed = 10;
        this.cash = 10000;
        this.hype = 50;
        this.equity = 100;

        // Leveling
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;

        this.init();
    }

    init() {
        // Create a Group for the character
        this.mesh = new THREE.Group();
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        const materialSkin = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Skin
        const materialHoodie = new THREE.MeshStandardMaterial({ color: 0x00aaff }); // Blue Hoodie
        const materialPants = new THREE.MeshStandardMaterial({ color: 0x222222 }); // Dark Jeans
        const materialShoes = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White Sneakers

        // 1. Body (Hoodie)
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.7, 0.4);
        this.body = new THREE.Mesh(bodyGeo, materialHoodie);
        this.body.position.y = 1.1;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // 2. Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        this.head = new THREE.Mesh(headGeo, materialSkin);
        this.head.position.y = 0.6; // Relative to body
        this.body.add(this.head);

        // Glasses
        const glassesGeo = new THREE.BoxGeometry(0.42, 0.1, 0.1);
        const glassesMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const glasses = new THREE.Mesh(glassesGeo, glassesMat);
        glasses.position.set(0, 0.05, 0.2);
        this.head.add(glasses);

        // 3. Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);

        // Left Arm (Holding Laptop)
        this.armL = new THREE.Mesh(armGeo, materialHoodie);
        this.armL.position.set(0.4, 0.2, 0);
        this.body.add(this.armL);

        // Laptop
        const laptopGeo = new THREE.BoxGeometry(0.4, 0.05, 0.3);
        const laptopMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const laptop = new THREE.Mesh(laptopGeo, laptopMat);
        laptop.position.set(0, -0.3, 0.2); // In hand
        this.armL.add(laptop);

        // Screen open
        const screenGeo = new THREE.BoxGeometry(0.4, 0.3, 0.02);
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x2222ff, emissive: 0x0000aa });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 0.15, -0.15);
        screen.rotation.x = 0.5;
        laptop.add(screen);

        // Right Arm
        this.armR = new THREE.Mesh(armGeo, materialHoodie);
        this.armR.position.set(-0.4, 0.2, 0);
        this.body.add(this.armR);

        // 4. Legs
        const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);

        this.legL = new THREE.Mesh(legGeo, materialPants);
        this.legL.position.set(0.2, 0.4, 0); // Relative to mesh origin (0,0,0 is feet)
        this.mesh.add(this.legL);

        this.legR = new THREE.Mesh(legGeo, materialPants);
        this.legR.position.set(-0.2, 0.4, 0);
        this.mesh.add(this.legR);
    }

    update(dt, inputHandler, officeLevel) {
        const move = inputHandler.getMovementVector();
        const isMoving = move.x !== 0 || move.z !== 0;

        if (isMoving) {
            const oldPos = this.mesh.position.clone();

            this.mesh.position.x += move.x * this.speed * dt;
            this.mesh.position.z += move.z * this.speed * dt;

            // Collision Check
            if (officeLevel && officeLevel.checkCollision(this.mesh.position, 0.5)) {
                this.mesh.position.copy(oldPos);
            }

            // Rotate to face movement direction
            const angle = Math.atan2(move.x, move.z);
            this.mesh.rotation.y = angle;

            // Procedural Animation (Walk Cycle)
            const time = Date.now() * 0.01;
            this.legL.rotation.x = Math.sin(time) * 0.5;
            this.legR.rotation.x = Math.sin(time + Math.PI) * 0.5;

            this.armL.rotation.x = Math.sin(time + Math.PI) * 0.3; // Opposite to leg
            this.armR.rotation.x = Math.sin(time) * 0.3;
        } else {
            // Reset pose
            this.legL.rotation.x = 0;
            this.legR.rotation.x = 0;
            this.armL.rotation.x = 0;
            this.armR.rotation.x = 0;
        }
    }

    getFacingDirection() {
        const rotation = this.mesh.rotation.y;
        return new THREE.Vector3(Math.sin(rotation), 0, Math.cos(rotation));
    }

    takeDamage(amount) {
        this.cash -= amount;
    }

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
            return true; // Signal level up
        }
        return false;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        console.log(`Level Up! Now Level ${this.level}`);
    }

    getPosition() {
        return this.mesh.position;
    }

    dilute() {
        if (this.equity >= 10) {
            this.equity -= 10;
            this.cash += 5000;
            return true;
        }
        return false;
    }

    takeHypeDamage(amount) {
        this.hype -= amount;
        if (this.hype < 0) this.hype = 0;
        // TODO: Apply debuff if hype is 0
    }
}
