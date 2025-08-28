import { Entity } from "./entity.js";

class Entity_item extends Entity {
    constructor(game, entityID, x, y, itemID, spawnTick, dimensions, durability) {
        super(game, entityID, x, y, 0.5, 0.5, false);
        this.width_blocks = dimensions.width; // in unit blocks
        this.height_blocks = dimensions.height; // in unit blocks
        this.durability = durability;

        this.width = this.game.block_size * this.width_blocks;
        this.height = this.game.block_size * this.height_blocks;
        
        this.itemID = itemID;

        this.item_directory = this.game.item_directory;
        this.texture_location = this.item_directory.getTextureLocationByID(this.itemID);

        this.spawnTick = spawnTick;
        this.pickup_grace = 20; //ticks
        this.player_maxReach = 1.05;

        this.entityType = 'item';
        this.key_input = [];

        this.yOffset = 0;
        this.boundToBlock = false;
    }

    update(input, deltaTime) {

        if (this.isOnSolidBlock()) {
            this.boundToBlock = true;
        }

        if (this.isAboveSolidBlock() && this.boundToBlock) {
            // Compute bobbing
            const unix_time_ms = Date.now();
            const period = 1000;
            const amp = 0.1;

            const yMovement = amp * Math.sin(((2 * Math.PI * unix_time_ms) / period)) + amp;

            this.y += (yMovement - this.yOffset);
            this.yOffset = yMovement;
        } else {
            super.update(input, deltaTime);
            this.boundToBlock = false;
        }
    }

    isAboveSolidBlock() { // solid block below, but not necessarily touching the item
        if (this.y - 1 >= 0) {
            for (let x = Math.floor(this.x); x <= this.calc.hardRoundDown(this.x + this.width_blocks); x++) {
                if ((this.calc.isSolidBlock(x, Math.floor(this.y) - 1) && this.calc.hasPhysics(x, Math.floor(this.y) - 1))) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    run_gametick_logic(tick) {
        // Calculate player pick-up
        const playerPos_adjusted = {
            x: this.game.player.x + this.game.player.width_blocks / 2,
            y: this.game.player.y + this.game.player.height_blocks / 2
        }

        const entityPos_adjusted = {
            x: this.x + this.width_blocks / 2,
            y: this.y + this.height_blocks / 2,
        }

        //Pickup items
        if (tick - this.spawnTick >= this.pickup_grace) { // Calculate pickup grace
            if (this.calc.getBlockDistance(playerPos_adjusted.x, playerPos_adjusted.y, entityPos_adjusted.x, entityPos_adjusted.y) <= this.player_maxReach) {
                
                if (this.game.player.inventory.canAddItem(this.itemID)) { //If can be picked up
                    this.game.player.inventory.addItems(this.itemID, this.durability);
                    this.active = false;
                    
                    // Play sound
                    const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/') + 'assets/sounds/';
                    const pop_sound = new Audio(`${basePath}/pop.wav`);
                    pop_sound.volume = 0.15;
                    pop_sound.play();
                }
                
            }
        }
        
    }
}

export {Entity_item};