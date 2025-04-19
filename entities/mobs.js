import { Entity_creature } from "./entity.js";

class Mob extends Entity_creature {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, mobType, texture_location) {
        const vel = {
            h_maxVel: 1,
            h_minVel: -1,

            h_maxVel_default: 1,
            h_minVel_default: -1,
            h_maxVel_sprint: 1,
            h_minVel_sprint: -1,

            v_maxVel: 7.5,
            v_minVel: -20
        };
        
        super(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, vel, texture_location);
        
        this.entityType = 'mob';

        this.mobID = mobID
        this.mobType = mobType; //Passive or hostile

        this.goal = {x: null, y: null};

        this.nextSetGoal = null; // Next time a goal is set (in ticks)
    }

    run_gametick_logic(tick) {
        super.run_gametick_logic(tick);

        if (this.nextSetGoal == null) {
            this.nextSetGoal = tick + Math.round(Math.random() * 120);
        }

        //Walk to goal
        let keys = []; 

        if (this.x < this.goal.x - 1) {
            keys.push('ArrowRight');
            if (this.game.calculator.isSolidBlock(Math.floor(this.x + this.width_blocks + 1), Math.floor(this.y))) {
                keys.push('ArrowUp');
            }
        } else if (this.x > this.goal.x + 1) {
            keys.push('ArrowLeft');
            if (this.game.calculator.isSolidBlock(Math.floor(this.x - 1), Math.floor(this.y))) {
                keys.push('ArrowUp');
            }
        }
        
        this.key_input = keys;
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

}

class Mob_hostile extends Mob {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, texture_location) {
        super(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, 'hostile', texture_location);
        
        this.view_distance = 8; //Distance from which a mob can see the player - in both directions
        this.reach = 1; // Distance from which a mob can hit the player

        this.damage = 3;

        this.maxHitCooldown = 15;
        this.hitCooldown = 0;
    }

    getPlayerDistance() { //Manhattan distance 
        const playerX = this.game.player.x;
        const playerY = this.game.player.y;

        const distance = Math.abs(playerX - this.x) + Math.abs(playerY - this.y);

        return distance;
    }

    setNewGoal() {
        if (this.getPlayerDistance() <= this.view_distance) {
            this.goal = {
                x: this.game.player.x,
                y: this.game.player.y
            };

        } else {
            const goalX_offsetABS = Math.random() * 10 + 5; //Absolute value
            const goalX_offset = this.game.calculator.randomBool(50) ? goalX_offsetABS: goalX_offsetABS * - 1;
    
            this.goal = {
                x: this.x + goalX_offset,
                y: null
            };
        }
        
    }

    canHitPlayer() {
        if (this.hitCooldown === 0) {
            return true;
        }

        return false;
    }

    attempt_hitPlayer() {
        if (!this.canHitPlayer()) return;

        this.hitCooldown = this.maxHitCooldown;
        this.hitPlayer();
    }

    hitPlayer() {
        const playerX_mid = this.game.player.x + this.game.player.width_blocks / 2;
        
        this.game.player.v_vel = 2;
        if (this.x <= playerX_mid) { //if mob hits player from left
            this.game.player.h_vel = 4;
        } else {
            this.game.player.h_vel = -4;
        }
        
        this.game.player.applyDamage(this.damage);
    }


    run_gametick_logic(tick) {
        super.run_gametick_logic(tick);
        
        if (this.hitCooldown > 0) {
            this.hitCooldown--;
        }

        if (tick === this.nextSetGoal) {
            this.setNewGoal();

            if (this.getPlayerDistance() <= this.view_distance) {
                this.nextSetGoal = tick + 5 + Math.round(Math.random() * 40);
            } else {
                this.nextSetGoal = tick + 40 + Math.round(Math.random() * 160);
            }
        }

        if (this.getPlayerDistance() <= this.reach) {
            this.attempt_hitPlayer();
        }
    }

}

class Mob_Zombie extends Mob_hostile {
    constructor(game, entityID, x, y) {
        super(game, entityID, x, y, 14/16, 30/16, 10, 10, 32, './assets/mobs/zombie/zombie.png');
        
        this.mob_name = 'zombie';
    }
}

class Mob_passive extends Mob {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, texture_location) {
        super(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, mobID, 'passive', texture_location);
        
    }

    setNewGoal() {
        const goalX_offsetABS = Math.random() * 10 + 5; //Absolute value
        const goalX_offset = this.game.calculator.randomBool(50) ? goalX_offsetABS: goalX_offsetABS * - 1;

        this.goal = {
            x: this.x + goalX_offset,
            y: null
        };
    }

    run_gametick_logic(tick) {
        super.run_gametick_logic(tick);

        if (tick === this.nextSetGoal) {
            this.setNewGoal();

            this.nextSetGoal = tick + 40 + Math.round(Math.random() * 160);
        }
    }
}

class Mob_Pig extends Mob_passive {
    constructor(game, entityID, x, y) {
        super(game, entityID, x, y, 24/16, 18/16, 10, 10, 0, './assets/mobs/pig/pig.png');
        
        this.mob_name = 'pig';
    }
}

class Mob_Directory {
    constructor() {
        this.mob = { //All mob classes via IDs
            '0': Mob_Pig,

            '32': Mob_Zombie
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

        this.minHostileMobLightLevel = 5;
        this.hostileMobSpawnChance = 0.008; // percent chance per tick

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

    spawnRandomHostileMob(x, y) {
        this.entity_handler.newMob(32, x, y);
    }
}

export { MobHandler };