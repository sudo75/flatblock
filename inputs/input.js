class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = []; //arr to store held keys
        this.mouse_realXY = {};
        this.mouseDown = false;
        this.mouseDown_right = false;

        this.acceptedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'e', 'r', 'c', 'h', 'q', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'F4', 'F8'];

        window.addEventListener('keydown', (event) => {
            const key = event.key;
            if (this.keys.indexOf(key) !== -1) return;

            if (this.acceptedKeys.includes(key)) {
                this.keys.push(key);
            }
        });

        window.addEventListener('keyup', (event) => {
            const keys = [event.key]; // Normalise to lowercase


            if (this.game.debugger.settings.wasd) {
                if (keys[0] === 'W') {
                    keys.push('w');
                }
                if (keys[0] === 'A') {
                    keys.push('a');
                }
                if (keys[0] === 'S') {
                    keys.push('s');
                }
                if (keys[0] === 'D') {
                    keys.push('d');
                }
            }
            
            const getIndicies = (keys) => {
                let indicies = [];
                for (let i = 0; i < keys.length; i++) {
                    indicies.push(this.keys.indexOf(keys[i]));
                }

                return indicies;
            }

            const indicies = getIndicies(keys);

            for (let i = 0; i < indicies.length; i++) {
                const index = indicies[i];
                if (index !== -1) {
                    this.keys.splice(index, 1);
                }
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

        this.game.canvas_player.addEventListener('mousedown', (event) => {
            if (event.which === 1) { // Left mouse
                this.mouseDown = true;
            }
            if (event.which === 3) { // Right mouse
                this.mouseDown_right = true;
            }
        });

        this.game.canvas_player.addEventListener('mouseup', (event) => {
            if (event.which === 1) { // Left mouse
                this.mouseDown = false;
            }
            if (event.which === 3) { // Right mouse
                this.mouseDown_right = false;
            }
        });

        this.game.canvas_player.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    }

    initSettings() {
        if (this.game?.debugger?.settings?.wasd) {
            this.acceptedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'e', 'r', 'c', 'h', 'q', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'F4', 'F8', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
        } else {
            this.acceptedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'e', 'r', 'c', 'h', 'q', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'F4', 'F8'];
        }
    }
}

export { InputHandler }