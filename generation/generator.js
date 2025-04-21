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

                const chooseBlock = () => {
                    let blockClass = this.item_directory.item[0]; //Default to air


                    if (y < dirtLevel) {
                        const possibleOreID = this.ore_table.isOreType_id(absolute_x, y);
                        if (possibleOreID) {
                            blockClass = this.item_directory.item[possibleOreID]; //Ores

                        } else {
                            blockClass = this.item_directory.item[3]; //Stone
                        }

                    } else if (y < grassLevel) {
                        blockClass = this.item_directory.item[1]; //Dirt
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
        this.generate_embellishments(chunk_id);
        this.generate_mobs(chunk_id);
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

            //Attempt to generate trees at 15% probability
            const seed1 = this.seed;
            const seed2 = absoluteX * 12.8 + 131.5;

            if (this.calc.randomBoolByTwoSeeds(seed1, seed2, 10)) {
                this.game.entity_handler.spawnRandomPassiveMob(absoluteX, this.getContour(absoluteX) + 1);
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
            const absoluteX = this.calc.getAbsoluteX(x, chunk_id);
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
        let block = this.item_directory.item[blockID];

        if (!this.item_directory.getProperty(blockID, 'isBlock')) return;

        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new block(x, y);

        if (block && this.game.tick) {
            this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].placedAt = this.game.tick;
        }
    }

    editProperty(x, y, property, data) {
        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y][property] = data;
    }

    breakBlock(x, y) {
        const itemID = this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].itemDrop_id;

        //Drop item
        this.game.player.dropItem(x + 0.5 - this.game.entity_handler.entity_item_dimensions.width / 2, y, itemID, 0, 0); // add half item width to centre

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