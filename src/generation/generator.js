import { Block_Air, Block_dirt, Block_grass, Block_stone, Block_treeLog, Block_log, Block_treeleaves, Block_leaves } from "./blocks.js";

class Generator {
    constructor(game, data, properties) {
        this.game = game;
        this.calc = this.game.calculator;

        this.properties = properties;

        this.chunk_size = 16;
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
        
        for (let i = 0; i < 5; i++) {
            seed += JSON.stringify(Math.floor(Math.random())) + JSON.stringify(Math.floor(Math.random() * 10)) + JSON.stringify(Math.floor(Math.random())) + JSON.stringify(Math.floor(Math.random() * 10)) + JSON.stringify(Math.floor(Math.random() * 10));
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
        // Logic to generate the game level
        let chunck = [];

        for (let x = 0; x < this.chunk_size; x++) {
            let col = [];
            for (let y = 0; y < this.properties.height_blocks; y++) {

                const absolute_x = chunk_id * this.chunk_size + x;

                const grassLevel = this.getContour(absolute_x);

                const dirtLevel = grassLevel - 4;

                const chooseBlock = () => {
                    if (y < dirtLevel) {
                        return new Block_stone(absolute_x, y);
                    } else if (y < grassLevel) {
                        return new Block_dirt(absolute_x, y);
                    } else if (y === grassLevel) {
                        return new Block_grass(absolute_x, y);
                    } else {
                        return new Block_Air(absolute_x, y);
                    }
                };

                const block = chooseBlock();
                col.push(block);
            }
            chunck.push(col);
        }
        this.data[chunk_id] = { block_data: chunck, entity_data: [] };
        this.generate_embellishments(chunk_id);
    }

    generate_embellishments(chunk_id) {
        for (let x = 0; x < this.chunk_size; x++) {
            const absoluteX = this.calc.getAbsoluteX(x, chunk_id);
            

            //Generate trees at 10% probability
            if (this.calc.randomBool(10)) {
                this.generateTree(absoluteX, this.getContour(absoluteX) + 1, chunk_id);
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

        //Build tree
        for (let i = 0; i < blocks.length; i++) {
            const blockID = blocks[i].id;
            const blockX = x + blocks[i].dx;
            const blockY = y + blocks[i].dy;

            this.placeBlock(blockID, blockX, blockY);
        }
    }

    placeBlock(blockID, x, y) {
        let block;
        switch (blockID) { //UPGRADE CODE LATER
            case 1:
                block = Block_dirt;
                break;
            case 2:
                block = Block_grass;
                break;
            case 3:
                block = Block_stone;
                break;
            case 4:
                block = Block_treeLog;
                break;
            case 5:
                block = Block_log;
                break;
            case 6:
                block = Block_treeleaves;
                break;
            case 7:
                block = Block_leaves;
                break;
            default:
                console.warn('Can\'t place block!');
                return;
        }

        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new block(x, y);

        const selectedSlot = this.game.player.inventory.selectedSlot;
        this.game.player.inventory.subtract(selectedSlot);
    }

    breakBlock(x, y) {
        const itemID = this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y].itemDrop_id;

        this.data[this.calc.getChunkID(x)].block_data[this.calc.getRelativeX(x)][y] = new Block_Air(x, y);

        //Drop item
        this.game.player.dropItem(x + 0.5 - this.game.entity_handler.entity_item_dimensions.width / 2, y, itemID, 0, 0); // add half item width to centre
    }
}

export { Generator }