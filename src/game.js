class Game {
    constructor(width, height) {
        this.canvas_world = document.querySelector('#game_canvas_back');
        this.ctx_world = this.canvas_world.getContext('2d');

        this.canvas_entities = document.querySelector('#game_canvas_mid');
        this.ctx_entities = this.canvas_entities.getContext('2d');

        this.canvas_player = document.querySelector('#game_canvas_fore');
        this.ctx_player = this.canvas_player.getContext('2d');

        this.width = width;
        this.height = height;
        
        this.level = null;

        this.settings = {
            blockview_width: 16, //number of blocks viewable
            blockview_height: 16
        };

        this.block_size = this.width / this.settings.blockview_width; //number of pixels per block
    }

    async loadModules() {
        // Dynamically import modules
        const { Entity } = await import('./entities/entity.js');
        const { Player } = await import('./entities/player.js');
        const { InputHandler } = await import('./inputs/input.js');
        const { Level } = await import('./generation/level.js');
        const { World_Renderer } = await import('./rendering/renderer.js');

        // Initialize game components
        this.player = new Player(this);
        this.input = new InputHandler();
        this.level = new Level(this);
        this.renderer = new World_Renderer(this);
    }

    init() {
        this.loadModules().then(() => {
            // Initialize game components
            this.level.generate();
            this.player.spawn();
            this.startGameLoop();
        });
    }

    update() {
        // Update the game state
        this.player.update(this.input.keys);
    }

    startGameLoop() {
        const loop = () => {
            this.update();
            this.renderer.drawWorld();
            this.player.draw();
            requestAnimationFrame(loop);
        };
        loop();
    }
}

export { Game }