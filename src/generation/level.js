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

        this.simulation_distance = null; //in chunks

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

    run_gametick_logic(tick) { //Can help run blocks with animations, update block states (ex. illuminated vs. dark, etc.)
        const playerChunk = this.calc.getChunkID(this.game.player.x);
        
        let simulated_chunk_min = playerChunk - Math.ceil((this.simulation_distance - 1) / 2);
        let simulated_chunk_max = playerChunk + Math.floor((this.simulation_distance - 1) / 2);

        if (simulated_chunk_min < this.calc.getWorldBounds()[0]) {
            simulated_chunk_min = 0;
        }

        if (simulated_chunk_max > this.calc.getWorldBounds()[1]) {
            simulated_chunk_max = this.calc.getWorldBounds()[1];
        }
    
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                for (let y = 0; y < this.properties.height_blocks; y++) {
                    const block = this.data[i].block_data[rel_x][y];

                    if (block.run_gametick_logic) {
                        block.run_gametick_logic(tick);
                    }
                }
            }
        }
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

        if (this.game.entity_handler.isMobAt(x, y)) {
            return false;
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

            const playerCursorLocation = this.calc.getBlockByRealXY_unrounded(this.game.input.mouse_realXY.x, this.game.input.mouse_realXY.y); // in blocks (not rounded)

            if (this.game.player.getBlockDistance(this.current_breaking.x + 0.5, this.current_breaking.y + 0.5) <= this.game.player.cursorDistLim && !this.game.entity_handler.isMobAt(playerCursorLocation.x, playerCursorLocation.y)) {

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
                if (this.item_directory.getProperty(seletedItemID, 'strength')) {
                    const purpose = this.item_directory.getProperty(seletedItemID, 'purpose');

                    if (purpose.includes(blockID) || purpose == 'all') {
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