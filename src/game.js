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
            blockview_width: 15, //number of blocks viewable
            blockview_height: 15
        };

        this.block_size = this.width / this.settings.blockview_width; //number of pixels per block
    }

    async loadModules() {
        // Dynamically import modules
        const { Calc_World } = await import('./calculations/calc_world.js');
        const { Entity } = await import('./entities/entity.js');
        const { Player } = await import('./entities/player.js');
        const { InputHandler } = await import('./inputs/input.js');
        const { Level } = await import('./generation/level.js');
        const { World_Renderer } = await import('./rendering/renderer.js');

        // Initialize game components
        this.calculator = new Calc_World(this);
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

    update(deltaTime) {
        // Update the game state
        this.player.update(this.input.keys, deltaTime);
    }

    startGameLoop() {
        const loop = () => {
            const time_current = performance.now();

            let deltaTime;
            if (this.time_last) {
                deltaTime = time_current - this.time_last; // In ms
            } else {
                deltaTime = 0;
            }
            
            
            this.update(deltaTime);
            this.renderer.drawWorld();
            this.player.draw();
            requestAnimationFrame(loop);


            this.time_last = time_current;
        };
        loop();
    }
}

export { Game }