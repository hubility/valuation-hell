import * as THREE from 'three';

export class OfficeLevel {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = []; // Array of { mesh, box: Box3 }
        this.init();
    }

    init() {
        // Generate random office layout
        this.generateDesks(10);
        this.generatePlants(8);
        this.generateWaterCoolers(4);
    }

    generateDesks(count) {
        const deskGeo = new THREE.BoxGeometry(4, 0.2, 2);
        const legGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        const monitorGeo = new THREE.BoxGeometry(1, 0.8, 0.1);
        const screenGeo = new THREE.BoxGeometry(0.9, 0.7, 0.05);

        const deskMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Wood
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Metal
        const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black plastic
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x2222ff, emissive: 0x000055 }); // Screen glow

        for (let i = 0; i < count; i++) {
            const deskGroup = new THREE.Group();

            // Table Top
            const top = new THREE.Mesh(deskGeo, deskMat);
            top.position.y = 1.5;
            top.castShadow = true;
            top.receiveShadow = true;
            deskGroup.add(top);

            // Legs
            const legPositions = [
                { x: -1.8, z: -0.8 }, { x: 1.8, z: -0.8 },
                { x: -1.8, z: 0.8 }, { x: 1.8, z: 0.8 }
            ];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(pos.x, 0.75, pos.z);
                leg.castShadow = true;
                deskGroup.add(leg);
            });

            // Monitor
            const monitor = new THREE.Mesh(monitorGeo, monitorMat);
            monitor.position.set(0, 2, -0.5);
            deskGroup.add(monitor);

            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.set(0, 2, -0.45);
            deskGroup.add(screen);

            // Position
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            deskGroup.position.set(x, 0, z);
            deskGroup.rotation.y = Math.random() * Math.PI * 2;

            this.scene.add(deskGroup);

            // Collision Box (Simplified to the desk top area)
            const box = new THREE.Box3().setFromObject(top);
            // We need to update the box world matrix if we want accurate static collision, 
            // but since we just placed it, we can compute it.
            // Actually, Box3.setFromObject computes world AABB. 
            // Since group is transformed, we need to update matrix world first.
            deskGroup.updateMatrixWorld(true);
            box.setFromObject(deskGroup);

            this.obstacles.push({ type: 'desk', box: box, mesh: deskGroup });
        }
    }

    generatePlants(count) {
        const potGeo = new THREE.CylinderGeometry(0.5, 0.4, 1, 8);
        const potMat = new THREE.MeshStandardMaterial({ color: 0xcc5500 }); // Terracotta
        const bushGeo = new THREE.DodecahedronGeometry(0.8);
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Forest Green

        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            const pot = new THREE.Mesh(potGeo, potMat);
            pot.position.y = 0.5;
            pot.castShadow = true;
            group.add(pot);

            const bush = new THREE.Mesh(bushGeo, bushMat);
            bush.position.y = 1.5;
            bush.castShadow = true;
            group.add(bush);

            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            group.position.set(x, 0, z);

            this.scene.add(group);

            group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(group);
            this.obstacles.push({ type: 'plant', box: box, mesh: group });
        }
    }

    generateWaterCoolers(count) {
        const baseGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const bottleGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8);
        const bottleMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });

        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 1;
            base.castShadow = true;
            group.add(base);

            const bottle = new THREE.Mesh(bottleGeo, bottleMat);
            bottle.position.y = 2.4;
            group.add(bottle);

            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            group.position.set(x, 0, z);

            this.scene.add(group);

            group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(group);
            this.obstacles.push({ type: 'cooler', box: box, mesh: group });
        }
    }

    checkCollision(position, radius) {
        // Simple sphere vs AABB check
        // Create a sphere for the entity
        const sphere = new THREE.Sphere(position, radius);

        for (const obs of this.obstacles) {
            if (obs.box.intersectsSphere(sphere)) {
                return true;
            }
        }
        return false;
    }

    // Helper to resolve collision (push out)
    resolveCollision(position, radius) {
        const sphere = new THREE.Sphere(position, radius);
        for (const obs of this.obstacles) {
            if (obs.box.intersectsSphere(sphere)) {
                // Very simple resolution: push back to previous position or slide
                // For now, just return true to indicate collision
                return true;
            }
        }
        return false;
    }
}
