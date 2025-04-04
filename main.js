//ENTRY POINT

const canvases = document.querySelectorAll('.game_canvas');

class Viewport {
    constructor(canvases, width, height) {
        this.canvases = canvases;
        this.width = width;
        this.height = height;
    }

    init() {
        this.canvases.forEach(canvas => {
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.left = 0;
            canvas.top = 0;
        });
    }
}

const viewport = new Viewport(canvases, 600, 600);
viewport.init();

import { Game } from './game.js';
// Initialize and run the game
const game = new Game(600, 600);
game.init_menu();