import * as THREE from 'three';

export class JuniorDev {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.speed = 14; // Fast
        this.damage = 15; // Low damage per shot
        this.isDead = false;
        this.lifetime = 15.0;
        this.state = 'FOLLOW'; // FOLLOW, ATTACK

        this.shootTimer = 0;
        this.shootRate = 0.3; // Fast fire rate

        // Visuals: Voxel Cyber-Monk
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Materials
        const matRobe = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const matVoid = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 1.0
        });
        const matGlow = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2.0
        });

        // 1. Body (Tunic) - Wide vertical box
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.7, 0.4);
        const body = new THREE.Mesh(bodyGeo, matRobe);
        body.position.y = 0.35;
        body.castShadow = true;
        this.mesh.add(body);

        // 2. Hood Structure
        // Back
        const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.5, 0.1), matRobe);
        hoodBack.position.set(0, 0.8, -0.2);
        this.mesh.add(hoodBack);
        // Top
        const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.5), matRobe);
        hoodTop.position.set(0, 1.05, 0);
        this.mesh.add(hoodTop);
        // Sides
        const hoodLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), matRobe);
        hoodLeft.position.set(-0.21, 0.8, 0);
        this.mesh.add(hoodLeft);
        const hoodRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), matRobe);
        hoodRight.position.set(0.21, 0.8, 0);
        this.mesh.add(hoodRight);

        // 3. Face (Void)
        const face = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matVoid);
        face.position.set(0, 0.8, 0);
        this.mesh.add(face);

        // 4. Eyes (Glow)
        const eyeGeo = new THREE.PlaneGeometry(0.08, 0.04);
        const leftEye = new THREE.Mesh(eyeGeo, matGlow);
        leftEye.position.set(-0.08, 0.82, 0.16);
        this.mesh.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, matGlow);
        rightEye.position.set(0.08, 0.82, 0.16);
        this.mesh.add(rightEye);

        // 5. Light
        const light = new THREE.PointLight(0x00ffff, 0.5, 3);
        light.position.set(0, 0.8, 0.2);
        this.mesh.add(light);

        // Animation offset
        this.animTime = Math.random() * 100;
    }

    getPosition() {
        return this.mesh.position;
    }

    update(dt, enemies, playerPos, particleSystem, onShoot) {
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.die(particleSystem);
            return;
        }

        this.animTime += dt * 10;

        // Behavior Logic
        const distToPlayer = this.position.distanceTo(playerPos);

        // Find nearest enemy for combat
        let nearestEnemy = null;
        let minDst = 10.0; // Combat range

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dst = this.position.distanceTo(enemy.getPosition());
            if (dst < minDst) {
                minDst = dst;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            this.state = 'ATTACK';
            // Rotate towards enemy
            this.mesh.lookAt(nearestEnemy.getPosition());

            // Shoot
            this.shootTimer += dt;
            if (this.shootTimer >= this.shootRate) {
                this.shootTimer = 0;
                if (onShoot) {
                    // Calculate direction
                    const direction = new THREE.Vector3()
                        .subVectors(nearestEnemy.getPosition(), this.position)
                        .normalize();

                    // Add slight inaccuracy
                    direction.x += (Math.random() - 0.5) * 0.1;
                    direction.z += (Math.random() - 0.5) * 0.1;
                    direction.normalize();

                    onShoot(this.position, direction);
                }
            }
        } else {
            this.state = 'FOLLOW';
            // Look at player
            this.mesh.lookAt(playerPos);
        }

        // Movement (Follow Player)
        if (distToPlayer > 3.0) {
            const direction = new THREE.Vector3()
                .subVectors(playerPos, this.position)
                .normalize();

            this.position.add(direction.multiplyScalar(this.speed * dt));
        }

        // Bounce Animation
        this.mesh.position.copy(this.position);
        this.mesh.position.y += Math.abs(Math.sin(this.animTime)) * 0.3;
    }

    die(particleSystem) {
        this.isDead = true;

        // Explosion Feedback
        if (particleSystem) {
            // Robe particles (Grey)
            particleSystem.emit(this.position, 0x1a1a1a, 10);
            // Magic particles (Cyan)
            particleSystem.emit(this.position, 0x00ffff, 15);
        }

        if (this.mesh) {
            this.scene.remove(this.mesh);
            // Cleanup children
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                }
            });
            this.mesh = null;
        }
    }
}
