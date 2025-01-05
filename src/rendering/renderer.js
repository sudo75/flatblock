class World_Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.calc = this.game.calculator;  
    }

    drawBlock(x, y, colour) {
        //The first block will be y = 0, this aligns with the canvas coordinate system, and thus no recaululation is needed

        const left = x;
        const top = this.game.height - y - this.game.block_size;

        this.ctx.fillStyle = colour;
        this.ctx.fillRect(left, top, this.game.block_size, this.game.block_size);
    }

    drawOutline(x, y, weight) {
        const left = x; // Distance from x-axis (left)
        const top = this.game.height - y - this.game.block_size; //dist from y axis (bottom)

        this.ctx.lineWidth = weight;
        this.ctx.beginPath();
        this.ctx.rect(left, top, this.game.block_size, this.game.block_size);
        this.ctx.strokeStyle = 'black'; // Outline color
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    updateCornerstones() {
        this.leftmost_blockX = this.calc.getRenderingCornerstones().leftmost_blockX;
        this.bottommost_blockY = this.calc.getRenderingCornerstones().bottommost_blockY;
    }

    drawWorld() { //BOTTOM TO TOP RENDERING
        this.clear();

        const viewWidth = this.game.settings.blockview_width;
        const viewHeight = this.game.settings.blockview_height;

        this.updateCornerstones();

        const leftmost_blockX_int = Math.floor(this.leftmost_blockX);
        const bottommost_blockY_int = Math.floor(this.bottommost_blockY);

        for (let x = leftmost_blockX_int; x <= leftmost_blockX_int + viewWidth; x++) {
            for (let y = bottommost_blockY_int; y <= bottommost_blockY_int + viewHeight; y++) {
                if (y < 0 || y >= this.game.level.properties.height_blocks) continue;
                if (x < this.calc.getWorldBorders().minX || x > this.calc.getWorldBorders().maxX) continue;

                const block_data = this.calc.getBlockData(Math.floor(x), Math.floor(y)); // convert to integer

                const real_x = (x - this.leftmost_blockX) * this.game.block_size;
                const real_y = (y - this.bottommost_blockY) * this.game.block_size;
                switch (block_data.name) {
                    case 'dirt':
                        this.drawBlock(real_x, real_y, 'green');
                        break;
                }
                this.drawOutline(real_x, real_y, 1);

                //Draw cursor (block outline)
                const selectedBlock = this.game.player.selectedBlock;
                if (x === selectedBlock.x && y === selectedBlock.y) {
                    if ((this.calc.getBlockData(x, y).type === 'solid' || this.calc.solidBlockAdjacent(x, y)) && this.calc.getBlockDistance(x, y, this.game.player.x + this.game.player.width_blocks / 2, this.game.player.y + this.game.player.height_blocks / 2) <= this.game.player.cursorDistLim) {
                        this.drawOutline(real_x, real_y, 4);
                    }
                }
            }
        }

    }
}

export { World_Renderer };