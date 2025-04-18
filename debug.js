class Debugger {
    constructor(game) {
        this.game = game;

        
        if (this.getSettings()) {
            this.settings = this.getSettings();
            this.applySettings();
        } else {
            this.clearSettings();
        }
    }

    clearSettings() {
        this.settings = { //if null, default.
            blockview: null,
            fly: null,
            fast: null,
            physics: null,
            lighting: null,
            xray: null,
            img_smoothing: null
        };

        this.applySettings();
        this.saveSettings();
    }

    getSettings() {
        const settings = localStorage.getItem(`flatblock_settings`);

        let settings_parsed;
        if (settings) {
            settings_parsed = JSON.parse(settings);
            return settings_parsed;
        } else {
            console.log('No settings data found.');
            return;
        }
    }

    saveSettings() {
        const packagedData = JSON.stringify(this.settings);

        localStorage.setItem(`flatblock_settings`, packagedData);
    }

    applySettings() {
        //Blockview
        const blockview = this.settings.blockview;
        if (blockview !== null) {
            this.game.updateViewSize(blockview, blockview);
        }

        //Fly
        if (this.settings.fly !== null) {
            this.game.player.hover = this.settings.fly;
        }

        //Fast
        if (this.settings.fast !== null) {
            this.game.player.fast = this.settings.fast;
        }

        //Physics
        if (this.settings.physics !== null) {
            this.game.player.physics = this.settings.physics;
        }

        //Lighting
        if (this.settings.lighting !== null) {
            this.game.player.lighting = this.settings.lighting;
        }

        //X-ray
        if (this.settings.xray !== null) {
            this.game.player.xray = this.settings.xray;
        }

        //Image smoothing (anti-aliasing)
        if (this.settings.img_smoothing !== null) {
            this.game.setImgSmoothing(this.settings.img_smoothing);
        }
    }

    commandInput() {
        let command_input = prompt(`Type: "help" for a list of commands.`);
        
        if (!command_input) return;

        command_input = command_input.split(' ', 2);        
        const arg1 = command_input[0];
        const arg2 = command_input[1];

        switch (arg1) {
            case 'help':
                window.location = './debug_help.html';
                break;
            case 'blockview':
                if (arg2 >= 5 && arg2 <= 450) {
                    this.settings.blockview = Number(arg2);
                } else {
                    alert('blockview_w - Input a value between 5 and 450, inclusive.');
                }
                break;
            case 'fly':
                if (arg2 === 'true' || arg2 === 'false') {
                    this.settings.fly = arg2 === 'true';
                } else {
                    alert('fly - Input a boolean.');
                }
                break;
            case 'fast':
                if (arg2 === 'true' || arg2 === 'false') {
                    if (!this.settings.fly) {
                        alert('fast true requires fly true.');
                        break;
                    }
                    this.settings.fast = arg2 === 'true';
                } else {
                    alert('fast - Input a boolean.');
                }
                break;
            case 'physics':
                if (arg2 === 'true' || arg2 === 'false') {
                    if (!this.settings.fly) {
                        alert('physics false requires fly true.');
                        break;
                    }
                    this.settings.physics = arg2 === 'true';
                } else {
                    alert('physics - Input a boolean.');
                }
                break;
            case 'lighting':
                if (arg2 === 'true' || arg2 === 'false') {
                    this.settings.lighting = arg2 === 'true';
                } else {
                    alert('lighting - Input a boolean.');
                }
                break;
            case 'xray':
                if (arg2 === 'true' || arg2 === 'false') {
                    this.settings.xray = arg2 === 'true';
                } else {
                    alert('xray - Input a boolean.');
                }
                break;
            case 'img_smoothing':
                if (arg2 === 'true' || arg2 === 'false') {
                    this.settings.img_smoothing = arg2 === 'true';
                } else {
                    alert('img_smoothing - Input a boolean.');
                }
                break;
        }

        this.saveSettings();
        this.applySettings();
    }


}


export { Debugger };