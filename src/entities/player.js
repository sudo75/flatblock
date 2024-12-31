import { Entity } from './entity.js';

class Player extends Entity {
    constructor(game) {
        super(game);
        this.game = game;
        this.ctx = this.game.ctx_player;

        this.width_blocks = 1; // in unit blocks
        this.height_blocks = 2; // in unit blocks

        this.width = this.game.block_size * this.width_blocks;
        this.height = this.game.block_size * this.height_blocks;
    }

    spawn() {
        this.real_x = this.game.width / 2 - this.width / 2
        this.real_y = 400; //TBD

        this.x = 7;
        this.y = 7;

        this.draw();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    draw() {
        this.clear();

        const left = this.real_x; //dist from x axis (left)
        const bottom = this.real_y; //dist from y axis (bottom)

        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(left, this.game.height - bottom - this.height, this.width, this.height);
    }
}

export { Player };