import { Item_Directory } from './generation/blocks.js';

class Game {
    constructor(width, height) {
        this.canvas_world = document.querySelector('#game_canvas_back');
        this.ctx_world = this.canvas_world.getContext('2d');

        this.canvas_entities = document.querySelector('#game_canvas_mid');
        this.ctx_entities = this.canvas_entities.getContext('2d');

        this.canvas_player = document.querySelector('#game_canvas_fore');
        this.ctx_player = this.canvas_player.getContext('2d');

        this.canvas_menu = document.querySelector('#game_canvas_fore2');
        this.ctx_menu = this.canvas_menu.getContext('2d');

        this.width = width;
        this.height = height;
        
        this.level = null;

        this.settings = {
            blockview_width: 15, //number of blocks viewable - default = 15
            blockview_height: 15
        };

        this.block_size = this.width / this.settings.blockview_width; //number of pixels per block

        this.tickSpeed_target = 20; // number of ticks per second
        this.tick = 0; // resets to 0 at 9999

        this.tickSpeed = null;
        this.fps = null;
    }

    async loadModules() {
        // Dynamically import modules
        const { Item_Directory } = await import('./generation/blocks.js');
        const { Calc_World } = await import('./calculations/calc_world.js');
        const { Entity } = await import('./entities/entity.js');
        const { Player } = await import('./entities/player.js');
        const { InputHandler } = await import('./inputs/input.js');
        const { Level } = await import('./generation/level.js');
        const { World_Renderer } = await import('./rendering/renderer.js');
        const { MenuHandler } = await import('./menus/game_menus.js');
        const { EntityHandler } = await import('./entities/entity.js');

        // Initialize game components
        this.calculator = new Calc_World(this);
        this.item_directory = new Item_Directory();
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.level = new Level(this);
        this.renderer = new World_Renderer(this);
        this.menu_handler = new MenuHandler(this);
        this.entity_handler = new EntityHandler(this);
    }
    
    async init() {
        function logPerformance(taskName, startTime, style = "color: black; font-weight: normal;") {
            const elapsedTime = (performance.now() - startTime).toFixed(1);
            console.log(`%c${taskName}: ${elapsedTime}ms`, style);
        }

        const startTime = performance.now();
    
        const loadModulesStart = performance.now();
        await this.loadModules();
        logPerformance("Modules loaded", loadModulesStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const levelStart = performance.now();
        this.level.generate();
        logPerformance("Level generated", levelStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const playerStart = performance.now();
        this.player.spawn();
        logPerformance("Player spawned", playerStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const gameLoopStart = performance.now();
        this.startGameLoop();
        logPerformance("Game loop started", gameLoopStart, "color:rgb(255, 220, 0); font-weight: bold;");
    
        logPerformance("Total init execution time", startTime, "color: orange; font-size: 16px; font-weight: bold;");
    }

    update(deltaTime) {
        // Update the game state
        this.player.update(this.input.keys, deltaTime);
        this.entity_handler.update(deltaTime);
    }

    update_world() {
        // Logic that requires game ticks and world update logic
        this.level.world_interaction(); // for breaking and placing blocks
        this.entity_handler.run_gametick_logic(this.tick);
    }

    menus() {
        this.menu_handler.update(this.input.keys);
    }

    startGameLoop() {

        let lastTick;
        const tick_handler = () => {
            const time_current = performance.now();

            let tickTime;
            if (lastTick) {
                tickTime = time_current - lastTick; // In ms
            } else {
                tickTime = 0;
            }
            

            this.update_world();

            this.tick++;
            this.tickSpeed = tickTime;

            lastTick = time_current;

            setTimeout(tick_handler, this.tickSpeed_target);
        };

        let lastFrame;
        const game_loop = () => {
            const time_current = performance.now();

            let deltaTime;
            if (lastFrame) {
                deltaTime = (time_current - lastFrame) / 1000; // In sec

                this.fps = Math.round(1 / deltaTime);
            } else {
                deltaTime = 0;
            }
            
            this.update(deltaTime); //update player
            this.renderer.drawWorld();
            this.player.draw();
            this.player.updateCursor();
            this.menus();

            lastFrame = time_current;

            requestAnimationFrame(game_loop);
        };

        const debug = () => {
            console.log('FPS: ' + this.fps);

            setTimeout(() => {
                debug();
            }, 1500);
        };


        tick_handler();
        game_loop();
        debug();
    }
}

export { Game }