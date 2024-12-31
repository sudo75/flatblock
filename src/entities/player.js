import { Entity } from './entity.js';

class Player extends Entity {
    constructor(game) {
        super(game);
        this.game = game;
        this.ctx = this.game.ctx_player;
        this.calc = this.game.calculator;

        this.width_blocks = 1; // in unit blocks
        this.height_blocks = 2; // in unit blocks

        this.width = this.game.block_size * this.width_blocks;
        this.height = this.game.block_size * this.height_blocks;
    }

    spawn() {
        this.real_x = this.game.width / 2 - this.width / 2;
        this.real_y = this.game.height / 2;

        this.setX(5); // aligned to centre of player
        this.setY(this.calculateSpawnY(Math.floor(this.x))) // aligned to centre of player

        this.draw();
    }

    calculateSpawnY(x) {
        for (let y = 0; y < this.game.level.properties.height_blocks; y++) {
            const block_data = this.calc.getBlockData(x, y);

            if (block_data.name === 'air') {
                return y;
            }
        }

        return null;
    }

    update_real_pos() {
        const leftmost_blockX = this.calc.getRenderingCornerstones().leftmost_blockX;
        const rightmost_blockX = this.calc.getRenderingCornerstones().rightmost_blockX;
        const bottommost_blockY = this.calc.getRenderingCornerstones().bottommost_blockY;
        
        // Do not centre player to screen if player is too close to world boundary
        
        this.real_y = this.game.height / 2;
        if (bottommost_blockY <= 0) { // Vertical centring
            const dist = this.y - bottommost_blockY; // dist between bottommost block and player Y

            if (dist < this.game.settings.blockview_height / 2) {
                this.real_y = dist * this.game.block_size;
            }
        }


        this.real_x = this.game.width / 2 - this.width / 2;
        if (leftmost_blockX <= this.calc.getWorldBorders().minX) { // Horizontal centring
            const dist_left = this.x - leftmost_blockX; // dist between leftmost block and player Y

            if (dist_left < this.game.settings.blockview_width / 2) {
                this.real_x = dist_left * this.game.block_size - this.width / 2;
            }
        }

        if (rightmost_blockX >= this.calc.getWorldBorders().maxX) { // Horizontal centring
            const dist_right = rightmost_blockX - this.x; // dist between rightmost block and player Y
            //const dist_left = this.game.settings.blockview_width - dist_right;

            if (dist_right < this.game.settings.blockview_width / 2) {
                this.real_x = this.game.settings.blockview_width * this.game.block_size - (dist_right * this.game.block_size + this.width / 2);
            }
        }        

    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    draw() {
        this.clear();

        this.update_real_pos();

        const left = this.real_x; //dist from x axis (left)
        const bottom = this.real_y; //dist from y axis (bottom)

        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(left, this.game.height - bottom - this.height, this.width, this.height);
    }
}

export { Player };