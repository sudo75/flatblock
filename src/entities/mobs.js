import { Entity_creature } from "./entity.js";

class Mob extends Entity_creature {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, mobType) {
        super(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth);
        
        this.entityType = 'mob';

        this.mobID = mobID
        this.mobType = mobType; //Passive or hostile
    }

    hit() {
        const playerX_mid = this.game.player.x + this.game.player.width_blocks / 2;
        
        this.v_vel = 2;
        if (playerX_mid <= this.x) { //if player hits mob from left
            this.h_vel = 4;
        } else {
            this.h_vel = -4;
        }
        

        //Calculate damage
        const selectedSlot = this.game.player.inventory.selectedSlot;
        const seletedItemID = this.game.player.inventory.data[selectedSlot].id;

        const damage = this.game.item_directory.getProperty(seletedItemID, 'damage') ? this.game.item_directory.getProperty(seletedItemID, 'damage'): this.game.player.damage;

        this.applyDamage(damage);

        //Decrement tool durability
        const selectedItemType = this.game.item_directory.getProperty(seletedItemID, 'item_type');
        if (selectedItemType === 'tool') {
            this.game.player.inventory.decrementDurability(selectedSlot);
        }
    }

    run_gametick_logic(tick) {

    }
}

class Mob_passive extends Mob {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID) {
        super(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, 'passive');
        
    }
}

class Mob_Pig extends Mob_passive {
    constructor(game, entityID, x, y) {
        super(game, entityID, x, y, 0.8, 0.6, 10, 10, 0);
        
        this.mob_name = 'pig';
    }
}

class Mob_Directory {
    constructor() {
        this.mob = { //All mob classes via IDs
            '0': Mob_Pig
        }
    }

    getProperty(id, property) {
        if (!this.mob[id]) return;

        const mobClass = this.mob[id];
        const mobInstance = new mobClass;

        return mobInstance[property];
    }

    getTextureLocationByID(id) {

        return this.getProperty(id, 'texture_location');
    }
}

class MobHandler {
    constructor(entity_handler) {
        this.entity_handler = entity_handler;

        this.mob_directory = new Mob_Directory();

    }

    run_gametick_logic(tick) {

        //PLAYER HIT
        const playerCursorLocation = this.entity_handler.calc.getBlockByRealXY_unrounded(this.entity_handler.game.input.mouse_realXY.x, this.entity_handler.game.input.mouse_realXY.y); // in blocks (not rounded)

        this.current_breaking = {
            x: this.entity_handler.game.player.selectedBlock.x,
            y: this.entity_handler.game.player.selectedBlock.y
        };

        if (this.entity_handler.game.input.mouseDown && this.entity_handler.game.player.getBlockDistance(this.current_breaking.x + 0.5, this.current_breaking.y + 0.5) <= this.entity_handler.game.player.cursorDistLim && this.entity_handler.game.entity_handler.isMobAt(playerCursorLocation.x, playerCursorLocation.y)) {
            const mob = this.entity_handler.getMobAt(playerCursorLocation.x, playerCursorLocation.y);

            this.entity_handler.game.player.hitMob(mob);
        }
    }

    spawnRandomPassiveMob(x, y) {
        this.entity_handler.newMob(0, x, y);
    }
}

export { MobHandler };