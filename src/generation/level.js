import { Generator } from "./generator.js";

class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.data = {};
        this.loaded_chunks = [];
        this.properties = {
            width_chunks: 20,
            height_blocks: 120
        }

        this.chunk_size = 16;
        this.calc = this.game.calculator;

        this.current_breaking = null;

        this.generator = new Generator(game, this.data, this.properties);
    }

    unloadChunk(chunk_id) {
        this.loaded_chunks = this.loaded_chunks.filter(id => id !== chunk_id);
    }

    loadChunk(chunk_id) {
        if (!this.data[chunk_id]) {
            this.generate_chunk(chunk_id); // Generate chunk if not already present
        }
        this.loaded_chunks.push(chunk_id);
    }

    generate() {
        const bounds = this.calc.getWorldBounds();

        for (let i = bounds[0]; i <= bounds[1]; i++) {
            this.generator.generate_chunk(i);
        }

        console.log(this.data);
    }

    world_interaction() {
        this.computeBlockBreaking();
        this.computeBlockPlacing();
    }

    blockCanBePlaced(x, y) {
        const playerX_min = Math.floor(this.game.player.x);
        const playerX_max = this.calc.hardRoundDown(this.game.player.x + this.game.player.width_blocks);
        const playerY_min = Math.floor(this.game.player.y);
        const playerY_max = this.calc.hardRoundDown(this.game.player.y + this.game.player.height_blocks);

        for (let i = playerX_min; i <= playerX_max; i++) {
            for (let j = playerY_min; j <= playerY_max; j++) {
                if (x === i && y === j) {
                    return false;
                }
            }
        }

        return true;
    }

    computeBlockPlacing() {
        if (this.game.player.selectedBlock.x == null || this.game.player.selectedBlock.y == null) return;

        if (this.game.input.mouseDown_right && this.calc.isWithinWorldBounds(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y)) {
            if (
                this.calc.getBlockData(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y).type !== 'solid' &&
                this.game.player.getBlockDistance(this.game.player.selectedBlock.x + 0.5, this.game.player.selectedBlock.y + 0.5) <= this.game.player.cursorDistLim &&
                this.calc.solidBlockAdjacent(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y) &&
                this.blockCanBePlaced(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y)
            ) {
                this.generator.placeBlock(this.game.player.inventory.data[this.game.player.inventory.selection_index].id, this.game.player.selectedBlock.x, this.game.player.selectedBlock.y);
            }
        }
    }

    computeBlockBreaking() {
        const resetBreakStatus = () => {
            if (this.current_breaking && this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y).hardness) {
                this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status = 0;
            }
            this.current_breaking = null;
        };
        if (this.game.input.mouseDown) {
            if (this.current_breaking) {
                if (this.game.player.selectedBlock.x !== this.current_breaking.x && this.game.player.selectedBlock.y !== this.current_breaking.y) {
                    resetBreakStatus();
                }
            }

            this.current_breaking = {
                x: this.game.player.selectedBlock.x,
                y: this.game.player.selectedBlock.y
            };

            if (this.game.player.getBlockDistance(this.current_breaking.x + 0.5, this.current_breaking.y + 0.5) <= this.game.player.cursorDistLim) {
    
                //Set break status
                if (this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y).type === 'solid' && this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y).hardness) {
                    this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status++;
                }

                //Break block
                if (this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status >= this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].hardness) {
                    //this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y] = new Block_Air(this.current_breaking.x, this.current_breaking.y);
                    this.generator.breakBlock(this.current_breaking.x, this.current_breaking.y);
                    this.current_breaking = null;
                }
            }
            
        } else {
            resetBreakStatus();
        }
    }
}

export { Level };