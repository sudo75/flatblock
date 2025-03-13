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

        this.canvas_menu2 = document.querySelector('#game_canvas_fore3');
        this.ctx_menu2 = this.canvas_menu2.getContext('2d');

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

        this.menu_renderers = {};
        this.slotLoaded = null;
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

    async init_menu() {
        const { Menu_Renderer } = await import('https://sudo75.github.io/canvas-functions/menu_renderer.js');

        const btns_main = [
            {txt: ['START'], callback: () => {
                console.log('loading start menu...');

                this.menu_renderers.main.close();
                this.menu_renderers.start.init();
            }},
            {txt: ['Clear local storage'], callback: () => {
                if (confirm(`Clear all local storage data for '${window.location.href}'?`)) {
                    localStorage.clear();
                }
            }}
        ];

        this.menu_renderers.main = new Menu_Renderer('Block Game', 'Good day sir!', 'v.0.2.0', btns_main, this.width, this.height, this.canvas_menu2);
        this.menu_renderers.main.init();

        const btns_start = [
            {txt: ['New game'], callback: () => {
                console.log('loading game...');

                this.menu_renderers.start.close();
                this.init();
            }},

            {txt: ['Slot 0'], callback: () => {
                this.menu_renderers.start.close();
                this.menu_renderers.slots[0].init();
            }},
            {txt: ['Slot 1'], callback: () => {
                this.menu_renderers.start.close();
                this.menu_renderers.slots[1].init();
            }},
            {txt: ['Slot 2'], callback: () => {
                this.menu_renderers.start.close();
                this.menu_renderers.slots[2].init();
            }},
            {txt: ['Slot 3'], callback: () => {
                this.menu_renderers.start.close();
                this.menu_renderers.slots[3].init();
            }},
            {txt: ['Slot 4'], callback: () => {
                this.menu_renderers.start.close();
                this.menu_renderers.slots[4].init();
            }},

            {txt: ['<= Back'], callback: () => {
                console.log('returning to main menu...');

                this.menu_renderers.start.close();
                this.menu_renderers.main.init();
            }}
        ];

        this.menu_renderers.start = new Menu_Renderer('Block Game', 'New game!', null, btns_start, this.width, this.height, this.canvas_menu2);

        //Slot menus
        const closeSlotMenu = () => {
            for (let i = 0; i < 5; i++) {
                if (this.menu_renderers.slots[i].isOpen) {
                    this.menu_renderers.slots[i].close();
                }
            }
        }

        
        this.menu_renderers.slots = [];
        for (let i = 0; i < 5; i++) {
            const btns_slot = [
                {txt: ['New game'], callback: () => {
                    console.log('loading game...');
    
                    closeSlotMenu();
                    this.init(i);
                }},
                {txt: ['Load game'], callback: () => {    
                    if (this.saveExists(i)) {
                        closeSlotMenu();
                        this.loadGame(i);

                        console.log('loading game...');
                    } else {
                        console.log('Can not load game...');
                    }
                }},
                {txt: ['Clear slot'], callback: () => {
                    if (confirm(`Clear slot ${i}?`)) {
                        localStorage.removeItem(`slot_${i}`);
                    }
                    console.log('clearing slot...');
                }},
    
                {txt: ['<= Back'], callback: () => {
    
                    closeSlotMenu();
                    this.menu_renderers.start.init();
                }}
            ];

            this.menu_renderers.slots[i] = new Menu_Renderer(`Slot ${i}`, `Slot ${this.getSlotStatus()}`, null, btns_slot, this.width, this.height, this.canvas_menu2);
        }
    }
    
    async init(slot) {
        this.slotLoaded = slot;

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
        this.menu_handler.init();
        this.startGameLoop();
        logPerformance("Game loop started", gameLoopStart, "color:rgb(255, 220, 0); font-weight: bold;");
    
        logPerformance("Total init execution time", startTime, "color: orange; font-size: 16px; font-weight: bold;");
    }

    update(deltaTime) {
        // Update the game state
        this.player.update(this.input.keys, deltaTime);
        this.entity_handler.update(deltaTime);
    }

    save_game() {
        let data_world = {};

        for (let key in this.level.data) {
            data_world[key] = {'block_data': this.level.data[key].block_data, entity_data: [] };
        }

        const data_player = {
            position: {
                x: this.player.x,
                y: this.player.y
            },
            inventory: this.player.inventory.data
        };

        const data = {
            data_world: data_world,
            data_player: data_player,
            entity: this.entity_handler.entity_data,
            seed: this.level.generator.seed
        };

        localStorage.setItem(`slot_${this.slotLoaded}`, JSON.stringify(data));
    }

    saveExists(slot) {
        const gameData = localStorage.getItem(`slot_${slot}`);

        if (gameData) {
            return true
        } else {
            return false;
        }
    }

    async loadGame(slot) {

        //FETCH DATA
        const gameData = localStorage.getItem(`slot_${slot}`);

        let gameData_parsed;
        if (gameData) {
            gameData_parsed = JSON.parse(gameData);
            console.log(gameData_parsed);
        } else {
            console.log('No game data found.');
            return;
        }


        //LOAD
        this.slotLoaded = slot;

        function logPerformance(taskName, startTime, style = "color: black; font-weight: normal;") {
            const elapsedTime = (performance.now() - startTime).toFixed(1);
            console.log(`%c${taskName}: ${elapsedTime}ms`, style);
        }

        const startTime = performance.now();
    
        const loadModulesStart = performance.now();
        await this.loadModules();
        logPerformance("Modules loaded", loadModulesStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const levelStart = performance.now();
        this.level.copy(gameData_parsed.data_world, gameData_parsed.entity, gameData_parsed.seed);
        logPerformance("Level generated", levelStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const playerStart = performance.now();
        this.player.copy(gameData_parsed.data_player.position, gameData_parsed.data_player.inventory);
        logPerformance("Player spawned", playerStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        const gameLoopStart = performance.now();
        this.menu_handler.init();
        this.startGameLoop();
        logPerformance("Game loop started", gameLoopStart, "color:rgb(255, 220, 0); font-weight: bold;");
    
        logPerformance("Total init execution time", startTime, "color: orange; font-size: 16px; font-weight: bold;");
    }

    getSlotStatus() {
        return 'empty';
    }

    update_world() {
        // Logic that requires game ticks and world update logic
        this.level.world_interaction(); // for breaking and placing blocks
        this.entity_handler.run_gametick_logic(this.tick);

        if (this.tick % 40 === 0) {
            this.save_game();
        }
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