import * as THREE from 'three';

// --- Shared Resources ---
const geoProjectile = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);

const matPlayerProj = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.8
});

const matEnemyProj = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.8
});

export class Projectile {
    constructor(scene, position, direction, isEnemy = false) {
        this.scene = scene;
        this.direction = direction.normalize();
        this.speed = isEnemy ? 10 : 20; // Player shots faster
        this.damage = 20;
        this.life = 2.0; // Seconds
        this.isDead = false;
        this.isEnemy = isEnemy;

        // Mesh: Shared Geometry/Material
        const material = isEnemy ? matEnemyProj : matPlayerProj;
        this.mesh = new THREE.Mesh(geoProjectile, material);
        this.mesh.position.copy(position);

        // Rotate to face direction (Capsule is Y-up, so we need to rotate X 90 then lookAt)
        this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);

        this.scene.add(this.mesh);
    }

    update(dt) {
        if (this.isDead) return;

        this.life -= dt;
        if (this.life <= 0) {
            this.die();
            return;
        }

        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * dt));
    }

    die() {
        this.isDead = true;
        this.scene.remove(this.mesh);
    }

    getPosition() {
        return this.mesh.position;
    }
}
