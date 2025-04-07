class Debugger {
    constructor(game) {
        this.game = game;
    }

    commandInput() {
        const command_input = prompt(`Type: "help" for a list of commands.`);
        

        switch (command_input) {
            case 'help':
                window.location = './debug_help.html';
                break;
        }
    }
}


export { Debugger };