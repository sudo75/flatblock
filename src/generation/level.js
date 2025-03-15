import { Generator } from "./generator.js";

class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.data = {};
        this.loaded_chunks = [];
        this.properties = {
            width_chunks: null,
            height_blocks: null
        };
        this.level_size = null;

        this.chunk_size = 16;
        this.calc = this.game.calculator;

        this.current_breaking = null;

        this.generator = new Generator(game, this.data, this.properties);
        this.item_directory = this.game.item_directory;
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

    copy(level_data, entity_data, seed, level_properties) { //use saved data
        this.data = level_data;
        this.properties = level_properties

        //Update generator data
        this.generator.seed = seed;
        this.generator.data = level_data;

        //Update calculator
        this.calc.game = this.game;

        //Update entity handler data
        this.game.entity_handler.level_data = level_data;
        this.game.entity_handler.copy(entity_data);
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
                const selectedSlot = this.game.player.inventory.selectedSlot;
                this.generator.placeBlock(this.game.player.inventory.data[selectedSlot].id, this.game.player.selectedBlock.x, this.game.player.selectedBlock.y);
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

                const blockData = this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y);
                const blockType = blockData.type;
                const hardness = blockData.hardness;
                const blockID = blockData.id;

                const breakStatus = this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status;

                //Set break status
                const selectedSlot = this.game.player.inventory.selectedSlot;
                const seletedItemID = this.game.player.inventory.data[selectedSlot].id;

                const selectedItemType = this.item_directory.getProperty(seletedItemID, 'item_type');

                let strength = this.game.player.strength;
                if (selectedItemType === 'tool') {
                    const purpose = this.item_directory.getProperty(seletedItemID, 'purpose');

                    if (purpose.includes(blockID)) {
                        strength = this.item_directory.getProperty(seletedItemID, 'strength');
                    }
                }

                if (blockType === 'solid' && hardness) {
                    this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status += strength;
                }

                //Break block
                if (breakStatus >= hardness) {
                    this.generator.breakBlock(this.current_breaking.x, this.current_breaking.y);
                    this.current_breaking = null;

                    if (selectedItemType === 'tool') {
                        this.game.player.inventory.decrementDurability(selectedSlot);
                    }
                }
            }
            
        } else {
            resetBreakStatus();
        }
    }
}

export { Level };