import { Block_Air, Block_dirt } from "./blocks.js";

class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.data = {};
        this.loaded_chunks = [];
        this.properties = {
            width_chunks: 2,
            height_blocks: 20
        }

        this.chunk_size = 16;
        this.calc = this.game.calculator;
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
                if (y === 2) {
                    name = Math.round(Math.random()) === 0 ? 'dirt': 'air'
                }
                else if (y < 2) {
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

        this.data[1].block_data[15][6].name = 'dirt';

        console.log(this.data)
    }
}

export { Level };