import { OreTable } from './ores.js'

class Generator {
    constructor(game, data, properties) {
        this.game = game;
        this.calc = this.game.calculator;
        this.item_directory = this.game.item_directory;

        this.properties = properties;

        this.data = data;

        this.seed = this.generateSeed();

        this.settings = {
            maxAmp_aug: 0.2, // default = 0.2
            maxFreq_aug: 0.2 // default = 0.2
        }
    }

    generateSeed() {
        //First 5 params = 10 digits
        let seed = '';
        
        if (seed === '') {
            for (let i = 0; i < 5; i++) {
                seed += JSON.stringify(Math.floor(Math.random())) + JSON.stringify(Math.floor(Math.random() * 10)) + JSON.stringify(Math.floor(Math.random())) + JSON.stringify(Math.floor(Math.random() * 10)) + JSON.stringify(Math.floor(Math.random() * 10));
            }
        }
        
        
        console.log(seed);
        return seed;
    }

    getOffsetData(index) { //Argument variations based on seed - returns a decimal value (+/-)
        const i0 = parseInt(this.seed[index * 5]);
        const i1 = (parseInt(this.seed[index * 5 + 1]) + 1) / 10 * this.settings.maxAmp_aug;
        const i2 = parseInt(this.seed[index * 5 + 2]);
        const i3 = (parseInt(this.seed[index * 5 + 3]) + 1) / 10 * this.settings.maxFreq_aug;
        const i4 = parseInt(this.seed[index * 5 + 4]);

        return {
            ampl: i0 < 0 ? i1 * -1: i1,
            freq: i2 < 0 ? i3 * -1: i3,
            hori: i4 * 500
        };
    }

    calc_sine(x, ampl, freq, hori) {
        return ampl * Math.sin(freq * (x + hori));
    }

    getContour(x) { //returns ground level/elevation (y) given x
        
        const f1 = (x) => {
            const offsetData = this.getOffsetData(0);

            const ampl = 6 * (1 + offsetData.ampl);
            const freq = 0.01 * (1 + offsetData.freq);
            const hori = offsetData.hori;

            return this.calc_sine(x, ampl, freq, hori);
        };

        const f2 = (x) => {
            const offsetData = this.getOffsetData(1);

            const ampl = 2 * (1 + offsetData.ampl);
            const freq = 0.05 * (1 + offsetData.freq);

            const hori = offsetData.hori;

            return this.calc_sine(x, ampl, freq, hori);
        };

        const f3 = (x) => {
            const offsetData = this.getOffsetData(2);

            const ampl = 1 * (1 + offsetData.ampl);
            const freq = 0.1 * (1 + offsetData.freq);

            const hori = offsetData.hori;

            return this.calc_sine(x, ampl, freq, hori);
        };

        const f4 = (x) => {
            const offsetData = this.getOffsetData(3);

            const ampl = 0.5 * (1 + offsetData.ampl);
            const freq = 0.2 * (1 + offsetData.freq);

            const hori = offsetData.hori;

            return this.calc_sine(x, ampl, freq, hori);
        };

        const f5 = (x) => {
            const offsetData = this.getOffsetData(4);

            const ampl = 0.2 * (1 + offsetData.ampl);
            const freq = 0.2 * (1 + offsetData.freq);

            const hori = offsetData.hori;

            return this.calc_sine(x, ampl, freq, hori);
        };

        //FINE TUNING
        const f6 = (x) => {
            return g1(x) + g2(x) + g3(x);
        };

        const g1 = (x) => {
            return this.calc_sine(x, 2, 0.01, 0);
        };
        const g2 = (x) => {
            return this.calc_sine(x, 4, 0.02, 0);
        };
        const g3 = (x) => {
            return this.calc_sine(x, 0.2, 0.5, 0);
        };

        const a = 1; //frequency
        const b = 2; //amplitude
        const c = 60; //height_offset

        const y = b * (f1(a*x) + f2(a*x) + f3(a*x) + f4(a*x) + f5(a*x) + f6(a*x)) + c;

        return Math.round(y);
    }

    generate_chunk(chunk_id) { //GENERATES FROM TOP TO BOTTOM
        this.ore_table = new OreTable(this.game, this.seed);

        // Logic to generate the game level
        let chunck = [];

        for (let x = 0; x < this.game.level.chunk_size; x++) {
            let col = [];
            for (let y = 0; y < this.properties.height_blocks; y++) {

                const absolute_x = chunk_id * this.game.level.chunk_size + x;

                const grassLevel = this.getContour(absolute_x);

                const dirtLevel = grassLevel - 4;

                const seaLevel = 40; // The block above the highest water block

                const chooseBlock = () => {
                    let blockClass = this.item_directory.item[0]; //Default to air


                    if (y === 0) {
                        blockClass = this.item_directory.item[200]; //Bedrock
                    } else if (y < dirtLevel) {
                        const possibleOreID = this.ore_table.isOreType_id(absolute_x, y);
                        if (possibleOreID) {
                            blockClass = this.item_directory.item[possibleOreID]; //Ores

                        } else {
                            blockClass = this.item_directory.item[3]; //Stone
                        }

                    } else if (y < grassLevel) {
                        blockClass = this.item_directory.item[1]; //Dirt
                    } else if (y < seaLevel - 1) {
                        blockClass = this.item_directory.item[13]; // Water
                    }  else if (y < seaLevel) {
                        if (this.getContour(absolute_x - 1) === seaLevel || this.getContour(absolute_x + 1) === seaLevel) {
                            blockClass = this.item_directory.item[2]; //Grass
                        } else {
                            blockClass = this.item_directory.item[13]; // Water
                        }
                    } else if (y === grassLevel) {
                        blockClass = this.item_directory.item[2]; //Grass
                    }

                    return new blockClass(absolute_x, y);
                };

                const block = chooseBlock();
                col.push(block);
            }
            chunck.push(col);
        }
        this.data[chunk_id] = { block_data: chunck, entity_data: [] };
    }

    carveCaves() {
        // 50% chance of a seeded cave per chunk
        const chunk_min = this.calc.getWorldBounds()[0];
        const chunk_max = this.calc.getWorldBounds()[1];

        // Generate possible cave locations
        let seededCaves = [];
        for (let chunkIndex = chunk_min; chunkIndex <= chunk_max; chunkIndex++) {
            const generateCave = this.calc.randomBoolByTwoSeeds(this.seed, chunkIndex, 50);
            if (generateCave) {
                const relChunkMiddle = Math.floor(this.game.level.chunk_size / 2);
                const absCaveX = this.calc.getAbsoluteX(relChunkMiddle, chunkIndex);
                const y = this.calc.randomIntByTwoSeeds(this.seed, chunkIndex) / 100 * this.game.level.properties.height_blocks;

                const energy = this.calc.randomIntByTwoSeeds(this.seed, absCaveX);
                const sizeFactor = this.calc.randomIntByTwoSeeds(this.seed, y);
                const sizeRandomness = this.calc.randomIntByTwoSeeds(this.seed, y);

                seededCaves.push({x: absCaveX, y: y, energy: energy, sizeFactor: sizeFactor, sizeRandomness: sizeRandomness});
            }
        }



        for (let i = 0; i < seededCaves.length; i++) {
            
            const caveLocation = {x: seededCaves[i].x, y: seededCaves[i].y};

            const radius_default = 3.5;
            const radius_min = (radius_default - (radius_default * (seededCaves[i].sizeFactor / 100 / 100) * seededCaves[i].sizeRandomness) * 0.75);
            const radius_max = (radius_default + (radius_default * (seededCaves[i].sizeFactor / 100 / 100) * seededCaves[i].sizeRandomness) * 0.5);

            const energy = Math.floor(seededCaves[i].energy / 4 + 30);

            const carveCircle = (caveLocation, radius_min, radius_max, energy) => {
                if (energy === 0) return;
                
                const radius_span = radius_max - radius_min;
                const radius = this.calc.randomIntByTwoSeeds(this.seed, caveLocation.x + caveLocation.y) / 100 * radius_span + radius_min; // circle 3 - 8 blocks in radius

                // Bounding box
                const minX = Math.floor(caveLocation.x - radius);
                const maxX = Math.ceil(caveLocation.x + radius);
                const minY = Math.floor(caveLocation.y - radius);
                const maxY = Math.ceil(caveLocation.y + radius);

                // Carve circle
                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        const dx = x - caveLocation.x;
                        const dy = y - caveLocation.y;

                        // euclidean distance
                        const dist = (dx ** 2 + dy ** 2) ** 0.5;

                        if (dist <= radius && this.calc.isWithinWorldBounds(x, y)) {
                            if (this.calc.getBlockData(x, y).id !== 200) { // prevent bedrock removal
                                this.placeBlockOnly(0, x, y);
                            }
                        }
                    }
                }

                // Call recursively

                const d_min = 2;
                const d_max = 6;
                const d_span = d_max - d_min;

                const dx = (() => {
                    const negative = this.calc.randomBoolByTwoSeeds(this.seed, caveLocation.x + caveLocation.y, 50);
                    let dx;

                    if (negative) {
                        dx = -d_min - this.calc.randomIntByTwoSeeds(this.seed, caveLocation.x) / 100 * d_span;
                    } else {
                        dx = d_min + this.calc.randomIntByTwoSeeds(this.seed, caveLocation.x) / 100 * d_span;
                    }

                    return dx;
                })();
                const dy = (() => {
                    const negative = this.calc.randomBoolByTwoSeeds(this.seed, caveLocation.x + caveLocation.y, 65);
                    let dy;

                    if (negative) {
                        dy = -d_min - this.calc.randomIntByTwoSeeds(this.seed, caveLocation.y) / 100 * d_span;
                    } else {
                        dy = d_min + this.calc.randomIntByTwoSeeds(this.seed, caveLocation.y) / 100 * d_span;
                    }
                    

                    return dy;
                })();

                const newCaveLocation = {x: caveLocation.x + dx, y: caveLocation.y + dy};

                carveCircle(newCaveLocation, radius_min, radius_max, energy - 1);

            }

            carveCircle(caveLocation, radius_min, radius_max, energy);
            
        }

    }

    generate_embellishments(chunk_id) {
        for (let x = 0; x < this.game.level.chunk_size; x++) {
            const absoluteX = this.calc.getAbsoluteX(x, chunk_id);

            //Attempt to generate trees at 15% probability
            const seed1 = this.seed;
            const seed2 = absoluteX * 12.8 + 131.5;

            if (this.calc.randomBoolByTwoSeeds(seed1, seed2, 15)) {
                this.generateTree(absoluteX, this.getContour(absoluteX) + 1, chunk_id);
            }
        }
    }

    generate_mobs(chunk_id) {
        for (let x = 0; x < this.game.level.chunk_size; x++) {
            const absoluteX = this.calc.getAbsoluteX(x, chunk_id);
            const y = this.getContour(absoluteX) + 1;

            //Attempt to generate trees at 15% probability
            const seed1 = this.seed;
            const seed2 = this.seed / absoluteX * 12.8 + 131.5;

            if (this.calc.randomBoolByTwoSeeds(seed1, seed2, 5)) {
                if (!this.calc.getBlockData(absoluteX, y).id === 0) continue;
                
                this.game.entity_handler.spawnRandomPassiveMob(absoluteX, y);
            }
        }
    }

    generateTree(x, y, chunk_id) {  //Attempts tree generation
        const blocks_template = [
            {id: 4, dx: 0, dy: 0, chance: 100},
            {id: 4, dx: 0, dy: 1, chance: 100},
            {id: 4, dx: 0, dy: 2, chance: 100},
            {id: 4, dx: 0, dy: 3, chance: 100},

            {id: 6, dx: -1, dy: 2, chance: 100},
            {id: 6, dx: -1, dy: 3, chance: 100},
            {id: 6, dx: -1, dy: 4, chance: 100},
            {id: 6, dx: 0, dy: 4, chance: 100},
            {id: 6, dx: 1, dy: 4, chance: 100},
            {id: 6, dx: 1, dy: 3, chance: 100},
            {id: 6, dx: 1, dy: 2, chance: 100},
            
            {id: 6, dx: -2, dy: 2, chance: 80},
            {id: 6, dx: -2, dy: 3, chance: 80},
            {id: 6, dx: -1, dy: 5, chance: 80},
            {id: 6, dx: 0, dy: 5, chance: 100},
            {id: 6, dx: 1, dy: 5, chance: 80},
            {id: 6, dx: 2, dy: 3, chance: 80},
            {id: 6, dx: 2, dy: 2, chance: 80},
        ];

        let blocks = [];

        // Calculate block positions
        for (let i = 0; i < blocks_template.length; i++) {
            if (this.calc.randomBool(blocks_template[i].chance)) {
                blocks.push(blocks_template[i]);
            }
        }

        //Ensure collision requirements
        for (let i = 0; i < blocks.length; i++) {
            const blockX = x + blocks[i].dx;
            const blockY = y + blocks[i].dy;

            const block_chunkID = this.calc.getChunkID(blockX);

            if (!this.calc.chunkIsGenerated(block_chunkID)) {
                return;
            }
            if (this.calc.getBlockData(blockX, blockY).id !== 0) {
                return;
            }
        }

        //Ensure block below is dirt or grass
        if (this.calc.getBlockData(x, y - 1).id !== 1 && this.calc.getBlockData(x, y - 1).id !== 2) return;

        //Build tree
        for (let i = 0; i < blocks.length; i++) {
            const blockID = blocks[i].id;
            const blockX = x + blocks[i].dx;
            const blockY = y + blocks[i].dy;

            this.placeBlock(blockID, blockX, blockY);
        }
    }

    placeBlock(blockID, x, y) {
        this.placeBlockOnly(blockID, x, y);

        const selectedSlot = this.game.player.inventory.selectedSlot;
        this.game.player.inventory.subtract(selectedSlot);
    }

    placeBlockOnly(blockID, x, y) {
        // Get block id to place
        const placeBlock_ID = this.item_directory.getProperty(blockID, 'placeBlock_id');

        blockID = placeBlock_ID ? placeBlock_ID: blockID;

        // Get block class from block id
        let block = this.item_directory.item[blockID];

        // Do not allow non-blocks (i.e. items) to be placed
        if (!this.item_directory.getProperty(blockID, 'isBlock')) return;

        // Place block
        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new block(x, y);

        if (block && this.game.tick) {
            this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].placedAt = this.game.tick;
        }
    }

    editProperty(x, y, property, data) {
        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y][property] = data;
    }

    excecuteMethod(x, y, method, args) { // method as a string, args as an array
        const chunkID = this.calc.getChunkID(x);
        const relX = this.calc.getRelativeX(x);
        const block = this.data[chunkID].block_data[relX][y];

        if (typeof block[method] === 'function') {
            return block[method](...args); // ...args will spread array into multiple args
        } else {
            console.warn(`Method '${method}' not found on block at (${x}, ${y})`);
        }
    }

    breakBlock(x, y) {
        const itemIDs = this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].itemDrop_id;

        //Drop item
        for (let i = 0; i < itemIDs.length; i++) {
            const itemID = itemIDs[i].id;
            const quantity = itemIDs[i].quantity;
            const chance = itemIDs[i]?.chance ?? 100;

            if (this.calc.randomBool(chance)) {
                for (let j = 0; j < quantity; j++) {
                    this.game.player.dropItem(x + 0.5 + (0.25 - 0.5 * Math.random()) - this.game.entity_handler.entity_item_dimensions.width / 2, y, itemID, 0, 0); // add half item width to centre
                }
            }
            
        }

        //Drop inventory
        const block_inventory = this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].inventory;
        if (block_inventory) {
            const block_inventory_data = block_inventory.data;
            for (let i = 0; i < block_inventory_data.length; i++) {
                const itemQuantity = block_inventory_data[i].quantity
                const itemID = block_inventory_data[i].id;
                const itemDurability = block_inventory_data[i].durability;

                for (let j = 0; j < itemQuantity; j++) {
                    this.game.player.dropItem(x + 0.5 - this.game.entity_handler.entity_item_dimensions.width / 2, y, itemID, 0, 0, itemDurability); // add half item width to centre
                }
            }
        }


        //Set block to air
        const Air_class = this.item_directory.item[0];

        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new Air_class(x, y);
    }
}

export { Generator };