class InputHandler {
    constructor() {
        this.keys = []; //arr to store held keys

        this.acceptedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

        window.addEventListener('keydown', (event) => {
            const key = event.key;
            if (this.keys.indexOf(key) !== -1) return;

            if (this.acceptedKeys.includes(key)) {
                this.keys.push(key);
            }
            console.log(this.keys)
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key;
            if (this.keys.indexOf(key) === -1) return;

            if (this.keys.includes(key)) {
                this.keys.splice(this.keys.indexOf(key), 1);
            }

            console.log(this.keys)
        });
    }

    
}

export { InputHandler }