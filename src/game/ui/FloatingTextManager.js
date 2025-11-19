import * as THREE from 'three';

export class FloatingTextManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('ui-layer');
        this.texts = [];
    }

    showDamage(position, amount) {
        const element = document.createElement('div');
        element.innerText = Math.round(amount);
        element.style.position = 'absolute';
        element.style.color = '#ffcc00';
        element.style.fontWeight = 'bold';
        element.style.fontSize = '20px';
        element.style.pointerEvents = 'none';
        element.style.textShadow = '1px 1px 0 #000';
        element.style.userSelect = 'none';

        this.container.appendChild(element);

        this.texts.push({
            element: element,
            worldPos: position.clone(),
            life: 1.0, // Seconds
            velocity: new THREE.Vector3(0, 2, 0) // Float up
        });
    }

    update(dt) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const item = this.texts[i];
            item.life -= dt;

            if (item.life <= 0) {
                item.element.remove();
                this.texts.splice(i, 1);
                continue;
            }

            // Move world position up
            item.worldPos.add(item.velocity.clone().multiplyScalar(dt));

            // Project to Screen
            const screenPos = item.worldPos.clone().project(this.game.camera);

            const x = (screenPos.x * .5 + .5) * this.game.container.clientWidth;
            const y = (-(screenPos.y * .5) + .5) * this.game.container.clientHeight;

            item.element.style.left = `${x}px`;
            item.element.style.top = `${y}px`;
            item.element.style.opacity = item.life; // Fade out
        }
    }
}
