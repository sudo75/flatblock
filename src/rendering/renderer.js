class World_Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
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

    getBlockData(x, y) {
        const chunkID = Math.floor(x / this.game.level.chunk_size);
        const relativeX = Math.abs(x % this.game.level.chunk_size); // X-value relative to chunk

        const block_data = this.game.level.data[chunkID].block_data[relativeX][y];
        return block_data;
    }

    drawWorld() { //BOTTOM TO TOP RENDERING
        this.clear();

        const playerX = this.game.player.x;
        const playerY = this.game.player.y;

        const viewWidth = this.game.settings.blockview_width;
        const viewHeight = this.game.settings.blockview_height;

        const leftmost_blockX = playerX - viewWidth / 2;
        const bottommost_blockY = playerY - viewHeight / 2;

        const leftmost_blockX_int = Math.floor(leftmost_blockX);
        const bottommost_blockY_int = Math.floor(bottommost_blockY);

        for (let x = leftmost_blockX_int; x < leftmost_blockX_int + viewWidth; x++) {
            for (let y = bottommost_blockY_int; y < bottommost_blockY_int + viewHeight; y++) {
                const block_data = this.getBlockData(Math.floor(x), Math.floor(y)); // convert to integer
                if (y < 0) continue;

                const real_x = (x - leftmost_blockX) * this.game.block_size;
                const real_y = (y - bottommost_blockY) * this.game.block_size;

                switch (block_data.name) {
                    case 'dirt':
                        this.drawBlock(real_x, real_y, 'green');
                        this.drawOutline(real_x, real_y, 1);
                        break;
                }
            }
        }

        //DEBUG
        //this.drawOutline((playerX - leftmost_blockX) * this.game.block_size - this.game.player.width / 2, (playerY - bottommost_blockY) * this.game.block_size, 4);

    }
}

export { World_Renderer };