import * as THREE from 'three';

export class Burnout {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.active = false;
        this.speed = 1.5; // Very slow but relentless
        this.damage = 50; // Damage per second
        this.size = 3;

        this.init();
    }

    init() {
        // Visuals: A dark, smoky cloud
        const geometry = new THREE.SphereGeometry(this.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.6,
            roughness: 1,
            emissive: 0x000000
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, -100, 0); // Hidden initially
        this.scene.add(this.mesh);

        // Add some "smoke" particles (simple child meshes for now)
        for (let i = 0; i < 5; i++) {
            const subGeo = new THREE.SphereGeometry(this.size * 0.6, 8, 8);
            const subMesh = new THREE.Mesh(subGeo, material);
            subMesh.position.set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
            this.mesh.add(subMesh);
        }
    }

    spawn(playerPos) {
        this.active = true;
        // Spawn far away
        const angle = Math.random() * Math.PI * 2;
        const distance = 30;
        this.mesh.position.x = playerPos.x + Math.cos(angle) * distance;
        this.mesh.position.z = playerPos.z + Math.sin(angle) * distance;
        this.mesh.position.y = 2;
        console.log("BURNOUT HAS STARTED!");
    }

    update(dt, playerPos) {
        if (!this.active) return;

        // Rotate slowly
        this.mesh.rotation.y += dt * 0.5;
        this.mesh.rotation.z += dt * 0.2;

        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPos, this.mesh.position)
            .normalize();

        this.mesh.position.add(direction.multiplyScalar(this.speed * dt));

        // Bobbing effect
        this.mesh.position.y = 2 + Math.sin(Date.now() * 0.001) * 0.5;
    }

    checkCollision(player) {
        if (!this.active) return false;
        const dist = this.mesh.position.distanceTo(player.getPosition());
        return dist < (this.size + 0.5); // Simple sphere collision
    }
}
