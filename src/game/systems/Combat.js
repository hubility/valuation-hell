import * as THREE from 'three';
import { Projectile } from '../entities/Projectile.js';
import { JuniorDev } from '../entities/JuniorDev.js';

export class Combat {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.shootTimer = 0;
        this.shootRate = 2.0; // Nerfed Auto-fire (slower)

        this.manualShootTimer = 0;
        this.manualShootRate = 0.2; // Fast manual fire

        this.autoFireEnabled = false; // Default to Manual Mode
        this.weaponType = 'basic'; // 'basic', 'fan'

        this.diluteTimer = 0;
        this.diluteCooldown = 5.0;

        this.referralProgramEnabled = false;

        // NFT Drop
        this.nftDropEnabled = false;
        this.nftDropTimer = 0;
        this.nftDropCooldown = 10.0;

        // Hiring Spree
        this.minions = [];
        this.hiringSpreeEnabled = false;
        this.hiringSpreeTimer = 0;
        this.hiringSpreeInterval = 5.0;
    }

    enableHiringSpree() {
        this.hiringSpreeEnabled = true;
        this.hiringSpreeTimer = this.hiringSpreeInterval; // Trigger immediately or soon
    }

    activatePivote() {
        const weapons = ['basic', 'fan', 'laser', 'cash_flamethrower'];
        // Random weapon, risk of getting basic even if you had fan
        const randomIndex = Math.floor(Math.random() * weapons.length);
        this.weaponType = weapons[randomIndex];
        console.log("Pivote activated! New weapon:", this.weaponType);

        // Adjust fire rates based on weapon
        if (this.weaponType === 'cash_flamethrower') {
            this.shootRate = 0.1; // Very fast
            this.manualShootRate = 0.05;
        } else if (this.weaponType === 'laser') {
            this.shootRate = 1.5;
            this.manualShootRate = 0.5;
        } else if (this.weaponType === 'fan') {
            this.shootRate = 2.0;
            this.manualShootRate = 0.2;
        } else {
            // Basic
            this.shootRate = 2.0;
            this.manualShootRate = 0.2;
        }
    }

    enableNFTDrop() {
        this.nftDropEnabled = true;
        this.nftDropTimer = 9.0; // Trigger soon
    }

    update(dt, player, enemies, inputHandler, dropSystem, particleSystem, floatingTextManager, spawner) {
        // Cooldowns
        if (this.diluteTimer > 0) this.diluteTimer -= dt;

        // NFT Drop Logic
        if (this.nftDropEnabled) {
            this.nftDropTimer += dt;
            if (this.nftDropTimer >= this.nftDropCooldown) {
                this.nftDropTimer = 0;
                this.triggerNFTDrop(player, enemies, particleSystem, floatingTextManager);
            }
        }

        // Hiring Spree Logic
        if (this.hiringSpreeEnabled) {
            this.hiringSpreeTimer += dt;
            if (this.hiringSpreeTimer >= this.hiringSpreeInterval) {
                this.hiringSpreeTimer = 0;
                const minion = new JuniorDev(this.scene, player.getPosition());
                this.minions.push(minion);
                if (floatingTextManager) {
                    floatingTextManager.showDamage(player.getPosition(), "HIRED!", 0x00ff00);
                }
            }
        }

        // Update Minions
        for (let i = this.minions.length - 1; i >= 0; i--) {
            const minion = this.minions[i];
            minion.update(dt, enemies, player.getPosition(), particleSystem, (origin, direction) => {
                const proj = new Projectile(this.scene, origin, direction);
                proj.speed = 20;
                proj.damage = minion.damage;

                // Clone material to avoid affecting all player projectiles
                if (proj.mesh && proj.mesh.material) {
                    proj.mesh.material = proj.mesh.material.clone();
                    proj.mesh.material.color.setHex(0x00ffff); // Cyan
                    proj.mesh.material.emissive.setHex(0x00ffff);
                }
                this.projectiles.push(proj);
            });
            if (minion.isDead) {
                this.minions.splice(i, 1);
            }
        }

        // 0. Mode Switching
        if (inputHandler.isKeyDown('Digit1')) this.autoFireEnabled = false;
        if (inputHandler.isKeyDown('Digit2')) this.autoFireEnabled = true;

        // Ability: Market Disruption (Dilute)
        if (inputHandler.isKeyDown('KeyE') && this.diluteTimer <= 0) {
            if (player.dilute()) {
                this.diluteTimer = this.diluteCooldown;
                this.triggerMarketDisruption(player, enemies, particleSystem, floatingTextManager);
            }
        }

        // 1. Auto-shoot logic
        if (this.autoFireEnabled) {
            this.shootTimer += dt;
            if (this.shootTimer >= this.shootRate) {
                this.shootTimer = 0;
                this.autoShoot(player, enemies);
            }
        }

        // 2. Manual Shoot logic
        this.manualShootTimer += dt;
        if (inputHandler.isKeyDown('Space') && this.manualShootTimer >= this.manualShootRate) {
            this.manualShootTimer = 0;
            this.manualShoot(player);
        }

        // 3. Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt);

            if (proj.isDead) {
                this.projectiles.splice(i, 1);
                continue;
            }

            if (proj.isEnemy) {
                // Enemy Projectile vs Player
                const dist = proj.getPosition().distanceTo(player.getPosition());
                if (dist < 1.0) {
                    player.takeDamage(proj.damage);
                    proj.die();
                    if (particleSystem) particleSystem.emit(player.getPosition(), 0xff0000, 5);
                    if (floatingTextManager) floatingTextManager.showDamage(player.getPosition(), proj.damage);
                }
            } else {
                // Player Projectile vs Enemy
                for (const enemy of enemies) {
                    if (enemy.isDead) continue;

                    const dist = proj.getPosition().distanceTo(enemy.getPosition());
                    if (dist < 1.0) {
                        enemy.takeDamage(proj.damage);
                        proj.die();

                        // Hit Effect
                        if (particleSystem) {
                            particleSystem.emit(enemy.getPosition(), 0xffffff, 3);
                        }

                        // Floating Text
                        if (floatingTextManager) {
                            floatingTextManager.showDamage(enemy.getPosition(), proj.damage);
                        }

                        if (enemy.isDead) {
                            dropSystem.spawnDrop(enemy.getPosition(), player);
                            // Death Explosion
                            if (particleSystem) {
                                particleSystem.emit(enemy.getPosition(), enemy.color || 0xff0000, 10);
                            }

                            // Referral Program (Chain Reaction)
                            if (this.referralProgramEnabled) {
                                this.triggerReferralExplosion(enemy.getPosition(), enemies, particleSystem, floatingTextManager);
                            }
                        }
                        break;
                    }
                }
            }
        }

        // 4. Collision: Enemy vs Player & Enemy Shooting & Boss Logic
        const playerPos = player.getPosition();
        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            // Boss Logic
            if (enemy.type === 'boss') {
                enemy.attackCooldown -= dt;
                if (enemy.attackCooldown <= 0) {
                    enemy.attackCooldown = enemy.maxAttackCooldown;
                    this.bossAttack(enemy, playerPos, spawner);
                }
            }

            // Shooting Logic (Clients)
            if (enemy.canShoot) {
                enemy.shootTimer += dt;
                if (enemy.shootTimer >= enemy.shootRate) {
                    enemy.shootTimer = 0;
                    this.fireEnemyProjectile(enemy.getPosition(), playerPos);
                }
            }

            const dist = enemy.getPosition().distanceTo(playerPos);
            if (dist < 1.0) {
                if (enemy.type === 'troll') {
                    // Trolls damage Hype
                    player.takeHypeDamage(enemy.damage * dt);
                } else if (enemy.type === 'toxic_vc') {
                    // Toxic VC damages Cash AND Equity
                    player.takeDamage(enemy.damage * dt);
                    // Reduce equity by 2% per second of contact
                    player.loseEquityPercent(2 * dt);
                } else {
                    // Others damage Cash
                    player.takeDamage(enemy.damage * dt);
                }
            }
        }
    }

    bossAttack(boss, playerPos, spawner) {
        const rand = Math.random();
        if (rand > 0.5) {
            // "Term Sheet" Barrage (8 shots in circle)
            console.log("Boss Attack: Term Sheet Barrage");
            const count = 8;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                const proj = new Projectile(this.scene, boss.getPosition(), dir, true);
                proj.speed = 10;
                proj.damage = 50;
                this.projectiles.push(proj);
            }
        } else {
            // "Hiring Freeze" Summoning
            console.log("Boss Attack: Hiring Freeze");
            if (spawner) {
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2;
                    const offset = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(5);
                    const spawnPos = boss.getPosition().clone().add(offset);
                    spawner.spawnMinion(spawnPos, 'intern');
                }
            }
        }
    }

    fireEnemyProjectile(origin, targetPos) {
        const direction = new THREE.Vector3()
            .subVectors(targetPos, origin)
            .normalize();

        // Add some randomness/inaccuracy
        direction.x += (Math.random() - 0.5) * 0.2;
        direction.z += (Math.random() - 0.5) * 0.2;
        direction.normalize();

        const proj = new Projectile(this.scene, origin, direction, true); // isEnemy = true
        proj.speed = 8; // Slower than player bullets
        proj.damage = 100; // High damage
        this.projectiles.push(proj);
    }

    autoShoot(player, enemies) {
        // Find nearest enemy
        let nearest = null;
        let minDst = Infinity;
        const playerPos = player.getPosition();

        for (const enemy of enemies) {
            const dst = playerPos.distanceTo(enemy.getPosition());
            if (dst < 15 && dst < minDst) { // Range check
                minDst = dst;
                nearest = enemy;
            }
        }

        if (nearest) {
            const direction = new THREE.Vector3()
                .subVectors(nearest.getPosition(), playerPos)
                .normalize();

            this.firePattern(playerPos, direction);
        }
    }

    manualShoot(player) {
        const playerPos = player.getPosition();
        const direction = player.getFacingDirection();
        this.firePattern(playerPos, direction, true);
    }

    firePattern(origin, direction, isManual = false) {
        if (this.weaponType === 'fan') {
            // Growth Hacking: 3 shots
            const angles = [0, -0.2, 0.2];
            angles.forEach(angle => {
                const dir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                const proj = new Projectile(this.scene, origin, dir);
                if (isManual) proj.speed = 20;
                this.projectiles.push(proj);
            });
        } else if (this.weaponType === 'laser') {
            // Laser: Fast, Blue, Penetrating (maybe? for now just simple fast projectile)
            const proj = new Projectile(this.scene, origin, direction);
            proj.speed = 40; // Very fast
            proj.damage = 40;
            proj.color = 0x0000ff; // Blue
            if (proj.mesh && proj.mesh.material) proj.mesh.material.color.setHex(0x0000ff);
            this.projectiles.push(proj);

        } else if (this.weaponType === 'cash_flamethrower') {
            // Flamethrower: Short range, spread, high rate
            const spread = 0.3;
            const dir = direction.clone();
            dir.x += (Math.random() - 0.5) * spread;
            dir.z += (Math.random() - 0.5) * spread;
            dir.normalize();

            const proj = new Projectile(this.scene, origin, dir);
            proj.speed = 15;
            proj.damage = 10; // Low damage per hit
            proj.color = 0x00ff00; // Green cash fire
            if (proj.mesh && proj.mesh.material) proj.mesh.material.color.setHex(0x00ff00);

            // Short lifetime for flamethrower effect
            // We might need to add lifetime to Projectile or just let it fly
            // For now, standard projectile logic applies

            this.projectiles.push(proj);

        } else {
            // Basic MVP
            const proj = new Projectile(this.scene, origin, direction);
            if (isManual) proj.speed = 20;
            this.projectiles.push(proj);
        }
    }

    triggerMarketDisruption(player, enemies, particleSystem, floatingTextManager) {
        const playerPos = player.getPosition();
        const range = 10;
        const damage = 50;

        // Visual Effect
        if (particleSystem) {
            particleSystem.emit(playerPos, 0x00ffff, 50); // Cyan explosion
        }

        // AoE Damage
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = enemy.getPosition().distanceTo(playerPos);
            if (dist < range) {
                enemy.takeDamage(damage);
                if (floatingTextManager) {
                    floatingTextManager.showDamage(enemy.getPosition(), damage);
                }
            }
        }
    }

    triggerReferralExplosion(position, enemies, particleSystem, floatingTextManager) {
        const range = 6;
        const damage = 20;

        // Visual Effect (Purple)
        if (particleSystem) {
            particleSystem.emit(position, 0x800080, 20);
        }

        // AoE Damage
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = enemy.getPosition().distanceTo(position);
            if (dist < range) {
                enemy.takeDamage(damage);
                if (floatingTextManager) {
                    floatingTextManager.showDamage(enemy.getPosition(), damage);
                }
            }
        }
    }

    triggerNFTDrop(player, enemies, particleSystem, floatingTextManager) {
        const playerPos = player.getPosition();
        const range = 15; // Huge range
        const damage = 200; // Massive damage

        // Visual Effect (Gold)
        if (particleSystem) {
            particleSystem.emit(playerPos, 0xffd700, 100); // Gold explosion, lots of particles
        }

        // AoE Damage
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dist = enemy.getPosition().distanceTo(playerPos);
            if (dist < range) {
                enemy.takeDamage(damage);
                if (floatingTextManager) {
                    floatingTextManager.showDamage(enemy.getPosition(), damage);
                }
            }
        }
    }
}
