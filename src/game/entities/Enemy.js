import * as THREE from 'three';

// Vector temporal reutilizable para cálculos de movimiento (Evita Garbage Collection)
const _tempVec = new THREE.Vector3();

export class Enemy {
    constructor(scene, position, type = 'intern') {
        this.scene = scene;
        this.mesh = null;
        this.type = type;

        // Default Stats
        this.hp = 10;
        this.speed = 5;
        this.damage = 10;
        this.isDead = false;

        // Shooting
        this.canShoot = false;
        this.shootTimer = 0;
        this.shootRate = 2.0;

        // Animation State
        this.animOffset = Math.random() * 100;

        this.configureType();
        this.init(position);
    }

    configureType() {
        switch (this.type) {
            case 'troll':
                this.hp = 5;
                this.speed = 7; // Rápido y molesto
                this.damage = 5;
                this.scale = 0.8;
                this.floating = true; // Vuela
                break;
            case 'client':
                this.hp = 100; // Tanque
                this.speed = 2; // Lento
                this.damage = 50;
                this.canShoot = true; // Lanza "Scope Creep"
                break;
            case 'boss':
                this.hp = 500;
                this.speed = 2.5;
                this.damage = 100;
                this.attackCooldown = 0;
                this.maxAttackCooldown = 3.0;
                break;
            case 'toxic_vc':
                this.hp = 15;
                this.speed = 9; // Muy rápido
                this.damage = 15;
                break;
            case 'regulator':
                this.hp = 300; // Tanque masivo
                this.speed = 1.5; // Muy lento
                this.damage = 40;
                this.scale = 1.2;
                break;
            case 'intern':
            default:
                this.hp = 20;
                this.speed = 4;
                this.damage = 10;
                break;
        }
    }

    init(position) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);

        // Paleta de Colores Común
        this.colors = {
            skin: 0xffdbac,
            suit: 0x2c3e50,
            shirt: 0xffffff,
            troll: 0x1da1f2, // Twitter Blue
            coffee: 0x6f4e37,
            cup: 0xffffff,
            toxic: 0x00ff00, // Toxic Green
            regulator: 0x000080 // Navy Blue
        };

        switch (this.type) {
            case 'intern': this.createIntern(); break;
            case 'troll': this.createTroll(); break;
            case 'client': this.createClient(); break;
            case 'boss': this.createBoss(); break;
            case 'toxic_vc': this.createToxicVC(); break;
            case 'regulator': this.createRegulator(); break;
            default: this.createIntern(); break;
        }
    }

    // 1. EL BECARIO (Coffee Zombie)
    // Aspecto: Ojeras, encorvado, sosteniendo café gigante
    createIntern() {
        const matSkin = new THREE.MeshStandardMaterial({ color: 0xdddddd, flatShading: true }); // Pálido
        const matClothes = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, flatShading: true }); // Ropa gris triste
        const matCoffee = new THREE.MeshStandardMaterial({ color: this.colors.coffee, flatShading: true });
        const matCup = new THREE.MeshStandardMaterial({ color: this.colors.cup, flatShading: true });

        // Cuerpo (Encorvado)
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), matClothes);
        body.position.y = 0.5;
        body.rotation.x = 0.2; // Inclinado hacia adelante
        body.castShadow = true;
        this.mesh.add(body);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), matSkin);
        head.position.set(0, 0.4, 0.1);
        body.add(head);

        // Ojos (Rojos de cansancio)
        const eyeGeo = new THREE.BoxGeometry(0.08, 0.05, 0.05);
        const matEye = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eyeL = new THREE.Mesh(eyeGeo, matEye);
        eyeL.position.set(0.1, 0, 0.18);
        head.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, matEye);
        eyeR.position.set(-0.1, 0, 0.18);
        head.add(eyeR);

        // Brazos (Sosteniendo café)
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), matClothes);
        arm.position.set(0.25, 0, 0.1);
        arm.rotation.x = -1.0; // Levantado
        body.add(arm);

        const armL = arm.clone();
        armL.position.set(-0.25, 0, 0.1);
        body.add(armL);

        // Taza de Café Gigante
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.3, 8), matCup);
        cup.position.set(0, -0.2, 0.2); // En las manos
        cup.rotation.x = 1.5; // Vertical relativo al mundo
        arm.add(cup);

        // Líquido
        const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.13, 8), matCoffee);
        liquid.rotation.x = -Math.PI / 2;
        liquid.position.y = 0.15;
        cup.add(liquid);

        this.bodyRef = body; // Referencia para animar tembleque
    }

    // 2. EL TROLL (Pájaro Azul del Odio)
    // Aspecto: Geometría angular azul, alas, pico
    createTroll() {
        const matBlue = new THREE.MeshStandardMaterial({ color: this.colors.troll, roughness: 0.4, flatShading: true });
        const matBeak = new THREE.MeshStandardMaterial({ color: 0xffaa00, flatShading: true });
        const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });

        // Cuerpo (Icosaedro para ser redondo pero "low poly")
        const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), matBlue);
        body.position.y = 1.0; // Flotando
        body.castShadow = true;
        this.mesh.add(body);

        // Ojos grandes y juzgadores
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), matWhite);
        eye.position.set(0.15, 0.1, 0.3);
        body.add(eye);
        const eye2 = eye.clone();
        eye2.position.set(-0.15, 0.1, 0.3);
        body.add(eye2);

        // Pico
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), matBeak);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.1, 0.4);
        body.add(beak);

        // Alas
        const wingGeo = new THREE.BoxGeometry(0.6, 0.1, 0.3);
        this.wingL = new THREE.Mesh(wingGeo, matBlue);
        this.wingL.position.set(0.4, 0, 0);
        body.add(this.wingL);

        this.wingR = new THREE.Mesh(wingGeo, matBlue);
        this.wingR.position.set(-0.4, 0, 0);
        body.add(this.wingR);

        this.bodyRef = body;
    }

    // 3. EL CLIENTE (El Muro de Ladrillos / Traje)
    // Aspecto: Cuadrado, masivo, con teléfono gigante
    createClient() {
        const matSuit = new THREE.MeshStandardMaterial({ color: 0x4b0082, flatShading: true }); // Indigo
        const matSkin = new THREE.MeshStandardMaterial({ color: this.colors.skin, flatShading: true });
        const matPhone = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });

        // Cuerpo (Un bloque sólido)
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.5), matSuit);
        body.position.y = 0.7;
        body.castShadow = true;
        this.mesh.add(body);

        // Cabeza (Pequeña en comparación)
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matSkin);
        head.position.y = 0.6;
        body.add(head);

        // Brazo derecho sosteniendo teléfono
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), matSuit);
        armR.position.set(-0.5, 0, 0);
        armR.rotation.z = -2.5; // Brazo arriba hacia la oreja
        body.add(armR);

        // Teléfono gigante
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.05), matPhone);
        phone.position.set(0, -0.3, 0);
        armR.add(phone);

        this.bodyRef = body;
    }

    // 4. EL JEFE (Mantenemos tu diseño épico, optimizado)
    createBoss() {
        const matSuitDark = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7, flatShading: true });
        const matTie = new THREE.MeshStandardMaterial({ color: 0xe74c3c, emissive: 0x500000, flatShading: true });
        const matSkin = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.5, flatShading: true });
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2, flatShading: true });

        // Grupo base del Jefe
        const bossGroup = new THREE.Group();
        bossGroup.position.y = 0;
        this.mesh.add(bossGroup);

        // TORSO
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.0, 2.5, 5), matSuitDark);
        torso.position.y = 2.5;
        torso.castShadow = true;
        bossGroup.add(torso);

        // CABEZA
        const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6), matSkin);
        head.position.y = 1.5;
        torso.add(head);

        // Gafas VR
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0x000000 }));
        visor.position.set(0, 0.1, 0.4);
        head.add(visor);

        // BRAZOS
        const geoArm = new THREE.CylinderGeometry(0.5, 0.3, 1.5, 4);

        // Izquierdo
        const armL = new THREE.Mesh(geoArm, matSuitDark);
        armL.position.set(-1.6, 0.8, 0);
        armL.rotation.z = -0.5;
        torso.add(armL);

        // Derecho (Con Pluma/Lanza)
        const armR = new THREE.Mesh(geoArm, matSuitDark);
        armR.position.set(1.6, 0.8, 0);
        armR.rotation.z = 0.5;
        torso.add(armR);

        // Arma
        const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 3.5, 6), matGold);
        pen.rotation.x = Math.PI / 2;
        pen.position.set(0, -1, 1);
        armR.add(pen);

        this.bodyRef = torso; // Para animar flotación
        this.wingL = armL; // Reusamos variables para animar brazos
        this.wingR = armR;
    }

    // 5. VC TÓXICO (Velocista)
    // Aspecto: Traje verde neón, gafas de sol, actitud agresiva
    createToxicVC() {
        const matSuit = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true });
        const matToxic = new THREE.MeshStandardMaterial({ color: this.colors.toxic, emissive: 0x004400, flatShading: true });
        const matSkin = new THREE.MeshStandardMaterial({ color: this.colors.skin, flatShading: true });

        // Cuerpo delgado y aerodinámico
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.2), matSuit);
        body.position.y = 0.6;
        body.rotation.x = 0.4; // Inclinado hacia adelante (corriendo)
        body.castShadow = true;
        this.mesh.add(body);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), matSkin);
        head.position.set(0, 0.4, 0.1);
        body.add(head);

        // Gafas de sol (Tóxicas)
        const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.1), matToxic);
        glasses.position.set(0, 0.05, 0.1);
        head.add(glasses);

        // Maletín (lleno de cláusulas abusivas)
        const briefcase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.4), matToxic);
        briefcase.position.set(0.3, -0.1, 0);
        body.add(briefcase);

        this.bodyRef = body;
    }

    // 6. REGULADOR (El Tanque Burocrático)
    // Aspecto: Muro con patas, escudo GDPR
    createRegulator() {
        const matUniform = new THREE.MeshStandardMaterial({ color: this.colors.regulator, flatShading: true });
        const matShield = new THREE.MeshStandardMaterial({ color: 0x3333cc, metalness: 0.5, roughness: 0.2 });
        const matText = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Cuerpo masivo (Cubo grande)
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.6), matUniform);
        body.position.y = 0.8;
        body.castShadow = true;
        this.mesh.add(body);

        // Cabeza (Pequeña, casco)
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.3), matUniform);
        head.position.y = 0.6;
        body.add(head);

        // Escudo GDPR Gigante
        const shield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), matShield);
        shield.position.set(0, 0, 0.4);
        body.add(shield);

        this.bodyRef = body;
    }

    update(dt, playerPos) {
        if (this.isDead) return;

        // 1. Movimiento
        _tempVec.subVectors(playerPos, this.mesh.position).normalize();
        this.mesh.position.add(_tempVec.multiplyScalar(this.speed * dt));
        this.mesh.lookAt(playerPos.x, 0, playerPos.z);

        // 2. Animaciones Procedurales por Tipo
        const time = Date.now() * 0.001 + this.animOffset;

        if (this.type === 'intern') {
            // Efecto Cafeína: Vibración rápida
            this.bodyRef.position.x = Math.sin(time * 50) * 0.05;
            // Correr
            this.mesh.position.y = Math.abs(Math.sin(time * 15)) * 0.2;
        }
        else if (this.type === 'troll') {
            // Aleteo
            const wingSpeed = Math.sin(time * 20);
            this.wingL.rotation.z = wingSpeed * 0.5;
            this.wingR.rotation.z = -wingSpeed * 0.5;
            // Flotar agresivo
            this.mesh.position.y = 2 + Math.sin(time * 5) * 0.5;
        }
        else if (this.type === 'client') {
            // Caminar pesado (Wobble)
            this.mesh.rotation.z = Math.sin(time * 5) * 0.1;
            this.mesh.position.y = 0.7 + Math.abs(Math.sin(time * 5)) * 0.1;
        }
        else if (this.type === 'boss') {
            // Respiración amenazante
            this.bodyRef.position.y = 2.5 + Math.sin(time * 2) * 0.2;
            // Brazos moviéndose lentamente
            this.wingL.rotation.x = Math.sin(time) * 0.2;
            this.wingR.rotation.x = Math.cos(time) * 0.2;
        }
        else if (this.type === 'toxic_vc') {
            // Correr muy rápido
            this.bodyRef.position.y = 0.6 + Math.abs(Math.sin(time * 20)) * 0.1;
            this.bodyRef.rotation.z = Math.sin(time * 10) * 0.1;
        }
        else if (this.type === 'regulator') {
            // Paso lento y pesado
            this.bodyRef.position.y = 0.8 + Math.abs(Math.sin(time * 3)) * 0.05;
            this.bodyRef.rotation.z = Math.sin(time * 3) * 0.05;
        }
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
            // Flash white (Feedback visual de daño)
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    // Guardamos el color original si no existe
                    if (!child.userData.originalColor) {
                        child.userData.originalColor = child.material.color.getHex();
                    }

                    child.material.color.setHex(0xffffff); // Blanco flash

                    // Restaurar color
                    setTimeout(() => {
                        if (!this.isDead && child.material) {
                            child.material.color.setHex(child.userData.originalColor);
                        }
                    }, 50);
                }
            });
        }
    }
}