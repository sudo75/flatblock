import { Block_Air, Block_dirt } from "./blocks.js";

class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.data = {};
        this.loaded_chunks = [];
        this.properties = {
            width: 20,
            height: 20
        }

        this.chunk_size = 16;
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
            for (let y = 0; y < this.properties.height; y++) {
                let name;
                if (y === 10) {
                    name = Math.round(Math.random()) === 0 ? 'dirt': 'air'
                }
                else if (y < 10) {
                    name = 'dirt';
                } else {
                    name = 'air';
                }

                const block = name === 'dirt' ? new Block_dirt(x, y): new Block_Air(x, y);
                col.push(block);
            }
            chunck.push(col);
        }
        this.data[chunk_id] = { block_data: chunck };


        for (let i = 0; i < this.properties.height; i++) {
            let row = [];
            for (let j = 0; j < this.chunk_size; j++) {
                let name;
                if (i == 10) {
                    name = Math.round(Math.random()) === 0 ? 'dirt': 'air'
                }
                else if (i >= 10) {
                    name = 'dirt';
                } else {
                    name = 'air';
                }

                const x = chunk_id * j + j;
                const y = i
                const block = new Block_dirt(j, i);
                row.push(block);
            }
            chunck.push(row);
        }

        this.data[chunk_id] = { block_data: chunck };
    }

    generate() {
        this.generate_chunk(0);
        this.generate_chunk(-1);
        this.generate_chunk(1);

        console.log(this.data)
    }

    drawBlock(x, y, colour) {
        //The first block will be y = 0, this aligns with the canvas coordinate system, and thus no recaululation is needed

        const block_width = this.game.width / this.game.settings.blockview_width;
        const block_height = this.game.height / this.game.settings.blockview_height;
        const left = x * block_width; //dist from x axis (left)
        const top = y * block_height; //dist from y axis (bottom)

        this.ctx.fillStyle = colour;
        this.ctx.fillRect(left, top, block_width, block_height);
    }

    drawOutline(x, y) {
        const block_width = this.game.width / this.game.settings.blockview_width;
        const block_height = this.game.height / this.game.settings.blockview_height;
        const left = x * block_width; // Distance from x-axis (left)
        const top = y * block_height; //dist from y axis (bottom)

        this.ctx.beginPath();
        this.ctx.rect(left, top, block_width, block_height);
        this.ctx.strokeStyle = 'black'; // Outline color
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    draw() {
        this.clear();

        for (let i = 0; i < this.properties.height; i++) {
            for (let j = 0; j < this.properties.width; j++) {
                if (this.block_data[i][j] == 1) {
                    this.drawBlock(i, j, 'green');
                } else {
                    this.drawBlock(i, j, 'lightblue');
                }
                this.drawOutline(i, j);
            }
        }
    }
}

export { Level };