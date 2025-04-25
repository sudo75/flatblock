import { LZString } from './lib/lz-string-1.4.5/libs/lz-string.js';
import { Debugger } from './debug.js'

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

        this.setImgSmoothing(false);

        this.width = width;
        this.height = height;
        
        this.level = null;
        this.status = 0; // 0: unloaded, 1: playing, 2: paused, 3: dead

        this.settings = {
            blockview_width: 15, //number of blocks viewable - default = 15
            blockview_height: 15
        };

        this.block_size = this.width / this.settings.blockview_width; //number of pixels per block

        this.tps_target = 20; // number of ticks per second
        this.tick = 0; // resets to 0 at 9999

        this.tps = null;
        this.fps = null;

        this.performanceData_display = {
            fps: this.fps,
            tps: this.tps
        };

        this.menu_renderers = {};
        this.slotLoaded = null;

        this.loadModules();

        window.addEventListener('beforeunload', (event) => {
            if (this.status !== 0) {
                this.save();
            }
        });

        this.keysHeld = [];
        this.newKeys = [];
    }

    setImgSmoothing(smoothing) {
        if (typeof(smoothing) !== 'boolean') {
            return;
        }

        this.ctx_world.imageSmoothingEnabled = smoothing;
        this.ctx_entities.imageSmoothingEnabled = smoothing;
        this.ctx_player.imageSmoothingEnabled = smoothing;
        this.ctx_menu.imageSmoothingEnabled = smoothing;
        this.ctx_menu2.imageSmoothingEnabled = smoothing;
    }

    updateViewSize(width, height) {
        this.settings = {
            blockview_width: width, //number of blocks viewable - default = 15
            blockview_height: height
        };

        this.block_size = this.width / this.settings.blockview_width; //number of pixels per block
    }

    async loadModules() {
        // Dynamically import modules
        const { Item_Directory } = await import('./generation/blocks.js');
        const { Calc_World } = await import('./calculations/calc_world.js');
        const { Player } = await import('./entities/player.js');
        const { InputHandler } = await import('./inputs/input.js');
        const { Level } = await import('./generation/level.js');
        const { World_Renderer } = await import('./rendering/renderer.js');
        const { MenuHandler } = await import('./menus/game_menus.js');
        const { EntityHandler } = await import('./entities/entity_handler.js');

        // Initialize game components
        this.calculator = new Calc_World(this);
        this.item_directory = new Item_Directory();
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.level = new Level(this);
        this.renderer = new World_Renderer(this);
        this.menu_handler = new MenuHandler(this);
        this.entity_handler = new EntityHandler(this);

        this.debugger = new Debugger(this);
    }

    async init_menu() {
        this.status = 1;
        const { Menu_Renderer } = await import('./lib/canvas-functions/menu_renderer.js');

        const btns_main = [
            {txt: ['START'], callback: () => {
                console.log('loading start menu...');

                this.menu_renderers.main.close();
                this.menu_renderers.start.init();
            }},
            {txt: ['Open Debugger'], callback: () => {
                this.debugger.commandInput();
            }},
            {txt: ['Clear Debug Settings'], callback: () => {
                if (confirm(`Clear all settings data?`)) {
                    this.debugger.clearSettings();   
                }
            }},
            {txt: ['Clear local storage'], callback: () => {
                if (confirm(`Clear all local storage data for '${window.location.href}'?`)) {
                    localStorage.clear();
                    this.menu_renderers.main.close();
                    this.init_menu();
                }
            }}
        ];

        const main_menu_messages = [
            'Good day sir!',
            '5000 lines of code',
            'Spaghetti code!',
            'Poorly programmed'
        ];

        const randIndex = Math.floor(Math.random() * main_menu_messages.length)
        const message = main_menu_messages[randIndex]

        this.menu_renderers.main = new Menu_Renderer('Block Game', message, `Storage: ${this.getDiagnostics_storage().size.toLocaleString("en-US")} / ${this.getDiagnostics_storage().quota.toLocaleString("en-US")} bytes - ${this.getDiagnostics_storage().percentage}%`, btns_main, this.width, this.height, this.canvas_menu2);
        this.menu_renderers.main.init();

        const btns_start = [
            {txt: ['New game *will not save*'], callback: () => {
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
                this.menu_renderers.main.version = `Storage: ${this.getDiagnostics_storage().size.toLocaleString("en-US")} / ${this.getDiagnostics_storage().quota.toLocaleString("en-US")} bytes - ${this.getDiagnostics_storage().percentage}%`;
                this.menu_renderers.main.init();
            }}
        ];

        this.menu_renderers.start = new Menu_Renderer('Block Game', 'Select a slot to create a new savable game', null, btns_start, this.width, this.height, this.canvas_menu2);

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
                    this.menu_renderers.new_game[i].init();
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

                        const level_size = this.getSlotData(i, 'level_size');
                        const text = level_size ? `Level size: ${level_size}`: `-Empty-`;
                        
                        const storage_data = this.getDiagnosticsBySlot_storage(i);
                        const text2 = storage_data ? `Slot ${i} storage: ${storage_data.size.toLocaleString("en-US")} / ${storage_data.quota.toLocaleString("en-US")} bytes - ${storage_data.percentage}%`: null;

                        this.menu_renderers.slots[i].subtitle = text;
                        this.menu_renderers.slots[i].version = text2;

                        this.menu_renderers.slots[i].close();
                        this.menu_renderers.slots[i].init();
                    }
                }},
    
                {txt: ['<= Back'], callback: () => {
    
                    closeSlotMenu();
                    this.menu_renderers.start.init();
                }}
            ];

            const level_size = this.getSlotData(i, 'level_size');
            const text1 = level_size ? `Level size: ${level_size}`: `-Empty-`;

            const storage_data = this.getDiagnosticsBySlot_storage(i);
            const text2 = storage_data ? `Slot ${i} storage: ${storage_data.size.toLocaleString("en-US")} / ${storage_data.quota.toLocaleString("en-US")} bytes - ${storage_data.percentage}%`: null;
            this.menu_renderers.slots[i] = new Menu_Renderer(`Slot ${i}`, text1, text2, btns_slot, this.width, this.height, this.canvas_menu2);
        }

        //New game menus
        const closeNewGameMenu = () => {
            for (let i = 0; i < 5; i++) {
                if (this.menu_renderers.new_game[i].isOpen) {
                    this.menu_renderers.new_game[i].close();
                }
            }
        }

        this.menu_renderers.new_game = [];
        for (let i = 0; i < 5; i++) {
            const btns_slot = [
                {txt: ['Tiny'], callback: () => {
                    console.log('loading game...');
    
                    closeNewGameMenu();
                    this.init(i, 'tiny');
                }},
                {txt: ['Small'], callback: () => {
                    console.log('loading game...');
    
                    closeNewGameMenu();
                    this.init(i, 'small');
                }},
                {txt: ['Medium'], callback: () => {
                    console.log('loading game...');
    
                    closeNewGameMenu();
                    this.init(i, 'medium');
                }},
                {txt: ['Large'], callback: () => {
                    console.log('loading game...');
    
                    closeNewGameMenu();
                    this.init(i, 'large');
                }},
                {txt: ['Huge'], callback: () => {
                    console.log('loading game...');
    
                    closeNewGameMenu();
                    this.init(i, 'huge');
                }},
                
    
                {txt: ['<= Back'], callback: () => {
    
                    closeNewGameMenu();
                    this.menu_renderers.slots[i].init();
                }}
            ];

            const level_size = this.getSlotData(i, 'level_size');
            const text = level_size ? `Level size: ${level_size}`: `-Empty-`;
            this.menu_renderers.new_game[i] = new Menu_Renderer(`Slot ${i}`, `${text}`, null, btns_slot, this.width, this.height, this.canvas_menu2);
        }


        //OTHER MENUS

        const btns_death = [
            {txt: ['Respawn'], callback: () => {
                this.menu_renderers.death.close();

                this.player.respawn(); // status is set via this function
            }},
            {txt: ['<= Main Menu'], callback: () => {
                this.status = 0;
                this.clearGameCanvases();

                this.menu_renderers.death.close();
                this.menu_renderers.main.init();
            }}
        ];

        this.menu_renderers.death = new Menu_Renderer('Game Over', 'Good day sir!', null, btns_death, this.width, this.height, this.canvas_menu2);
    }

    clearGameCanvases() {
        this.ctx_world.clearRect(0, 0, this.width, this.height);
        this.ctx_entities.clearRect(0, 0, this.width, this.height);
        this.ctx_player.clearRect(0, 0, this.width, this.height);
        this.ctx_menu.clearRect(0, 0, this.width, this.height);
    }
    
    async init(slot, level_size) {
        this.slotLoaded = slot != undefined ? slot: 'default';
        this.status = 1;

        const getSize = (level_size) => {
            let width_chunks;
            let height_blocks;
            switch(level_size) {
                case 'tiny':
                    width_chunks = 3;
                    height_blocks = 120;
                    break;
                case 'small':
                    width_chunks = 7;
                    height_blocks = 120;
                    break;
                case 'medium':
                    width_chunks = 15;
                    height_blocks = 150;
                    break;
                case 'large':
                    width_chunks = 27;
                    height_blocks = 150;
                    break;
                case 'huge':
                    width_chunks = 53;
                    height_blocks = 180;
                    break;
                default:
                    width_chunks = 15;
                    height_blocks = 150;
            }

            return {
                width_chunks: width_chunks,
                height_blocks: height_blocks
            };
        };

        const width_chunks = getSize(level_size).width_chunks;
        const height_blocks = getSize(level_size).height_blocks;

        function logPerformance(taskName, startTime, style = "color: black; font-weight: normal;") {
            const elapsedTime = (performance.now() - startTime).toFixed(1);
            console.log(`%c${taskName}: ${elapsedTime}ms`, style);
        }

        const startTime = performance.now();
        

        const levelStart = performance.now();
        this.level.properties.width_chunks = width_chunks;
        this.level.properties.height_blocks = height_blocks;

        this.level.simulation_distance = 7;
        this.level.block_simulation_distance = 7;

        this.level.level_size = level_size;

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
        if (this.status !== 1) return;

        // Update keys held
        this.newKeys = [];

        for (const key of this.input.keys) {
            if (!this.keysHeld.includes(key)) {
                this.newKeys.push(key);
                this.keysHeld.push(key);
            }
        }

        // Remove released keys from keysHeld
        this.keysHeld = this.keysHeld.filter(key => this.input.keys.includes(key));


        // Update the game state
        this.player.update(this.input.keys, this.input.mouseDown, this.input.mouseDown_right, deltaTime);
        this.entity_handler.update(deltaTime);

        this.debug_keys();
    }

    debug_keys() {

        //Screenshot
        if (this.newKeys.includes('F4')) {

            const canvasList = [this.canvas_world, this.canvas_entities, this.canvas_player];

            // Off-screen combined canvas
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = this.width;
            combinedCanvas.height = this.height;
            const ctx = combinedCanvas.getContext('2d');

            // Draw each canvas onto the combined canvas (in order: world → entities → player)
            for (const canvas of canvasList) {
                ctx.drawImage(canvas, 0, 0);
            }


            const fullQuality_URL = combinedCanvas.toDataURL("image/jpeg", 1.0);

            const link = document.createElement('a');
            link.href = fullQuality_URL;

            const getDownloadName = () => {
                const pad = (text) => {
                    const string = JSON.stringify(text);
                    return string.padStart(2,'0');
                }

                const now = new Date();

                const yyyy = now.getFullYear();
                const mm = pad(now.getMonth() + 1); // +1 due to 0 indexing
                const dd = pad(now.getDate());

                const hh = pad(now.getHours());
                const mm_ = pad(now.getMinutes());
                const ss = pad(now.getSeconds());

                return `fs_${yyyy}-${mm}-${dd}_${hh}-${mm_}_${ss}`;
            }

            link.download = getDownloadName();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    save_game() {
        if (this.slotLoaded == null || this.slotLoaded == 'default') return;

        this.status = 2;

        this.save_animation();

        setTimeout(() => {
            this.save();
            this.clear_save_animation();
        }, 50);
        
        this.status = 1;
    }

    save() {
        if (this.slotLoaded == null || this.slotLoaded == 'default') return;
        
        let data_world = {};

        this.level.clearNeighbourData();
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
            seed: this.level.generator.seed,
            tick: this.tick,
            time: this.level.time,
            level_properties: this.level.properties,
            level_size: this.level.level_size
        };

        const packagedData = this.compressString(JSON.stringify(data));

        localStorage.setItem(`slot_${this.slotLoaded}`, packagedData);
    }

    clear_save_animation() {
        this.ctx_menu2.clearRect(0, 0, this.width, this.height);
    }

    save_animation() {
        const width = 0.6 * this.width;
        const height = 0.6 * this.height;

        const rectX = (this.width - width) / 2;
        const rectY = (this.height - height) / 2;

        this.ctx_menu2.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx_menu2.fillRect(rectX, rectY, width, height);

        this.ctx_menu2.fillStyle = "#ffffff"; // White text
        this.ctx_menu2.font = "20px Arial"; // Set font size and style
        this.ctx_menu2.textAlign="center"; 
        this.ctx_menu2.textBaseline = "middle";
        
        this.ctx_menu2.fillText("Saving game...", rectX + (width / 2), rectY + (height / 2));
    }

    saveExists(slot) {
        return localStorage.getItem(`slot_${slot}`) !== null;
    }

    compressString(string) {
        if (!string) return;
        //return string;
        return LZString.compress(string);
    }

    decompressString(string) {
        if (!string) return;
        //return string;
        return LZString.decompress(string);
    }

    async loadGame(slot) {
        //FETCH DATA
        const gameData = localStorage.getItem(`slot_${slot}`);
        const unpackagedData = this.decompressString(gameData);

        let gameData_parsed;
        if (unpackagedData) {
            gameData_parsed = JSON.parse(unpackagedData);
            console.log(gameData_parsed);
        } else {
            console.log('No game data found.');
            return;
        }


        //LOAD
        this.slotLoaded = slot != undefined ? slot: 'default';

        function logPerformance(taskName, startTime, style = "color: black; font-weight: normal;") {
            const elapsedTime = (performance.now() - startTime).toFixed(1);
            console.log(`%c${taskName}: ${elapsedTime}ms`, style);
        }

        const startTime = performance.now();        
    
        //Load level
        const levelStart = performance.now();

        this.level.copy(gameData_parsed.data_world, gameData_parsed.entity, gameData_parsed.seed, gameData_parsed.level_properties);
        this.level.level_size = gameData_parsed.level_size;
        this.tick = gameData_parsed.tick;
        this.level.time = gameData_parsed.time;

        this.level.simulation_distance = gameData_parsed.level_properties.width_chunks;
        this.level.block_simulation_distance = 3;

        logPerformance("Level generated", levelStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        //Load player
        const playerStart = performance.now();
        this.player.copy(gameData_parsed.data_player.position, gameData_parsed.data_player.inventory);
        logPerformance("Player spawned", playerStart, "color: rgb(255, 220, 0); font-weight: bold;");
    
        //Load gameloop
        const gameLoopStart = performance.now();
        this.menu_handler.init();
        this.startGameLoop();
        logPerformance("Game loop started", gameLoopStart, "color:rgb(255, 220, 0); font-weight: bold;");
    
        logPerformance("Total init execution time", startTime, "color: orange; font-size: 16px; font-weight: bold;");
    }

    getSlotStatus(slot) {
        if (this.saveExists(slot)) {
            return 'filled';
        } else {
            return 'empty';
        }
    }

    getSlotData(slot, data) {
        const gameData = localStorage.getItem(`slot_${slot}`);
        const unpackagedData = this.decompressString(gameData);

        let gameData_parsed;
        if (unpackagedData) {
            gameData_parsed = JSON.parse(unpackagedData);
        } else {
            return null;
        }

        return gameData_parsed[data];
    }

    update_world() {
        // Logic that requires game ticks and world update logic
        this.level.run_gametick_logic(this.tick);

        this.level.world_interaction(); // for breaking and placing blocks
        this.entity_handler.run_gametick_logic(this.tick);
        this.player.run_gametick_logic(this.tick);

        if (this.tick % 6000 === 0) { //Save every 5 minutes (6000 ticks)
            this.save_game();
        }
        
        if (this.tick % 100 === 0) {
            this.run_diagnostics();
        }
    }

    async externalMenus() {
        if (this.status === 3 && !this.menu_renderers.death.isOpen) { //death
            this.menu_renderers.death.init();
        }
    }

    menus() {
        this.menu_handler.update(this.input.keys);

        this.externalMenus();
    }

    getDiagnosticsBySlot_storage(slot) {
        if (!this.saveExists(slot)) return;

        const dataQuota = 5242880;

        const key = `slot_${slot}`;
        const gameData = localStorage.getItem(key);
        const dataSize = (gameData.length + key.length);
        
        const percentage = (dataSize / dataQuota * 100).toFixed(2);

        return {size: dataSize, quota: dataQuota, percentage: percentage};
    }

    getDiagnostics_storage() {
        const dataQuota = 5242880;
        let dataSize = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                dataSize += (localStorage[key].length + key.length);
            }
        }
        
        const percentage = (dataSize / dataQuota * 100).toFixed(2);

        return {size: dataSize, quota: dataQuota, percentage: percentage};
    }

    run_diagnostics() {
        const storage_data = this.getDiagnostics_storage();
        const dataSize = storage_data.size;
        const dataQuota = storage_data.quota;
        const percentage = storage_data.percentage;

        console.log(`FPS: ${this.fps}, TPS: ${this.tps}, Storage: ${dataSize.toLocaleString("en-US")} / ${dataQuota.toLocaleString("en-US")} bytes - ${percentage}%`);
    }

    renderDiagnostics() {
        if (this.debugger.settings.performance) {
            const data = [
                `FPS: ${this.performanceData_display.fps}`,
                `TPS: ${this.performanceData_display.tps}`
            ];

            const margin = 20;

            const fontSize = 12;
            const lineSpacing = 4;

            this.ctx_menu.fillStyle = 'black';
            this.ctx_menu.font = `${fontSize}px Times New Roman`;

            for (let i = 0; i < data.length; i++) {
                const datom = data[i];
                this.ctx_menu.fillText(datom, margin, margin + i * (fontSize + lineSpacing));
            }
        }
    }

    startGameLoop() {
        let lastTick;
        const tick_handler = () => {
            if (this.status === 0) return; //if unloaded
            if (this.status === 1) {
                const time_current = performance.now();

                let tickTime;
                if (lastTick) {
                    tickTime = time_current - lastTick; // In ms
                } else {
                    tickTime = 0;
                }

                if (this.tick % 10 === 0) {
                    this.performanceData_display = {
                        fps: this.fps,
                        tps: this.tps
                    };
                }

                this.update_world();

                this.tick++;
                this.tps = Math.round(1000 / tickTime);

                lastTick = time_current;
            }

            setTimeout(tick_handler, 1000 / this.tps_target);
        };

        let lastFrame;
        const game_loop = () => {
            if (this.status === 0) return; //if unloaded


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
            this.renderDiagnostics();

            lastFrame = time_current;

            requestAnimationFrame(game_loop);
        };

        tick_handler();
        game_loop();
    }
}

export { Game }