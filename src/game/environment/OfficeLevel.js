import * as THREE from 'three';

export class OfficeLevel {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = []; // Array of { mesh, box: Box3 }
        this.time = 0; // For animations
        this.init();
    }

    update(dt) {
        this.time += dt;

        // Animate server rack lights
        this.obstacles.forEach(obs => {
            if (obs.type === 'server') {
                obs.mesh.children.forEach(child => {
                    if (child.userData.blinkSpeed) {
                        const intensity = Math.abs(Math.sin(this.time * child.userData.blinkSpeed + child.userData.blinkOffset));
                        child.material.emissiveIntensity = intensity * 0.8 + 0.2;
                    }
                });
            }
        });
    }

    init() {
        // Generate random office layout
        this.generateDesks(10);
        this.generatePlants(8);
        this.generateWaterCoolers(4);
        this.generateServerRacks();
        this.generateWhiteboards(6);
    }

    generateDesks(count) {
        const deskGeo = new THREE.BoxGeometry(4, 0.2, 2);
        const legGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        const monitorGeo = new THREE.BoxGeometry(1, 0.8, 0.1);
        const screenGeo = new THREE.BoxGeometry(0.9, 0.7, 0.05);
        const pizzaBoxGeo = new THREE.BoxGeometry(0.3, 0.05, 0.3);

        const deskMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Wood
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Metal
        const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black plastic
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x2222ff, emissive: 0x000055 }); // Screen glow
        const pizzaBoxMat = new THREE.MeshStandardMaterial({ color: 0xff3333 }); // Red pizza box
        const pizzaLidMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee }); // White lid

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

            // Monitor (Vertical Black Plane)
            const monitor = new THREE.Mesh(monitorGeo, monitorMat);
            monitor.position.set(0, 2, -0.5);
            monitor.castShadow = true;
            deskGroup.add(monitor);

            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.set(0, 2, -0.45);
            deskGroup.add(screen);

            // Add Pizza Boxes (randomly on some desks)
            if (Math.random() > 0.5) {
                const pizzaCount = Math.floor(Math.random() * 2) + 1;
                for (let p = 0; p < pizzaCount; p++) {
                    const pizzaBox = new THREE.Mesh(pizzaBoxGeo, p % 2 === 0 ? pizzaBoxMat : pizzaLidMat);
                    pizzaBox.position.set(
                        (Math.random() - 0.5) * 3,
                        1.6 + (p * 0.06),
                        (Math.random() - 0.5) * 1.5
                    );
                    pizzaBox.rotation.y = Math.random() * Math.PI;
                    pizzaBox.castShadow = true;
                    deskGroup.add(pizzaBox);
                }
            }

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
        const potGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6); // Voxel pot
        const potMat = new THREE.MeshStandardMaterial({ color: 0xcc5500 }); // Terracotta
        const leafGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3); // Small cube for leaves
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Forest Green

        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            // Voxel Pot
            const pot = new THREE.Mesh(potGeo, potMat);
            pot.position.y = 0.4;
            pot.castShadow = true;
            group.add(pot);

            // Voxel Leaves (stacked cubes with random rotation)
            const leafCount = Math.floor(Math.random() * 4) + 5; // 5-8 leaf cubes
            for (let l = 0; l < leafCount; l++) {
                const leaf = new THREE.Mesh(leafGeo, leafMat);

                // Stack leaves with some random offset
                const angle = (Math.PI * 2 * l) / leafCount;
                const radius = Math.random() * 0.3 + 0.2;
                leaf.position.set(
                    Math.cos(angle) * radius,
                    1.0 + Math.random() * 0.6,
                    Math.sin(angle) * radius
                );

                // Random rotation for voxel look
                leaf.rotation.x = Math.random() * Math.PI * 0.3;
                leaf.rotation.y = Math.random() * Math.PI * 2;
                leaf.rotation.z = Math.random() * Math.PI * 0.3;

                leaf.castShadow = true;
                group.add(leaf);
            }

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

    generateServerRacks() {
        // Create server rack walls around the play area boundaries
        const rackGeo = new THREE.BoxGeometry(2, 4, 1);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const lightGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);

        const positions = [
            // North wall
            ...Array.from({ length: 20 }, (_, i) => ({ x: -48 + i * 5, z: 48, rot: 0 })),
            // South wall
            ...Array.from({ length: 20 }, (_, i) => ({ x: -48 + i * 5, z: -48, rot: Math.PI })),
            // East wall
            ...Array.from({ length: 20 }, (_, i) => ({ x: 48, z: -48 + i * 5, rot: Math.PI / 2 })),
            // West wall
            ...Array.from({ length: 20 }, (_, i) => ({ x: -48, z: -48 + i * 5, rot: -Math.PI / 2 }))
        ];

        positions.forEach((pos, idx) => {
            const group = new THREE.Group();

            // Server rack body
            const rack = new THREE.Mesh(rackGeo, rackMat);
            rack.position.y = 2;
            rack.castShadow = true;
            group.add(rack);

            // Add blinking lights (green/red)
            const lightCount = 8;
            for (let i = 0; i < lightCount; i++) {
                const isGreen = Math.random() > 0.3;
                const lightMat = new THREE.MeshStandardMaterial({
                    color: isGreen ? 0x00ff00 : 0xff0000,
                    emissive: isGreen ? 0x00ff00 : 0xff0000,
                    emissiveIntensity: 0.5 + Math.random() * 0.5
                });

                const light = new THREE.Mesh(lightGeo, lightMat);
                light.position.set(
                    (Math.random() - 0.5) * 1.5,
                    0.5 + i * 0.4,
                    0.52
                );

                // Store for animation
                light.userData.blinkSpeed = 0.5 + Math.random() * 2;
                light.userData.blinkOffset = Math.random() * Math.PI * 2;

                group.add(light);
            }

            group.position.set(pos.x, 0, pos.z);
            group.rotation.y = pos.rot;

            this.scene.add(group);

            group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(group);
            this.obstacles.push({ type: 'server', box: box, mesh: group });
        });
    }

    generateWhiteboards(count) {
        const boardGeo = new THREE.BoxGeometry(3, 2, 0.1);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

        for (let i = 0; i < count; i++) {
            const group = new THREE.Group();

            // Whiteboard
            const board = new THREE.Mesh(boardGeo, boardMat);
            board.position.y = 2;
            board.castShadow = true;
            board.receiveShadow = true;
            group.add(board);

            // Add colorful scribbles using small boxes
            const scribbleColors = [0xff0000, 0x0000ff, 0x00ff00, 0xff00ff, 0x000000];
            const scribbleCount = Math.floor(Math.random() * 10) + 5;

            for (let s = 0; s < scribbleCount; s++) {
                const scribbleGeo = new THREE.BoxGeometry(
                    Math.random() * 0.5 + 0.1,
                    Math.random() * 0.3 + 0.05,
                    0.02
                );
                const scribbleMat = new THREE.MeshStandardMaterial({
                    color: scribbleColors[Math.floor(Math.random() * scribbleColors.length)]
                });

                const scribble = new THREE.Mesh(scribbleGeo, scribbleMat);
                scribble.position.set(
                    (Math.random() - 0.5) * 2.5,
                    2 + (Math.random() - 0.5) * 1.5,
                    0.06
                );
                scribble.rotation.z = (Math.random() - 0.5) * Math.PI * 0.5;

                group.add(scribble);
            }

            const x = (Math.random() - 0.5) * 70;
            const z = (Math.random() - 0.5) * 70;
            group.position.set(x, 0, z);
            group.rotation.y = Math.random() * Math.PI * 2;

            this.scene.add(group);

            group.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(group);
            this.obstacles.push({ type: 'whiteboard', box: box, mesh: group });
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
