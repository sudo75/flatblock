class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = []; //arr to store held keys
        this.mouse_realXY = {};
        this.mouseDown = false;

        this.acceptedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'];

        window.addEventListener('keydown', (event) => {
            const key = event.key;
            if (this.keys.indexOf(key) !== -1) return;

            if (this.acceptedKeys.includes(key)) {
                this.keys.push(key);
            }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key;
            if (this.keys.indexOf(key) === -1) return;

            if (this.keys.includes(key)) {
                this.keys.splice(this.keys.indexOf(key), 1);
            }
        });

        this.game.canvas_player.addEventListener('mousemove', (event) => {
            let rect = this.game.canvas_player.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            this.mouse_realXY = {
                x: x,
                y: y
            };
        });

        this.game.canvas_player.addEventListener('mousedown', () => {
            this.mouseDown = true;
        });

        this.game.canvas_player.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }

    
}

export { InputHandler }