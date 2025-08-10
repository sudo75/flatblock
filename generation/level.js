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

        // Simulation distances for performance ticks
        this.simulation_distance_performance = 3;
        this.block_simulation_distance_performance = 3;

        this.chunk_size = 16;
        this.calc = this.game.calculator;

        this.current_breaking = null;

        this.generator = new Generator(game, this.data, this.properties);
        this.item_directory = this.game.item_directory;

        this.time = 0;
        this.sun_strength = 15; //0 - 15

        this.mouseInfoRight = {
            down: false,
            new_click: false,
            game: this.game, // will assign below

            update() {
                const down_previous = this.down;
                const down_current = this.game.input.mouseDown_right;

                this.new_click = down_current && !down_previous;
                this.down = down_current;
            }
        };
        
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

                    block.item_directory = this.item_directory;

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
        const toCompute = {
            gametick_logic: true,
            lighting: true,
            liquid: true,
            blockReq: true,
            time: true,
            neighbour: true,
            checkValidity: true
        };

        let computeFreq = {
            gametick_logic: 1,
            lighting: 1,
            liquid: 1,
            blockReq: 1,
            time: 1,
            neighbour: 1,
            checkValidity: 1
        };

        let performanceTickFreq = { // Set to -1 to ignore performance ticks for a process
            gametick_logic: 1,
            lighting: 1,
            liquid: 1,
            blockReq: 1,
            neighbour: 1,
            checkValidity: 1
        };

        if (this.game.debugger.settings.performance){
            const tps = this.game.tps;
            const tps_target = this.game.tps_target;

            const delay = tps_target - tps;
            const delayPercent = Math.round(delay / tps * 100);

            this.game.performance_throttle = 0;
            if (delayPercent >= 70) {
                this.game.performance_throttle = 6;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 161,
                    liquid: 1,
                    blockReq: 160,
                    time: 1,
                    neighbour: 241,
                    checkValidity: 163
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 23,
                    liquid: 1,
                    blockReq: 25,
                    neighbour: 37,
                    checkValidity: 19
                };

            } else if (delayPercent >= 40) {
                this.game.performance_throttle = 5;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 81,
                    liquid: 1,
                    blockReq: 80,
                    time: 1,
                    neighbour: 121,
                    checkValidity: 83
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 8,
                    liquid: 1,
                    blockReq: 9,
                    neighbour: 13,
                    checkValidity: 7
                };

            } else if (delayPercent >= 25) {
                this.game.performance_throttle = 4;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 41,
                    liquid: 1,
                    blockReq: 43,
                    time: 1,
                    neighbour: 82,
                    checkValidity: 43
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 4,
                    liquid: 1,
                    blockReq: 3,
                    neighbour: 9,
                    checkValidity: 5
                };

            } else if (delayPercent >= 15) {
                this.game.performance_throttle = 3;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 21,
                    liquid: 1,
                    blockReq: 23,
                    time: 1,
                    neighbour: 43,
                    checkValidity: 22
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 2,
                    liquid: 1,
                    blockReq: 3,
                    neighbour: 5,
                    checkValidity: 4
                };

            } else if (delayPercent >= 10) {
                this.game.performance_throttle = 2;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 21,
                    liquid: 1,
                    blockReq: 11,
                    time: 1,
                    neighbour: 23,
                    checkValidity: 10
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 2,
                    liquid: 1,
                    blockReq: 2,
                    neighbour: 3,
                    checkValidity: 1
                };

            } else if (delayPercent >= 5) {
                this.game.performance_throttle = 1;
                computeFreq = {
                    gametick_logic: 1,
                    lighting: 11,
                    liquid: 1,
                    blockReq: 4,
                    time: 1,
                    neighbour: 13,
                    checkValidity: 5
                };
                performanceTickFreq = { 
                    gametick_logic: 1,
                    lighting: 1,
                    liquid: 1,
                    blockReq: 1,
                    neighbour: 1,
                    checkValidity: 1
                };

            }

        }

        if (!this.game.debugger.settings.performance_chunks) {
            performanceTickFreq = {
                gametick_logic: Infinity,
                lighting: Infinity,
                liquid: Infinity,
                blockReq: Infinity,
                neighbour: Infinity,
                checkValidity: Infinity
            };
        }
        
        const simulated_chunk_min = this.calc.getSimulatedChunkBounds(this.simulation_distance).min;
        const simulated_chunk_max = this.calc.getSimulatedChunkBounds(this.simulation_distance).max;

        const simulated_chunk_performance_min = this.calc.getSimulatedChunkBounds(this.simulation_distance_performance).min;
        const simulated_chunk_performance_max = this.calc.getSimulatedChunkBounds(this.simulation_distance_performance).max;

        const block_simulated_chunk_min = this.calc.getSimulatedChunkBounds(this.block_simulation_distance).min;
        const block_simulated_chunk_max = this.calc.getSimulatedChunkBounds(this.block_simulation_distance).max;
    
        const block_simulated_chunk_performance_min = this.calc.getSimulatedChunkBounds(this.block_simulation_distance_performance).min;
        const block_simulated_chunk_performance_max = this.calc.getSimulatedChunkBounds(this.block_simulation_distance_performance).max;

        // GAMETICK LOGIC

        const gametick_logic = (chunk_min, chunk_max) => {
            //Run gametick logic of blocks
            for (let i = chunk_min; i <= chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        // Run block gametick logic
                        if (block.run_gametick_logic && !block.pendingDestroy) {
                            block.run_gametick_logic(tick);
                        }

                        // Spawn hostile mobs
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
        }

        if (toCompute.gametick_logic) {
            if (tick % computeFreq.gametick_logic === 0) {
                gametick_logic(simulated_chunk_min, simulated_chunk_max);
            } else if (tick % performanceTickFreq.gametick_logic === 0) {
                gametick_logic(simulated_chunk_performance_min, simulated_chunk_performance_max);
            }
            
        }

        // CHECK VALIDITY OF PLACED BLOCKS

        const checkValidity = (chunk_min, chunk_max) => {
            //Run validity checker
            for (let i = chunk_min; i <= chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (!this.checkValidity(abs_x, y) && !block.pendingDestroy) {
                            block.break();
                            block.pendingDestroy = true;

                            if (block.spawnItems) {
                                for (const item of block.spawnItems) {
                                    if (!item.id || !item.quantity) continue;

                                    const chance = item?.chance ?? 100;

                                    if (!this.calc.randomBool(chance)) continue;

                                    for (let j = 0; j < item.quantity; j++) {
                                        this.game.entity_handler.newEntity_Item(abs_x, y, item.id, 0, 0, item.durability || null);
                                    }

                                    this.generator.editProperty(abs_x, y, 'spawnItems', null);
                                }
                                
                            }

                        }
                    }
                }
            }
        }

        if (toCompute.checkValidity) {
            if (tick % computeFreq.checkValidity === 0) {
                checkValidity(simulated_chunk_min, simulated_chunk_max);
            } else if (tick % performanceTickFreq.checkValidity === 0) {
                checkValidity(simulated_chunk_performance_min, simulated_chunk_performance_max);
            }
        }
            

        // BLOCK REQUESTS

        const blockReq = (chunk_min, chunk_max) => {
            //Compute spawnItems data
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.spawnItems) {
                            for (const item of block.spawnItems) {
                                if (!item.id || !item.quantity) continue;

                                for (let j = 0; j < item.quantity; j++) {
                                    this.game.entity_handler.newEntity_Item(abs_x, y, item.id, 0, 0, item.durability || null);
                                }

                                this.generator.editProperty(abs_x, y, 'spawnItems', null);
                            }
                            
                        }
                    }
                }
            }

            //Compute removeItem data
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.removeItem) {
                            this.game.player.inventory.subtract(this.game.player.inventory.selectedSlot);

                            this.generator.editProperty(abs_x, y, 'removeItem', false);
                        }
                    }
                }
            }

            //Compute giveItem data
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.giveItem) {
                            if (!block.giveItem.id || !block.giveItem.quantity) continue;


                            for (let i = 0; i < block.giveItem.quantity; i++) {
                                if (this.game.player.inventory.canAddItem(block.giveItem.id)) {
                                    this.game.player.inventory.addItems(block.giveItem.id, block.giveItem.durability || null);
                                } else {
                                    this.game.entity_handler.newEntity_Item(x, y, block.giveItem.id, 0, 0, block.giveItem.durability || null);
                                }
                            }

                            this.generator.editProperty(abs_x, y, 'giveItem', null);
                        }
                    }
                }
            }

            //Compute decrementDurability data
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.decrementDurability) {
                            this.game.player.inventory.decrementDurability(this.game.player.inventory.selectedSlot);
                        }

                        this.generator.editProperty(abs_x, y, 'decrementDurability', false);
                    }
                }
            }


            //Compute onNextTick data
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.onNextTick) {
                            //if (!block.onNextTick.id) continue;

                            this.generator.placeBlockOnly(block.onNextTick.id, abs_x, y);

                            for (const key in block.onNextTick.properties) {
                                this.generator.editProperty(abs_x, y, key, block.onNextTick.properties[key]);
                            }
                        }
                    }
                }
            }

            // Compute break_block
            for (let i = simulated_chunk_min; i <= simulated_chunk_max; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];
                        const abs_x = this.calc.getAbsoluteX(rel_x, i);

                        if (block.break_block) {
                            this.generator.breakBlock(abs_x, y);
                        }
                    }
                }
            }
        }

        if (toCompute.blockReq && tick % computeFreq.blockReq === 0) {
            blockReq();
        }
        if (toCompute.checkValidity) {
            if (tick % computeFreq.checkValidity === 0) {
                checkValidity(simulated_chunk_min, simulated_chunk_max);
            } else if (tick % performanceTickFreq.checkValidity === 0) {
                checkValidity(simulated_chunk_performance_min, simulated_chunk_performance_max);
            }
        }

        // TIME

        const time = () =>  {
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
        }

        if (toCompute.time && tick % computeFreq.time === 0) {
            time();
        }

        // LIQUID FLOW

        const liquid = (chunk_min, chunk_max) => {
            if (tick % this.item_directory.getProperty(13, 'spread_speed') === 0) {
                this.calculateLiquids(tick, chunk_min, chunk_max);
            }
        }

        if (toCompute.liquid) {
            if (tick % computeFreq.liquid === 0) {
                liquid(simulated_chunk_min, simulated_chunk_max);
            } else if (tick % performanceTickFreq.liquid === 0) {
                liquid(simulated_chunk_performance_min, simulated_chunk_performance_max);
            }
        }
        
        // LIGHTING

        const lighting = (chunk_min, chunk_max) => {
            this.calculateLighting(chunk_min, chunk_max);
        }

        if (toCompute.lighting) {
            if (tick % computeFreq.lighting === 0) {
                lighting(block_simulated_chunk_min, block_simulated_chunk_max);
            } else if (tick % performanceTickFreq.lighting === 0) {
                lighting(block_simulated_chunk_performance_min, block_simulated_chunk_performance_max);
            }
        }
        
        // SET BLOCK NEIGHBOUR PROPERTY

        const neighbour = (chunk_min, chunk_max) => {
            //Set neighbour properties

            for (let i = chunk_min; i <= chunk_max; i++) {
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

        if (toCompute.neighbour) {
            if (tick % computeFreq.neighbour === 0) {
                neighbour(block_simulated_chunk_min, block_simulated_chunk_max);
            } else if (tick % performanceTickFreq.neighbour === 0) {
                neighbour(block_simulated_chunk_performance_min, block_simulated_chunk_performance_max);
            }
        }

    }

    clearNeighbourData(chunkID) {

        if (chunkID) {
            for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[chunkID].block_data[rel_x][y];

                        block.neighbour_data = null;
                    }
                }
        } else {
            for (let i = this.calc.getWorldBounds()[0]; i <= this.calc.getWorldBounds()[1]; i++) {
                for (let rel_x = 0; rel_x < this.chunk_size; rel_x++) {
                    for (let y = 0; y < this.properties.height_blocks; y++) {
                        const block = this.data[i].block_data[rel_x][y];

                        block.neighbour_data = null;
                    }
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
        if (this.item_directory.getProperty(blockID, 'entityBound')) { // check for player/entity collision only if the block is entity bound
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
        }
        

        //Check block data for placement requirements

        return this.checkValidity(x, y, blockID);
    }

    checkValidity(x, y, blockID = this.calc.getBlockData(x, y).id) {
        const block_left  = this.calc.isWithinWorldBounds(x - 1, y) ? this.calc.getBlockData(x - 1, y) : null;
        const block_right = this.calc.isWithinWorldBounds(x + 1, y) ? this.calc.getBlockData(x + 1, y) : null;
        const block_up = this.calc.isWithinWorldBounds(x, y + 1) ? this.calc.getBlockData(x, y + 1) : null;
        const block_down = this.calc.isWithinWorldBounds(x, y - 1) ? this.calc.getBlockData(x, y - 1) : null;
        
        // Check place requirements
        const parseReq = (value) => { // helps parse property requirements
            if (typeof(value) === 'number') return value;

            else if (typeof(value) === 'object') {
                if (value.property) { // has property requirements

                    const result_str = this.generator.item_directory.getItemsWithPropertyAndValue(value.key, value.value);

                    const result = result_str.map(str => Number(str));

                    return result;
                }
            }
        }

        //const full_placeRequirements = this.generator.item_directory.getProperty(blockID, 'placeRequirements');
        const full_placeRequirements = this.calc.getBlockData(x, y).placeRequirements;
        if (!full_placeRequirements) return true;

        const checkPlaceReq_all = (() => {
            
           const placeRequirements = full_placeRequirements.all;

            // ALL
            for (let direction in placeRequirements) {
                if (placeRequirements[direction].length === 0) continue;
                
                const requirements_raw = placeRequirements[direction];
                const requirements = requirements_raw.map(req => parseReq(req)).flat();

                switch (direction) {
                    case 'adjacent': {
                        const neighbourIDs = [block_left?.id, block_right?.id, block_up?.id, block_down?.id];
                        let matches = neighbourIDs.some(id => requirements.includes(id));
                        if (!matches) return false;
                        break;
                    }

                    case 'left': {
                        if (!requirements.includes(block_left?.id)) return false;
                        break;
                    }
                    case 'right': {
                        if (!requirements.includes(block_right?.id)) return false;
                        break;
                    }
                    case 'top': {
                        if (!requirements.includes(block_up?.id)) return false;
                        break;
                    }
                    case 'bottom': {
                        if (!requirements.includes(block_down?.id)) return false;
                        break;
                    }

                }
            }

            return true;
        })();

        const checkPlaceReq_oneOf = (() => {
            const placeRequirements = full_placeRequirements.oneOf;
            if (placeRequirements.length === 0) return true;

            let oneOf = false;
            for (let i = 0; i < placeRequirements.length; i++) {
                
                let currentInstanceValidity = true;

                for (let direction in placeRequirements[i]) {
                    if (placeRequirements[i][direction].length === 0) continue;
                    
                    const requirements_raw = placeRequirements[i][direction]; // array
                    const requirements = requirements_raw.map(req => parseReq(req)).flat();
                    
                    switch (direction) {
                        case 'adjacent': {
                            const neighbourIDs = [block_left?.id, block_right?.id, block_up?.id, block_down?.id];
                            let matches = neighbourIDs.some(id => requirements.includes(id));
                            if (!matches) currentInstanceValidity = false;
                            break;
                        }

                        case 'left': {
                            if (!requirements.includes(block_left?.id)) currentInstanceValidity = false;
                            break;
                        }
                        case 'right': {
                            if (!requirements.includes(block_right?.id)) currentInstanceValidity = false;
                            break;
                        }
                        case 'top': {
                            if (!requirements.includes(block_up?.id)) currentInstanceValidity = false;
                            break;
                        }
                        case 'bottom': {
                            if (!requirements.includes(block_down?.id)) currentInstanceValidity = false;
                            break;
                        }

                    }

                    if (!currentInstanceValidity) break;
                }
                if (currentInstanceValidity) return true;
            }

            return oneOf;
        })();

        if (!checkPlaceReq_all || !checkPlaceReq_oneOf) {
            return false;
        }

        return true;
    }

    computeBlockPlacing() {
        this.mouseInfoRight.update();

        const selectedX = this.game.player.selectedBlock.x;
        const selectedY = this.game.player.selectedBlock.y;

        if (selectedX == null || selectedY == null) return;

        const selectedSlot = this.game.player.inventory.selectedSlot;
        const slotItemID = this.game.player.inventory.data[selectedSlot].id;
        
        const placeblockID_ = this.item_directory.getProperty(slotItemID, 'placeBlock_id');
        const placeBlockID = placeblockID_ ? placeblockID_: slotItemID;
        
        const requireClick_interact = this.item_directory.getProperty(slotItemID, 'requireClick_interact');

        if (requireClick_interact && !this.mouseInfoRight.new_click) return;

        if (this.mouseInfoRight.down && this.calc.isWithinWorldBounds(selectedX, selectedY) && this.game.player.getBlockDistance(selectedX + 0.5, selectedY + 0.5) <= this.game.player.cursorDistLim) {
            if (
                this.calc.getBlockData(selectedX, selectedY).type !== 'solid' &&
                this.calc.solidBlockAdjacent(selectedX, selectedY) &&
                this.blockCanBePlaced(selectedX, selectedY, placeBlockID) &&
                (this.item_directory.getProperty(placeBlockID, 'isBlock') || this.item_directory.getProperty(placeBlockID, 'placeBlock_id'))
            ) {
                this.generator.placeBlock(placeBlockID, selectedX, selectedY);

                const giveItemUponPlace = this.item_directory.getProperty(slotItemID, 'giveItemUponPlace');
                const durability = this.item_directory.getProperty(placeBlockID, 'durability') || null;

                if (giveItemUponPlace) {
                    if (this.game.player.inventory.canAddItem(giveItemUponPlace)){
                        this.game.player.inventory.addItems(giveItemUponPlace, durability);
                    } else {
                        this.game.entity_handler.newEntity_Item(x, y, giveItemUponPlace, 0, 0, durability);
                    }
                }

                const block = this.data[this.calc.getChunkID(selectedX)].block_data[this.calc.getRelativeX(selectedX)][selectedY];
                block.onPlace();

                // Play sound
                if (block.sound) {
                    const place_sound = block.getSound('place');
                    block.playSound(place_sound, 0.5);
                }

            } else {
                const chunk_id = this.calc.getChunkID(selectedX);
                const rel_x = this.calc.getRelativeX(selectedX);

                if (this.calc.getBlockData(selectedX, selectedY).requireClick_interact && !this.mouseInfoRight.new_click) return;

                this.data[chunk_id].block_data[rel_x][selectedY].interact(slotItemID);
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
                if (this.game.player.selectedBlock.x !== this.current_breaking.x || this.game.player.selectedBlock.y !== this.current_breaking.y) {
                    resetBreakStatus();
                }
            }

            this.current_breaking = {
                x: this.game.player.selectedBlock.x,
                y: this.game.player.selectedBlock.y
            };

            const isWithinCursorDistLim = this.game.player.getBlockDistance(this.current_breaking.x + 0.5, this.current_breaking.y + 0.5) <= this.game.player.cursorDistLim;

            const playerCursorLocation = this.calc.getBlockByRealXY_unrounded(this.game.input.mouse_realXY.x, this.game.input.mouse_realXY.y); // in blocks (not rounded)

            if (isWithinCursorDistLim && !this.game.entity_handler.isMobAt(playerCursorLocation.x, playerCursorLocation.y)) {

                const blockData = this.calc.getBlockData(this.current_breaking.x, this.current_breaking.y);
                const blockType = blockData.type;
                const hardness = blockData.hardness;
                const blockID = blockData.id;

                let breakStatus = this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status;

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
                    breakStatus += strength;
                }

                // Set break status
                this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y].break_status = breakStatus;

                //Break block
                if (breakStatus >= hardness) {
                    const block = this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y];
                    block.onBreak();

                    // Play sound
                    if (block.sound) {
                        const broke_sound = block.getSound('broke');
                        block.playSound(broke_sound, 0.5);
                    }

                    // Break block
                    this.generator.breakBlock(this.current_breaking.x, this.current_breaking.y);
                    this.current_breaking = null;

                    if (selectedItemType === 'tool') {
                        this.game.player.inventory.decrementDurability(selectedSlot);
                    }
                }
            }

            if (this.current_breaking && isWithinCursorDistLim) {
                const block = this.data[this.calc.getChunkID(this.current_breaking.x)].block_data[this.calc.getRelativeX(this.current_breaking.x)][this.current_breaking.y];

                if (block.sound) {
                    const break_sound = block.getSound('break');
                    block.playSound(break_sound, 0.5);
                }

            }
            
        } else {
            resetBreakStatus();
        }
    }
}

export { Level };