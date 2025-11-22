import * as THREE from 'three';
import { UserEntity } from '../entities/UserEntity.js';

export class DropSystem {
    constructor(scene) {
        this.scene = scene;
        this.drops = [];
    }

    spawnDrop(position, player) {
        // Calculate value based on Hype
        // 50 Hype = 10 Users (Base)
        // 100 Hype = 20 Users
        // 0 Hype = 0 (but clamped to 1)
        let value = Math.floor(10 * (player.hype / 50));
        value = Math.max(1, value); // Minimum 1 user

        const drop = new UserEntity(this.scene, position, value);
        this.drops.push(drop);
    }

    update(dt, player) {
        const playerPos = player.getPosition();
        let leveledUp = false;

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            drop.update(dt, playerPos);

            // Collection check
            if (drop.getPosition().distanceTo(playerPos) < 1.0) {
                drop.collect();
                if (player.gainXP(drop.value)) {
                    leveledUp = true;
                }

                // Feedback for High Conversion
                if (drop.value > 15) {
                    console.log("¡Alta Conversión! +" + drop.value + " Usuarios");
                }

                this.drops.splice(i, 1);
            }
        }
        return leveledUp;
    }
}
