import * as THREE from 'three';
import { UserEntity } from '../entities/UserEntity.js';

export class DropSystem {
    constructor(scene) {
        this.scene = scene;
        this.drops = [];
    }

    spawnDrop(position) {
        const drop = new UserEntity(this.scene, position);
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
                this.drops.splice(i, 1);
            }
        }
        return leveledUp;
    }
}
