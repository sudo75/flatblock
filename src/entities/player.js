import { Entity } from './entity.js';

class Player extends Entity {
    constructor(game) {
        super(game, 0, 0, 50, 50);
        this.game = game;
        this.ctx = this.game.ctx_player;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    draw() {
        this.clear();

        const left = this.x; //dist from x axis (left)
        const bottom = this.y; //dist from y axis (bottom)

        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(left, this.game.height - bottom, this.width, this.height);
    }
}

export { Player };