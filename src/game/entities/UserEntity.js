import * as THREE from 'three';

// --- Shared Resources ---
const matUser = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x0088ff,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5
});

const matRing = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

const geoHead = new THREE.SphereGeometry(0.25, 8, 8); // Reduced segments
const geoBody = new THREE.CapsuleGeometry(0.25, 0.2, 4, 8);
const geoRing = new THREE.TorusGeometry(0.6, 0.05, 6, 16); // Reduced segments

export class UserEntity {
    constructor(scene, position) {
        this.scene = scene;
        this.mesh = null;
        this.isCollected = false;
        this.value = 10; // XP Value

        this.init(position);
    }

    init(position) {
        // Create a "User Avatar" icon (Head + Shoulders)
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.mesh.position.y = 1.0;
        this.scene.add(this.mesh);

        // Head
        const head = new THREE.Mesh(geoHead, matUser);
        head.position.y = 0.3;
        this.mesh.add(head);

        // Shoulders/Body
        const body = new THREE.Mesh(geoBody, matUser);
        body.rotation.z = Math.PI / 2; // Horizontal shoulders
        body.position.y = -0.1;
        this.mesh.add(body);

        // Ring
        this.ring = new THREE.Mesh(geoRing, matRing);
        this.mesh.add(this.ring);
    }

    update(dt, playerPos) {
        if (this.isCollected) return;

        // Animation: Spin and Bob
        const time = Date.now() * 0.002;
        this.mesh.rotation.y += dt * 2;
        this.mesh.position.y = 1.0 + Math.sin(time) * 0.2;

        // Ring wobble
        if (this.ring) {
            this.ring.rotation.x = Math.sin(time * 0.5) * 0.5;
            this.ring.rotation.y = Math.cos(time * 0.5) * 0.5;
        }

        // Magnet effect when close
        const dist = this.mesh.position.distanceTo(playerPos);
        if (dist < 5) {
            const dir = new THREE.Vector3()
                .subVectors(playerPos, this.mesh.position)
                .normalize();
            this.mesh.position.add(dir.multiplyScalar(15 * dt)); // Move fast towards player
        }
    }

    collect() {
        this.isCollected = true;
        this.scene.remove(this.mesh);
    }

    getPosition() {
        return this.mesh.position;
    }
}
