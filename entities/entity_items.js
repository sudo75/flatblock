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
    }

    update(input, deltaTime) {
        super.update(input, deltaTime);
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
                }
                
            }
        }
        
    }
}

export {Entity_item};