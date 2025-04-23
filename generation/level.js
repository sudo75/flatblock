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

        // Simulation distances in chunks
        this.simulation_distance = null; // For general block updates
        this.block_simulation_distance = null; // For light calculations

        this.chunk_size = 16;
        this.calc = this.game.calculator;

        this.current_breaking = null;

        this.generator = new Generator(game, this.data, this.properties);
        this.item_directory = this.game.item_directory;

        this.time = 0;
        this.sun_strength = 15; //0 - 15
    }

    incrementTime() {
        this.time++;

        if (this.time >= 24000) { //24000 ticks per day
            this.time = 0;
        }
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

        //Once render light
        this.calculateLighting(this.calc.getWorldBounds()[0], this.calc.getWorldBounds()[1]);
        
        console.log(this.data);
    }

    copy(level_data, entity_data, seed, level_properties) { //use saved data
        this.data = level_data;

        //Manually place all blocks to preserve 'run_gametick_logic' method

        for (const chunkID in level_data) {
            let chunk = [];
            
            const chunk_block_data = level_data[chunkID].block_data;

            for (let x = 0; x < chunk_block_data.length; x++) {

                let col = [];
                for (let y = 0; y < chunk_block_data[x].length; y++) {
                    const block_data = chunk_block_data[x][y];

                    const blockClass = this.item_directory.item[block_data.id];
                    const block = new blockClass(block_data.x, y);

                    for (const key in block_data) {
                        block[key] = block_data[key];
                        if (key === 'inventory') {
                            const inventory_data = block_data[key].data;


                            block.inventory.data = inventory_data;    
                        }
                    }

                    col.push(block);
                }

                chunk.push(col);
            }

            this.data[chunkID].block_data = chunk;
        }

        this.properties = level_properties

        //Update generator data
        this.generator.seed = seed;
        this.generator.data = level_data;

        //Update calculator
        this.calc.game = this.game;

        //Update entity handler data
        this.game.entity_handler.level_data = level_data;
        this.game.entity_handler.copy(entity_data);

        //Once render light
        this.calculateLighting(this.calc.getWorldBounds()[0], this.calc.getWorldBounds()[1]);
    }

    world_interaction() {
        this.computeBlockBreaking();
        this.computeBlockPlacing();
    }

    run_gametick_logic(tick) { //Can help run blocks with animations, update block states (ex. illuminated vs. dark, etc.)
        
        const simulated_chunk_min = this.calc.getSimulatedChunkBounds(this.simulation_distance).min;
        const simulated_chunk_max = this.calc.getSimulatedChunkBounds(this.simulation_distance).max;

        const block_simulated_chunk_min = this.calc.getSimulatedChunkBounds(this.block_simulation_distance).min;
        const block_simulated_chunk_max = this.calc.getSimulatedChunkBounds(this.block_simulation_distance).max;
    
        //Run gametick logic of blocks
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                for (let y = 0; y < this.properties.height_blocks; y++) {
                    const block = this.data[i].block_data[rel_x][y];
                    const abs_x = this.calc.getAbsoluteX(rel_x, i);

                    if (block.run_gametick_logic) {
                        block.run_gametick_logic(tick);
                    }

                    if (
                        block.light <= this.game.entity_handler.mob_handler.minHostileMobLightLevel &&
                        !this.calc.isSolidBlock(abs_x, y) &&
                        this.calc.isSolidBlock(abs_x, y - 1)
                    ) {
                        if (this.calc.randomBool_precise(this.game.entity_handler.mob_handler.hostileMobSpawnChance)) {
                            this.game.entity_handler.spawnRandomHostileMob(abs_x, y);
                        }
                    }
                }
            }
        }

        //Run time logic
        this.incrementTime();

        //Day
        if (this.time >= 0 && this.time < 12000) {
            this.sun_strength = 15;
        }

        //Evening
        if (this.time >= 12000 && this.time < 14000) {
            const lighting_decimal = 1 - (this.time - 12000) / 2000;
            this.sun_strength = Math.floor(15 * (lighting_decimal));
        }

        //Night
        if (this.time >= 14000 && this.time < 22000) {
            this.sun_strength = 0;
        }

        //Morning
        if (this.time >= 22000 && this.time < 24000) {
            const lighting_decimal = (this.time - 22000) / 2000;
            this.sun_strength = Math.floor(15 * (lighting_decimal));
        }

        if (tick % this.item_directory.getProperty(13, 'spread_speed') === 0) {
            this.calculateLiquids(tick, block_simulated_chunk_min, block_simulated_chunk_max);
        }

        if (tick % 1 === 0) {
            this.calculateLighting(block_simulated_chunk_min, block_simulated_chunk_max);
        }


        //Set neighbour properties
        
        for (let i = block_simulated_chunk_min; i <= block_simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                for (let y = 0; y < this.properties.height_blocks; y++) {
                    const block = this.data[i].block_data[rel_x][y];

                    const abs_x = this.calc.getAbsoluteX(rel_x, i);

                    const getBlockProperties = (x, y) => {
                        if (this.calc.isWithinWorldBounds(x, y)) {
                            return this.calc.getBlockData(x, y);
                        } else {
                            return null;
                        }
                    };

                    //Left
                    const block_left = getBlockProperties(abs_x - 1, y);
                    
                    //Right
                    const block_right = getBlockProperties(abs_x + 1, y);

                    //Up
                    const block_up = getBlockProperties(abs_x, y + 1);

                    //Down
                    const block_down = getBlockProperties(abs_x, y - 1);

                    const neighbour_data = {
                        'left': block_left,
                        'right': block_right,
                        'up': block_up,
                        'down': block_down,
                    };

                    this.data[i].block_data[rel_x][y].neighbour_data = neighbour_data;
                }
            }
        }


    }

    clearNeighbourData() {
        for (let i = this.calc.getWorldBounds()[0]; i <= this.calc.getWorldBounds()[1]; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                for (let y = 0; y < this.properties.height_blocks; y++) {
                    const block = this.data[i].block_data[rel_x][y];

                    block.neighbour_data = null;
                }
            }
        }
    }

    calculateLiquids(tick, simulated_chunk_min, simulated_chunk_max) {
        const liquidID = 13;
        const liquid_spread = this.item_directory.getProperty(liquidID, 'liquid_spread');

        const directions = [
            { dx: 0, dy: -1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
        ];

        // Clear water
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                const abs_x = this.calc.getAbsoluteX(rel_x, i);

                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];

                    if (block.id === liquidID && !block.source) {
                        const status_current = block.status;

                        if (status_current === liquid_spread - 1) {
                            this.generator.placeBlockOnly(0, abs_x, y);
                        } else {
                            block.setStatus(block.status + 1);
                        }
                        
                    }
                }
            }
        }

        //Initialise queue for water
        let queue = [];
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                const abs_x = this.calc.getAbsoluteX(rel_x, i);

                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];

                    if (block.id === liquidID && block.source) {
                        queue.push({ x: abs_x, y: y, status: block.status, max_spread: Math.floor((tick - block.placedAt) / block.spread_speed) }); // max_spread is based on source age
                    }
                }
            }
        }

        while (queue.length > 0) {

            const { x, y, status, max_spread } = queue.shift(); // Remove first element from queue

            for (const direction of directions) {
                const new_x = x + direction.dx;
                const new_y = y + direction.dy;
    
                if (!this.calc.isWithinWorldBounds(new_x, new_y)) continue;

                if (this.calc.getBlockData(new_x, new_y).id !== 0 && this.calc.getBlockData(new_x, new_y).id !== liquidID) continue; // Don't spread water to blocks not air and not the liquid
    
                const chunkID = this.calc.getChunkID(new_x);
                const rel_x = this.calc.getRelativeX(new_x);

                if (max_spread <= 0) {
                    continue;
                }

                if (this.calc.getBlockData(new_x, new_y).id !== liquidID) { // If air, turn to water
                    this.generator.placeBlockOnly(liquidID, new_x, new_y);
                    this.data[chunkID].block_data[rel_x][new_y].setStatus(liquid_spread);
                    this.data[chunkID].block_data[rel_x][new_y].source = false;
                }

                const block = this.data[chunkID].block_data[rel_x][new_y];

                if (direction.dy !== 0) {
                    block.setStatus(0);
                }
                
                
                if (direction.dx !== 0) {
                    if (block.status < status + 1) { // Don't overwrite with values less than current liquid level
                        continue;
                    };

                    if (status >= liquid_spread - 1) {
                        this.generator.placeBlockOnly(0, new_x, new_y); // Place air
                        continue;
                    }

                    if (!block.source && block.status === 0 && !this.calc.isSolidBlock(new_x, new_y - 1)) continue;

                    if (
                        !this.calc.isSolidBlock(new_x, new_y - 1) &&
                        !this.calc.isSolidBlock(x, y - 1)
                        
                    ) {
                        this.generator.placeBlockOnly(0, new_x, new_y); // Place air
                        continue;
                    }

                    block.setStatus(status + 1);
                }
    
                
                queue.push({ x: new_x, y: new_y, status: block.status, max_spread: Math.floor((tick - block.placedAt) / block.spread_speed) });

            }
        }
    }

    calculateLighting(simulated_chunk_min, simulated_chunk_max) {
        /*
            How the lighting system works - Breadth-First Search (BFS lighting)
            
            1. All sunlight values are reset
            2. Sunlight values are recalculated
            3. A base queue is made with all light sources
            4. For each block in the queue, its four light spreading directions are iterated through
            5. Each block iterated through is assigned a light value one less than the parent unless that value is less than or equal to the current value (in which case the original vlaue is kept)
            6. All four light spreading directions are added to the queue unless the block is solid (to prevent light from transmitting through blocks)
        */


        //Reset sun lighting status
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];

                    block.light_source_sun = 0;
                    block.light = 0;
                }
            }
        }
        
        //Blocks in sun
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                const abs_x = this.calc.getAbsoluteX(rel_x, i);

                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];

                    if (this.calc.isSolidBlock(abs_x, y)) {
                        break;
                    }
                    block.light_source_sun = this.sun_strength;
                    block.light = block.light_source_sun;
                }
            }
        }

        //Light source blocks
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {

                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];

                    if (block.light_source >= 1) {
                        block.light = block.light_source;
                    }
                }
            }
        }


        const directions = [
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
        ];

        //Initialise queue
        let queue = [];
        for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                const abs_x = this.calc.getAbsoluteX(rel_x, i);

                for (let y = this.properties.height_blocks - 1; y >= 0; y--) {

                    const block = this.data[i].block_data[rel_x][y];


                    if (block.light_source_sun > 1 && block.light_source_sun >= block.light_source) {
                        queue.push({ x: abs_x, y: y, light: this.sun_strength });
                    } else if (block.light_source > 1) {
                        queue.push({ x: abs_x, y: y, light: block.light_source });
                    }
                }
            }
        }


        while (queue.length > 0) {
            const { x, y, light } = queue.shift(); // Remove first element from queue
            
            for (const direction of directions) {
                const new_x = x + direction.dx;
                const new_y = y + direction.dy;
    
                if (!this.calc.isWithinWorldBounds(new_x, new_y)) continue;
    
                const chunkID = this.calc.getChunkID(new_x);
                const rel_x = this.calc.getRelativeX(new_x);
                const block = this.data[chunkID].block_data[rel_x][new_y];
    
                if (block.light >= light - 1) continue;
    
                block.light = light - 1;

                if (this.calc.getBlockData(new_x, new_y).transparency === 0) continue;
    
                queue.push({ x: new_x, y: new_y, light: light - 1 });
            }
        }

    }

    blockCanBePlaced(x, y, blockID) {
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

        //Check block data for placment requirements

        const block_left = this.calc.getBlockData(x - 1, y);
        const block_right = this.calc.getBlockData(x + 1, y);
        const block_up = this.calc.getBlockData(x, y + 1);
        const block_down = this.calc.getBlockData(x, y - 1);
        
        const placeRequirements = this.item_directory.getProperty(blockID, 'placeRequirements');
        
        for (let direction in placeRequirements) {
            if (placeRequirements[direction].length === 0) continue;
            
            const requirements = placeRequirements[direction];

            switch (direction) {
                case 'adjacent': {
                    const neighborIDs = [block_left.id, block_right.id, block_up.id, block_down.id];
                    let matches = neighborIDs.some(id => requirements.includes(id));
                    if (!matches) return false;
                    break;
                }

                case 'left': {
                    if (!requirements.includes(block_left.id)) return false;
                    break;
                }
                case 'right': {
                    if (!requirements.includes(block_right.id)) return false;
                    break;
                }
                case 'top': {
                    if (!requirements.includes(block_up.id)) return false;
                    break;
                }
                case 'bottom': {
                    if (!requirements.includes(block_down.id)) return false;
                    break;
                }

            }
        }

        return true;
    }

    computeBlockPlacing() {
        const selectedX = this.game.player.selectedBlock.x;
        const selectedY = this.game.player.selectedBlock.y;

        if (selectedX == null || selectedY == null) return;

        const selectedSlot = this.game.player.inventory.selectedSlot;
        const slotItemID = this.game.player.inventory.data[selectedSlot].id;
        
        const placeblockID_ = this.item_directory.getProperty(slotItemID, 'placeBlock_id');
        const placeBlockID = placeblockID_ ? placeblockID_: slotItemID

        if (this.game.input.mouseDown_right && this.calc.isWithinWorldBounds(selectedX, selectedY)) {
            if (
                this.calc.getBlockData(selectedX, selectedY).type !== 'solid' &&
                this.game.player.getBlockDistance(selectedX + 0.5, selectedY + 0.5) <= this.game.player.cursorDistLim &&
                this.calc.solidBlockAdjacent(selectedX, selectedY) &&
                this.blockCanBePlaced(selectedX, selectedY, placeBlockID) &&
                (this.item_directory.getProperty(placeBlockID, 'isBlock') || this.item_directory.getProperty(placeBlockID, 'placeBlock_id'))
            ) {
                this.generator.placeBlock(placeBlockID, selectedX, selectedY);
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

                if (this.game.debugger.settings.fast_break) {
                    strength = 500;
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