import { Block_Air, Block_dirt } from "./blocks.js";

class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.data = {};
        this.loaded_chunks = [];
        this.properties = {
            width_chunks: 5,
            height_blocks: 20
        }

        this.chunk_size = 16;
        this.calc = this.game.calculator;

        this.current_breaking = null;
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

    generate_chunk(chunk_id) { //GENERATES FROM TOP TO BOTTOM
        // Logic to generate the game level
        let chunck = [];

        for (let x = 0; x < this.chunk_size; x++) {
            let col = [];
            for (let y = 0; y < this.properties.height_blocks; y++) {
                let name;
                if (y === 5) {
                    name = Math.round(Math.random()) === 0 ? 'dirt': 'air'
                }
                else if (y < 5) {
                    name = 'dirt';
                } else {
                    name = 'air';
                }

                const absolute_x = chunk_id * this.chunk_size + x;

                const block = name === 'dirt' ? new Block_dirt(absolute_x, y): new Block_Air(absolute_x, y);
                col.push(block);
            }
            chunck.push(col);
        }
        this.data[chunk_id] = { block_data: chunck };
    }

    generate() {
        const bounds = this.calc.getWorldBounds();

        for (let i = bounds[0]; i <= bounds[1]; i++) {
            this.generate_chunk(i);
        }

        this.data[0].block_data[15][8] = new Block_dirt(15, 8);

        console.log(this.data);
    }

    world_interaction() {
        this.computeBlockBreaking();
        this.computeBlockPlacing();
    }

    placeBlock(blockID, x, y) {
        let block;
        switch (blockID) { //UPGRADE CODE LATER
            case 1:
                block = Block_dirt;
                break;
            default:
                console.warn('Can\'t place block!');
                return;
        }

        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new block(x, y);
    }

    breakBlock(x, y) {
        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new Block_Air(x, y);
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
                this.game.player.getBlockDistance(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y) <= this.game.player.cursorDistLim &&
                this.calc.solidBlockAdjacent(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y) &&
                this.blockCanBePlaced(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y)
            ) {
                this.placeBlock(this.game.player.inventory.data[this.game.player.inventory.selection_index].id, this.game.player.selectedBlock.x, this.game.player.selectedBlock.y);
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

            if (this.game.player.getBlockDistance(this.current_breaking.x, this.current_breaking.y) <= this.game.player.cursorDistLim) {
    
                //Set break status
                if (this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y).type === 'solid' && this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y).hardness) {
                    this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status++;
                }

                //Break block
                if (this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status >= this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].hardness) {
                    //this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y] = new Block_Air(this.current_breaking.x, this.current_breaking.y);
                    this.breakBlock(this.current_breaking.x, this.current_breaking.y);
                    this.current_breaking = null;
                }
            }
            
        } else {
            resetBreakStatus();
        }
    }
}

export { Level };