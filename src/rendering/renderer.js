class World_Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.calc = this.game.calculator;

        this.textureCache = {};
    }

    drawBlock(x, y, real_x, real_y, colour) {
        //The first block will be y = 0, this aligns with the canvas coordinate system, and thus no recaululation is needed

        const texture_location = this.calc.getBlockData(x, y).texture_location;

        if (texture_location) {
            let image;
            if (!this.textureCache[texture_location]) {
                image = new Image();
                image.src = texture_location;
    
                this.textureCache[texture_location] = image;
            } else {
                image = this.textureCache[texture_location];
            }
    
            const left = real_x;
            const top = this.game.height - real_y - this.game.block_size;
            
            this.ctx.drawImage(image, left, top, this.game.block_size, this.game.block_size);
        } else {
            this.ctx.fillStyle = colour;
            this.ctx.fillRect(left, top, this.game.block_size, this.game.block_size);
        }
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


        // DRAW BLOCKS
        for (let x = leftmost_blockX_int; x <= leftmost_blockX_int + viewWidth; x++) {
            for (let y = bottommost_blockY_int; y <= bottommost_blockY_int + viewHeight; y++) {
                if (y < 0 || y >= this.game.level.properties.height_blocks) continue;
                if (x < this.calc.getWorldBorders().minX || x > this.calc.getWorldBorders().maxX) continue;

                const block_data = this.calc.getBlockData(Math.floor(x), Math.floor(y)); // convert to integer

                const real_x = (x - this.leftmost_blockX) * this.game.block_size;
                const real_y = (y - this.bottommost_blockY) * this.game.block_size;
                
                if (block_data.type === 'solid') {
                    this.drawBlock(x, y, real_x, real_y, 'green');
                }
                //this.drawOutline(real_x, real_y, 0.5);

                //Draw cursor (block outline)
                const selectedBlock = this.game.player.selectedBlock;

                if (x === selectedBlock.x && y === selectedBlock.y) {
                    if ((this.calc.getBlockData(x, y).type === 'solid' || this.calc.solidBlockAdjacent(x, y)) && this.calc.getBlockDistance(x + 0.5, y + 0.5, this.game.player.x + this.game.player.width_blocks / 2, this.game.player.y + this.game.player.height_blocks / 2) < this.game.player.cursorDistLim) {
                        this.drawOutline(real_x, real_y, 4);
                    }
                }
            }
        }

        //DRAW ENTITIES
        const loaded_chunks = this.calc.getLoadedChunks();
        for (let i = 0; i < loaded_chunks.length; i++) {
            const currentChunkID = loaded_chunks[i];

            for (let j = 0; j < this.game.level.data[currentChunkID].entity_data.length; j++) {
                const entity = this.game.level.data[currentChunkID].entity_data[j];
                
                const texture_location = entity.texture_location;

                const real_x = (entity.x - this.leftmost_blockX) * this.game.block_size;
                const real_y = (entity.y - this.bottommost_blockY) * this.game.block_size;

                if (texture_location) {
                    let image;
                    if (!this.textureCache[texture_location]) {
                        image = new Image();
                        image.src = texture_location;
            
                        this.textureCache[texture_location] = image;
                    } else {
                        image = this.textureCache[texture_location];
                    }
            
                    const left = real_x;
                    const top = this.game.height - real_y - this.game.block_size * entity.height_blocks;
                    
                    this.ctx.drawImage(image, left, top, this.game.block_size * entity.width_blocks, this.game.block_size * entity.height_blocks);
                } else {
                    this.ctx.fillStyle = 'grey';

                    const left = real_x;
                    const top = this.game.height - real_y - this.game.block_size * entity.height_blocks;
                    this.ctx.fillRect(left, top, this.game.block_size * entity.width_blocks, this.game.block_size * entity.height_blocks);
                }
            }
        }

    }
}

export { World_Renderer };