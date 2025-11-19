export class InputHandler {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    getMovementVector() {
        let x = 0;
        let z = 0;

        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) z -= 1;
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) z += 1;
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;

        // Normalize if moving diagonally
        if (x !== 0 || z !== 0) {
            const length = Math.sqrt(x * x + z * z);
            x /= length;
            z /= length;
        }

        return { x, z };
    }
}
