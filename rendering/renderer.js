class World_Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.calc = this.game.calculator;

        this.textureCache = {};
    }

    drawBlock(x, y, real_x, real_y) {
        //The first block will be y = 0, this aligns with the canvas coordinate system, and thus no recaululation is needed

        const left = Math.round(real_x); //Math.round to ensure blocks align
        const top = this.game.height - Math.round(real_y) - this.game.block_size;

        const block_data = this.calc.getBlockData(x, y);
        const texture_location = block_data.texture_location;

        const spriteSheetX = block_data.spriteSheetX;

        if (texture_location) {
            let image;
            if (!this.textureCache[texture_location]) {
                image = new Image();
                image.src = texture_location;
    
                this.textureCache[texture_location] = image;
            } else {
                image = this.textureCache[texture_location];
            }
            
            this.ctx.drawImage(image, spriteSheetX, 0, 16, 16, left, top, this.game.block_size, this.game.block_size);
        }

        //Lighting
        const block_lighting = block_data.light; // 0 - 15

        if (!this.game.debugger.settings.xray) {
            let lighting_decimal = 0.6 - block_lighting / 25;

            const fullLightLimit = 2; //Dist from fluid in which no additional dark mask is added
            const gradientSpan = 4; //From darkness to almost no darkness added
            const distFromFluid_ = this.calc.distanceFromFluid(block_data.x, block_data.y, gradientSpan);
            const distFromFluid = distFromFluid_ !== null ? distFromFluid_: gradientSpan;

            let additionalDarknessValue = 0;

            if (distFromFluid > fullLightLimit) {
                const gradientDist = Math.min(distFromFluid, gradientSpan + fullLightLimit) - (fullLightLimit);

                additionalDarknessValue = gradientDist / gradientSpan;
            }
            
            lighting_decimal += additionalDarknessValue;

    
            this.ctx.fillStyle = `rgba(0, 0, 0, ${lighting_decimal})`;
            this.ctx.fillRect(left, top, this.game.block_size, this.game.block_size);
        }

        //Block breaking
        const break_overlay_location = './assets/break/break.png';
        if (block_data.break_status > 0) {
            const breakDecimal = block_data.break_status / block_data.hardness;

            const breakStage = Math.ceil(breakDecimal * 10);
            
            const spriteSheetX = 16 * (breakStage - 1);

            let overlay;
            if (!this.textureCache[break_overlay_location]) {
                overlay = new Image();
                overlay.src = break_overlay_location;
    
                this.textureCache[break_overlay_location] = overlay;
            } else {
                overlay = this.textureCache[break_overlay_location];
            }
                
            this.ctx.drawImage(overlay, spriteSheetX, 0, 16, 16, left, top, this.game.block_size, this.game.block_size);
        }


        if (this.game.debugger.settings.lighting) {
            this.ctx.fillStyle = 'blue';
            this.ctx.fillText(block_lighting, left, top + this.game.block_size);
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

        //Draw background
        this.ctx.fillStyle = '#afdbed';
        this.ctx.fillRect(0, 0, this.game.width, this.game.height);

        // DRAW BLOCKS
        for (let x = leftmost_blockX_int; x <= leftmost_blockX_int + viewWidth; x++) {
            for (let y = bottommost_blockY_int; y <= bottommost_blockY_int + viewHeight; y++) {
                if (y < 0 || y >= this.game.level.properties.height_blocks) continue;
                if (x < this.calc.getWorldBorders().minX || x > this.calc.getWorldBorders().maxX) continue;

                const block_data = this.calc.getBlockData(Math.floor(x), Math.floor(y)); // convert to integer

                const real_x = (x - this.leftmost_blockX) * this.game.block_size;
                const real_y = (y - this.bottommost_blockY) * this.game.block_size;
                
                this.drawBlock(x, y, real_x, real_y);
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

                const spriteSheetX = 0;

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
                    
                    if (entity.entityType === 'item') {
                        this.ctx.drawImage(image, spriteSheetX, 0, 16, 16, left, top, this.game.block_size * entity.width_blocks, this.game.block_size * entity.height_blocks);
                    } else if (entity.direction === 'left') {
                        this.ctx.drawImage(image, left, top, this.game.block_size * entity.width_blocks, this.game.block_size * entity.height_blocks);
                    } else if (entity.direction === 'right') {
                        this.ctx.save();
                        this.ctx.scale(-1, 1); // Flip horizontally
                    
                        // Shift the drawing origin because the canvas is mirrored
                        const drawX = -left - (this.game.block_size * entity.width_blocks);
                    
                        this.ctx.drawImage(
                            image,
                            drawX,
                            top,
                            this.game.block_size * entity.width_blocks,
                            this.game.block_size * entity.height_blocks
                        );
                    
                        this.ctx.restore();
                    }
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