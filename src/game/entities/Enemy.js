import * as THREE from 'three';

// --- Shared Geometries (Optimization) ---
const geoInternBody = new THREE.BoxGeometry(0.5, 0.6, 0.3);
const geoInternHead = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const geoPropeller = new THREE.BoxGeometry(0.4, 0.05, 0.05);

const geoClientBody = new THREE.BoxGeometry(0.6, 0.9, 0.4);
const geoClientHead = new THREE.BoxGeometry(0.35, 0.35, 0.35);
const geoBriefcase = new THREE.BoxGeometry(0.1, 0.3, 0.4);

const geoTrollBody = new THREE.DodecahedronGeometry(0.4);
const geoTrollHead = new THREE.BoxGeometry(0.25, 0.25, 0.3);

const geoBossBody = new THREE.BoxGeometry(1.5, 2, 1);
const geoBossHead = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const geoBossWing = new THREE.BoxGeometry(2, 0.1, 1);

export class Enemy {
    constructor(scene, position, type = 'intern') {
        this.scene = scene;
        this.mesh = null;
        this.type = type;

        // Default Stats
        this.hp = 10;
        this.speed = 5;
        this.damage = 10; // Cash damage per second
        this.isDead = false;

        // Shooting
        this.canShoot = false;
        this.shootTimer = 0;
        this.shootRate = 2.0;

        this.configureType();
        this.init(position);
    }

    configureType() {
        switch (this.type) {
            case 'troll':
                this.hp = 5;
                this.speed = 9; // Fast
                this.damage = 5;
                this.scale = 0.5;
                break;
            case 'client':
                this.hp = 150; // Tanky
                this.speed = 1.5; // Slow
                this.damage = 100;
                this.canShoot = true; // Clients shoot!
                break;
            case 'boss':
                this.hp = 500; // Boss HP
                this.speed = 2.0;
                this.damage = 100;
                this.attackCooldown = 0;
                this.maxAttackCooldown = 3.0;
                break;
            case 'intern':
            default:
                this.hp = 30;
                this.speed = 3.5;
                this.damage = 50;
                break;
        }
    }

    init(position) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);

        switch (this.type) {
            case 'intern': this.createIntern(); break;
            case 'troll': this.createTroll(); break;
            case 'client': this.createClient(); break;
            case 'boss': this.createBoss(); break;
            default: this.createIntern(); break;
        }
    }

    createIntern() {
        // Unique materials to allow flashing without affecting others
        const matBody = new THREE.MeshStandardMaterial({ color: 0xff4444 });
        const matHead = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const matProp = new THREE.MeshStandardMaterial({ color: 0xffff00 });

        const body = new THREE.Mesh(geoInternBody, matBody);
        body.position.y = 0.3;
        body.castShadow = true;
        this.mesh.add(body);

        const head = new THREE.Mesh(geoInternHead, matHead);
        head.position.y = 0.5;
        head.castShadow = true;
        body.add(head);

        this.propeller = new THREE.Mesh(geoPropeller, matProp);
        this.propeller.position.y = 0.2;
        head.add(this.propeller);
    }

    createClient() {
        const matBody = new THREE.MeshStandardMaterial({ color: 0x4b0082 });
        const matHead = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const matCase = new THREE.MeshStandardMaterial({ color: 0x331100 });

        const body = new THREE.Mesh(geoClientBody, matBody);
        body.position.y = 0.45;
        body.castShadow = true;
        this.mesh.add(body);

        const head = new THREE.Mesh(geoClientHead, matHead);
        head.position.y = 0.65;
        head.castShadow = true;
        body.add(head);

        const briefcase = new THREE.Mesh(geoBriefcase, matCase);
        briefcase.position.set(0.4, 0, 0);
        briefcase.castShadow = true;
        body.add(briefcase);
    }

    createTroll() {
        const matBody = new THREE.MeshStandardMaterial({ color: 0x00aa00 });

        const body = new THREE.Mesh(geoTrollBody, matBody);
        body.position.y = 0.3;
        body.castShadow = true;
        this.mesh.add(body);

        const head = new THREE.Mesh(geoTrollHead, matBody);
        head.position.set(0, 0.3, 0.2);
        head.castShadow = true;
        body.add(head);
    }

    /*

    createBoss() {
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
        const matDollar = new THREE.MeshStandardMaterial({ color: 0x85bb65 });

        const body = new THREE.Mesh(geoBossBody, matGold);
        body.position.y = 1;
        body.castShadow = true;
        this.mesh.add(body);

        const head = new THREE.Mesh(geoBossHead, matGold);
        head.position.y = 1.5;
        head.castShadow = true;
        body.add(head);

        const wingL = new THREE.Mesh(geoBossWing, matDollar);
        wingL.position.set(-1, 1, -0.5);
        wingL.rotation.z = 0.5;
        body.add(wingL);

        const wingR = new THREE.Mesh(geoBossWing, matDollar);
        wingR.position.set(1, 1, -0.5);
        wingR.rotation.z = -0.5;
        body.add(wingR);
    }

    */

    /*
    createBoss() {
        // Definición de Geometrías (Usaremos Box/Cylinder/Sphere para el ejemplo)
        const geoSuitBody = new THREE.BoxGeometry(1.5, 2.5, 1);
        const geoHead = new THREE.SphereGeometry(0.7, 16, 16);
        const geoBriefcase = new THREE.BoxGeometry(0.8, 0.6, 0.3);
        const geoArm = new THREE.BoxGeometry(0.3, 1, 0.3);
        const geoTie = new THREE.BoxGeometry(0.3, 0.8, 0.1);
        const geoHalo = new THREE.CylinderGeometry(2.5, 2.5, 0.1, 32);

        // Definición de Materiales
        const matSuit = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.7 }); // Traje negro
        const matSkin = new THREE.MeshStandardMaterial({ color: 0xf5deb3 }); // Color de piel
        const matTie = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.0, roughness: 0.4 }); // Corbata roja
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 }); // Oro/Metal para el maletín
        const matEquityDrain = new THREE.MeshBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.4, side: THREE.DoubleSide }); // Púrpura para el drenaje de equity

        // 1. Cuerpo (Traje)
        const body = new THREE.Mesh(geoSuitBody, matSuit);
        body.position.y = 1.25;
        body.castShadow = true;
        this.mesh.add(body);

        // 2. Cabeza (con gafas/aspecto de élite)
        const head = new THREE.Mesh(geoHead, matSkin);
        head.position.y = 1.8;
        head.castShadow = true;
        body.add(head);

        // 2.1. Detalle: Gafas de Sol
        const geoGlassesFrame = new THREE.BoxGeometry(1.6, 0.2, 0.1);
        const matGlasses = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const glasses = new THREE.Mesh(geoGlassesFrame, matGlasses);
        glasses.position.set(0, 0.05, 0.6);
        head.add(glasses);

        // 2.2. Detalle: Corbata
        const tie = new THREE.Mesh(geoTie, matTie);
        tie.position.set(0, -0.6, 0.55);
        body.add(tie);

        // 3. Brazo y Maletín
        const armR = new THREE.Mesh(geoArm, matSuit);
        armR.position.set(0.9, 0, 0); // Posición relativa al cuerpo
        body.add(armR);

        // 3.1. El Maletín (símbolo de su riqueza/poder)
        const briefcase = new THREE.Mesh(geoBriefcase, matGold);
        briefcase.position.set(0.5, -0.5, 0); // Sostenido por el brazo derecho
        briefcase.rotation.y = Math.PI / 4;
        armR.add(briefcase);


        // 4. Halo de Drenaje (El área de efecto del daño de Equity)
        // Esto es crucial para el gameplay, un cilindro transparente que marca la zona de peligro.
        const drainHalo = new THREE.Mesh(geoHalo, matEquityDrain);
        drainHalo.position.y = 0.05; // Justo por encima del suelo
        this.mesh.add(drainHalo);

        // Opcional: Rotación animada del maletín o el halo en el loop de actualización para hacerlo dinámico
    }
        */

    createBoss() {
        // --- MATERIALES (La clave del estilo Low Poly es flatShading: true) ---
        const matSuitDark = new THREE.MeshStandardMaterial({
            color: 0x2c3e50, // Azul marino oscuro corporativo
            roughness: 0.7,
            flatShading: true // <--- ESTO da el look "low poly" de tu imagen
        });

        const matShirt = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            flatShading: true
        });

        const matTie = new THREE.MeshStandardMaterial({
            color: 0xe74c3c, // Rojo agresivo
            emissive: 0x500000, // Un ligero brillo maligno
            flatShading: true
        });

        const matSkin = new THREE.MeshStandardMaterial({
            color: 0xffccaa,
            roughness: 0.5,
            flatShading: true
        });

        const matGold = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            flatShading: true
        });

        // --- JERARQUÍA DEL CUERPO ---

        // 1. TORSO (Grande y triangular, como un gorila)
        // CylinderGeometry(radioTop, radioBottom, height, segmentos) -> segmentos bajos = look angular
        const geoTorso = new THREE.CylinderGeometry(1.8, 1.0, 2.5, 5);
        const torso = new THREE.Mesh(geoTorso, matSuitDark);
        torso.position.y = 2.5;
        torso.castShadow = true;
        this.mesh.add(torso);

        // 2. CABEZA (Pequeña y angular)
        const geoHead = new THREE.DodecahedronGeometry(0.6); // Forma geométrica compleja
        const head = new THREE.Mesh(geoHead, matSkin);
        head.position.y = 1.5; // Posición relativa al torso (encima)
        torso.add(head);

        // Gafas de realidad mixta (Apple Vision / Meta Quest exagerado - "El Futuro")
        const geoVisor = new THREE.BoxGeometry(0.9, 0.3, 0.4);
        const matVisor = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.1 });
        const visor = new THREE.Mesh(geoVisor, matVisor);
        visor.position.set(0, 0.1, 0.4);
        head.add(visor);

        // 3. BRAZOS (Masivos, separados del cuerpo estilo Rayman o unidos por juntas invisibles)

        // Hombros (Hombreras del traje exageradas)
        const geoShoulder = new THREE.OctahedronGeometry(0.9);

        // Brazo Izquierdo
        const shoulderL = new THREE.Mesh(geoShoulder, matSuitDark);
        shoulderL.position.set(-1.6, 0.8, 0);
        torso.add(shoulderL);

        const geoArm = new THREE.CylinderGeometry(0.5, 0.3, 1.5, 4);
        const armL = new THREE.Mesh(geoArm, matSuitDark);
        armL.position.y = -1;
        shoulderL.add(armL);

        // Puño Izquierdo (Caja fuerte/Guantelete)
        const geoFist = new THREE.DodecahedronGeometry(0.5);
        const fistL = new THREE.Mesh(geoFist, matSkin);
        fistL.position.y = -0.9;
        armL.add(fistL);

        // Brazo Derecho (El brazo del castigo)
        const shoulderR = new THREE.Mesh(geoShoulder, matSuitDark);
        shoulderR.position.set(1.6, 0.8, 0);
        torso.add(shoulderR);

        const armR = new THREE.Mesh(geoArm, matSuitDark);
        armR.position.y = -1;
        shoulderR.add(armR);

        // ARMA: "La Pluma Estilográfica Gigante" (o un mazo de Term Sheet)
        // Vamos a hacer una Pluma Dorada que usa como lanza
        const geoPen = new THREE.CylinderGeometry(0.1, 0.05, 2.5, 6);
        const pen = new THREE.Mesh(geoPen, matGold);
        pen.rotation.x = Math.PI / 2; // Apuntando hacia adelante
        pen.position.set(0, -1, 1); // Sostenida en la mano
        armR.add(pen);

        // Punta de la pluma (peligrosa)
        const geoTip = new THREE.ConeGeometry(0.15, 0.5, 8);
        const tip = new THREE.Mesh(geoTip, matTie); // Roja por la "tinta/sangre"
        tip.position.y = 1.5; // Punta de la pluma
        pen.add(tip);

        // 4. CORBATA DE PODER (Flotando ligeramente)
        const geoTieC = new THREE.ConeGeometry(0.4, 1.2, 4);
        const tie = new THREE.Mesh(geoTieC, matTie);
        tie.rotation.z = Math.PI; // Invertir cono
        tie.position.set(0, 0, 0.9); // En el pecho
        tie.scale.z = 0.2; // Aplanarla
        torso.add(tie);

        // 5. AURA DE "VALUATION CAP" (Visualización del rango de ataque)
        const geoAura = new THREE.RingGeometry(3.5, 3.8, 32);
        const matAura = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const aura = new THREE.Mesh(geoAura, matAura);
        aura.rotation.x = -Math.PI / 2; // Acostado en el suelo
        aura.position.y = -2.4; // A nivel de suelo relativo al torso
        torso.add(aura);

        // Referencia para animaciones
        this.torso = torso;
        this.shoulderR = shoulderR;
        this.shoulderL = shoulderL;
    }

    update(dt, playerPos) {
        if (this.isDead) return;

        const dir = new THREE.Vector3()
            .subVectors(playerPos, this.mesh.position)
            .normalize();

        this.mesh.position.add(dir.multiplyScalar(this.speed * dt));
        this.mesh.lookAt(playerPos.x, 0, playerPos.z);

        // Simple Animations
        if (this.type === 'intern' && this.propeller) {
            this.propeller.rotation.y += dt * 10; // Spin propeller
        }

        // Bobbing for all
        this.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.005 * this.speed)) * 0.2;
    }

    getPosition() {
        return this.mesh.position;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDead = true;
            this.scene.remove(this.mesh);
        } else {
            // Flash white
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    const oldColor = child.material.color.getHex();
                    child.material.color.setHex(0xffffff);
                    setTimeout(() => {
                        if (!this.isDead && child.material) child.material.color.setHex(oldColor);
                    }, 50);
                }
            });
        }
    }
}
