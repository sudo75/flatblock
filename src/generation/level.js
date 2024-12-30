class Level {
    constructor(game) {
        this.game = game;
        this.ctx = this.game.ctx_world;
        this.block_data = null;
        this.properties = {
            width: 20,
            height: 20
        }
    }

    generate() { //GENERATES FROM TOP TO BOTTOM
        // Logic to generate the game level
        this.block_data = [];
        for (let i = 0; i < this.properties.height; i++) {
            let row = [];
            for (let j = 0; j < this.properties.width; j++) {
                if (i == 10) {
                    row.push(Math.round(Math.random()));
                }
                else if (i >= 10) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            this.block_data.push(row);
        }
    }

    drawBlock(row, col, colour) {
        //The first block will be y = 0, this aligns with the canvas coordinate system, and thus no recaululation is needed

        const block_width = this.game.width / this.game.settings.blockview_width;
        const block_height = this.game.height / this.game.settings.blockview_height;
        const left = col * block_width; //dist from x axis (left)
        const top = row * block_height; //dist from y axis (bottom)

        this.ctx.fillStyle = colour;
        this.ctx.fillRect(left, top, block_width, block_height);
    }

    drawOutline(row, col) {
        const block_width = this.game.width / this.game.settings.blockview_width;
        const block_height = this.game.height / this.game.settings.blockview_height;
        const left = col * block_width; // Distance from x-axis (left)
        const top = row * block_height; //dist from y axis (bottom)

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