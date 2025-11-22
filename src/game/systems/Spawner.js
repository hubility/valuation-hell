import * as THREE from 'three';
import { Enemy } from '../entities/Enemy.js';

export class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnRate = 2; // Seconds between spawns
        this.bossSpawned = false;
    }

    update(dt, playerPos, gameTime) {
        // Difficulty Scaling
        // Decrease spawn rate over time (min 0.5s)
        this.spawnRate = Math.max(0.5, 2.0 - (gameTime / 60));

        // Boss Spawn (at 60 seconds)
        if (gameTime > 60 && !this.bossSpawned) {
            this.spawnBoss(playerPos);
            this.bossSpawned = true;
        }

        // Spawn logic
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnEnemy(playerPos, gameTime);
        }

        // Update all enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, playerPos);

            if (enemy.isDead) {
                this.enemies.splice(i, 1);
            }
        }
    }

    spawnEnemy(playerPos, gameTime) {
        // Spawn at random angle, distance 15-20 from player
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 5;

        const x = playerPos.x + Math.cos(angle) * distance;
        const z = playerPos.z + Math.sin(angle) * distance;

        const spawnPos = new THREE.Vector3(x, 0, z);

        // Dynamic Type Logic based on Time
        let type = 'intern';
        const rand = Math.random();

        if (gameTime < 30) { // Seed Stage
            if (rand > 0.9) type = 'troll';
        } else if (gameTime < 60) { // Series A
            if (rand > 0.6) type = 'troll';
            if (rand > 0.85) type = 'client';
            if (rand > 0.95) type = 'toxic_vc'; // Rare early
        } else { // Series B+
            if (rand > 0.4) type = 'troll';
            if (rand > 0.7) type = 'client';
            if (rand > 0.85) type = 'toxic_vc';
            if (rand > 0.95) type = 'regulator';
        }

        const enemy = new Enemy(this.scene, spawnPos, type);
        this.enemies.push(enemy);
    }

    spawnBoss(playerPos) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15;
        const x = playerPos.x + Math.cos(angle) * distance;
        const z = playerPos.z + Math.sin(angle) * distance;
        const spawnPos = new THREE.Vector3(x, 0, z);

        const boss = new Enemy(this.scene, spawnPos, 'boss');
        this.enemies.push(boss);
        console.log("BOSS SPAWNED!");
    }

    spawnMinion(position, type) {
        const enemy = new Enemy(this.scene, position, type);
        this.enemies.push(enemy);
    }

    getEnemies() {
        return this.enemies;
    }
}
