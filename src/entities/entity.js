class Entity { //ONLY DEALS WITH PHYSICS AND LOGIC - rendering is done seperately
    constructor(game, entityID, x, y, width, height, width_blocks, height_blocks) {
        this.game = game;
        this.ctx = this.game.ctx_entities;
        this.width = width;
        this.height = height;
        this.width_blocks = width_blocks;
        this.height_blocks = height_blocks;
        this.calc = this.game.calculator;
        this.id = entityID;

        this.direction = 'right'; //facing direction

        this.x = x; // x = 0 at left
        this.y = y; // y = 0 at bottom

        this.gravity_acceleration = -24; //earth = -9.8, default = 24

        this.h_maxVel = 3; // blocks per second
        this.h_minVel = -3;
        this.v_maxVel = 10;
        this.v_minVel = -20;

        this.h_vel = 0; // horizontal velocity
        this.v_vel = 0; // vertical velocity

        this.hover = false;
        this.fast = false;

        this.active = true; //Determines whether or not the entity handler will delete it next check
    }

    jump() {
        this.v_vel = this.v_maxVel;
    }

    isOnSolidBlock() {
        if (this.y % 1 == 0 && this.y - 1 >= 0) {
            if (
                (this.calc.isSolidBlock(Math.floor(this.x), this.y - 1) && this.calc.hasPhysics(Math.floor(this.x), this.y - 1)) ||
                (this.calc.isSolidBlock(this.calc.hardRoundDown(this.x + this.width_blocks), this.y - 1) && this.calc.hasPhysics(this.calc.hardRoundDown(this.x + this.width_blocks), this.y - 1))
            ) {
                return true;
            }
            return false;
        }
        return false;
    }

    isInSolidBlock() {
        if (this.y >= 0) {
            if (
                (this.calc.isSolidBlock(Math.floor(this.x), Math.floor(this.y)) && this.calc.hasPhysics(Math.floor(this.x), Math.floor(this.y))) ||
                (this.calc.isSolidBlock(this.calc.hardRoundDown(this.x + this.width_blocks), Math.floor(this.y)) && this.calc.hasPhysics(this.calc.hardRoundDown(this.x + this.width_blocks), Math.floor(this.y)))
            ) {
                return true;
            }
            return false;
        }
        return false;
    }

    isSolidBlockAdjacent(direction) {
        const minX = this.game.player.x;
        const minY = this.game.player.y;
        const maxX = this.game.player.x + this.game.player.width_blocks;
        const maxY = this.game.player.y + this.game.player.height_blocks;

        for (let y = Math.floor(minY); y <= Math.floor(maxY); y++) {
            if (direction === 'left') {
                if (this.calc.isSolidBlock(this.calc.hardRoundDown(minX), y) && this.calc.hasPhysics(this.calc.hardRoundDown(minX), y)) {
                    return true;
                }
            } else if (direction === 'right') {
                if (this.calc.isSolidBlock(Math.floor(maxX), y) && this.calc.hasPhysics(Math.floor(maxX), y)) {
                    return true;
                }
            }
        }
        return false;
    }

    isSolidBlockAbove() { // Directly above - no space between
        if ((this.y + this.height_blocks) % 1 === 0) {
            if (
                (this.calc.isSolidBlock(Math.floor(this.x), this.y + this.height_blocks) && this.calc.hasPhysics(Math.floor(this.x), this.y + this.height_blocks)) ||
                (this.calc.isSolidBlock(Math.floor(this.x + this.width_blocks), this.y + this.height_blocks) && this.calc.hasPhysics(Math.floor(this.x + this.width_blocks), this.y + this.height_blocks))
            ) {
                return true;
            }
        }
        return false;
    }

    willCollide(x, y, minX_, minY_, maxX_, maxY_) { // Input position to test

        const minX = minX_ ? minX_: Math.floor(x); // minX of entity
        const minY = minY_ ? minY_: Math.floor(y);
        const maxX = maxX_ ? maxX_: this.calc.hardRoundDown(x + this.width_blocks);
        const maxY = maxY_ ? maxY_: this.calc.hardRoundDown(y + this.height_blocks);

        for (let i = minX; i <= maxX; i++) {
            for (let j = minY; j <= maxY; j++) {
                if (!this.calc.isWithinWorldBounds(i, j)) continue;
                if (this.calc.isSolidBlock(i, j) && this.calc.hasPhysics(i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    update(input, deltaTime) {
        //set direction
        if (input.includes('ArrowLeft')) {
            this.direction = 'left';
        }
        if (input.includes('ArrowRight')) {
            this.direction = 'right';
        }


        if (isNaN(this.x) || isNaN(this.y)) return;

        if (deltaTime > 0.05) {
            deltaTime = 0.05;
        }

        if (input.includes('Shift')) {
            this.h_maxVel = 5;
            this.h_minVel = -5;
        } else {
            this.h_maxVel = 3;
            this.h_minVel = -3;
        }

        //Hover Mode
        if (this.hover) {
            this.h_vel = 0;
            this.v_vel = 0;

            const speed = this.fast ? 32: 12;
            if (input.includes('ArrowLeft')) {
                this.h_vel = -speed;
            }
            if (input.includes('ArrowRight')) {
                this.h_vel = speed;
            }
    
            if (input.includes('ArrowUp')) {
                this.v_vel = speed;
            }
            if (input.includes('ArrowDown')) {
                this.v_vel = -speed;
            }
            this.updatePos(deltaTime);
            return;
        }

        //Standard Mode

        //Physics
        if (!this.isOnSolidBlock()) {
            this.v_vel += this.gravity_acceleration * deltaTime;
        }

        //Set velocities
        if (input.includes('ArrowLeft') && !this.isSolidBlockAdjacent('left')) {
            if (this.isOnSolidBlock()) {
                this.h_vel = this.h_minVel;
            } else {
                if (this.h_vel > this.h_minVel * 0.8) { // Max velocity when starting from 0 in air is 80% of that on ground
                    this.h_vel = this.h_minVel * 0.8;
                }
            }
        }
        if (input.includes('ArrowRight') && !this.isSolidBlockAdjacent('right')) {
            if (this.isOnSolidBlock()) {
                this.h_vel = this.h_maxVel;
            } else {
                if (this.h_vel < this.h_maxVel * 0.8) {
                    this.h_vel = this.h_maxVel * 0.8;
                }
            }
        }

        if (input.includes('ArrowUp')) {
            if (this.isOnSolidBlock() && !this.isSolidBlockAbove()) {
                this.jump();
            }
        }
        if (input.includes('ArrowDown')) {
            //this.v_vel = this.v_minVel;
        }


        //Induce horizontal glide
        if (!input.includes('ArrowLeft') && !input.includes('ArrowRight') && this.h_vel !== 0) {
            if (this.isOnSolidBlock()) {
                const h_vel_change = (this.h_vel * 15) * deltaTime; //h_vel * resistance * delta_time
                this.h_vel -= h_vel_change;
                if (Math.abs(this.h_vel) < 0.05) {
                    this.h_vel = 0;
                }
            } else {
                const h_vel_change = (this.h_vel * 2) * deltaTime; //h_vel * resistance * delta_time
                this.h_vel -= h_vel_change;
                if (Math.abs(this.h_vel) < 0.05) {
                    this.h_vel = 0;
                }
            }
        }
        

        //Ensure velocity limits
        if (this.h_vel > this.h_maxVel) {
            this.h_vel = this.h_maxVel;
        }
        if (this.v_vel > this.v_maxVel) {
            this.v_vel = this.v_maxVel;
        }
        if (this.h_vel < this.h_minVel) {
            this.h_vel = this.h_minVel;
        }
        if (this.v_vel < this.v_minVel) {
            this.v_vel = this.v_minVel;
        }        

        //Calculate possible position
        const possibleX = this.x + this.h_vel * deltaTime;
        const possibleY = this.y + this.v_vel * deltaTime;

        //Ensure world bound compliance
        if (possibleY < 0 || possibleY + this.height_blocks > this.game.level.properties.height_blocks) {
            this.v_vel = 0;
        }
        if (possibleX < this.calc.getWorldBorders().minX || Math.ceil(possibleX + this.width_blocks) > this.calc.getWorldBorders().maxX + 1) {
            this.h_vel = 0;
        }

        //Ensure block compliance - no phasing through blocks
        if (
            this.willCollide(possibleX, possibleY)
        ) {
            //Use last pos to decide where to send entity
            let crossedOverX_left = (this.x + this.width_blocks <= Math.floor(possibleX + this.width_blocks) && possibleX + this.width_blocks > Math.floor(possibleX + this.width_blocks));
            let crossedOverX_right = (possibleX < Math.ceil(possibleX) && this.x >= Math.ceil(possibleX));
            let crossedOverY_bottom = (this.y + this.height_blocks <= Math.floor(possibleY + this.height_blocks) && possibleY + this.height_blocks > Math.floor(possibleY + this.height_blocks));
            let crossedOverY_top = (possibleY < Math.ceil(possibleY) && this.y >= Math.ceil(possibleY));

            if (crossedOverY_top) {
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX), Math.floor(possibleY), this.calc.hardRoundDown(possibleX + this.width_blocks), Math.floor(possibleY))) {
                    if (this.v_vel < 0) {
                        this.v_vel = 0;
                    }
                    this.y = Math.ceil(possibleY);
                }
                
            } else 
            if (crossedOverY_bottom) {
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX), this.calc.hardRoundDown(possibleY + this.height_blocks), this.calc.hardRoundDown(possibleX + this.width_blocks), this.calc.hardRoundDown(possibleY + this.height_blocks))) {
                    this.v_vel = 0;
                    this.y = Math.floor(possibleY) + (Math.ceil(this.height_blocks) - this.height_blocks);
                }
            }

            if (crossedOverX_left) {
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX + this.width_blocks), Math.floor(possibleY), Math.floor(possibleX + this.width_blocks), this.calc.hardRoundDown(possibleY + this.height_blocks))) {
                    this.h_vel = 0;
                    this.x = Math.ceil(possibleX) - this.width_blocks;
                }
                
            } else if (crossedOverX_right) {
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX), Math.floor(possibleY), Math.floor(possibleX), this.calc.hardRoundDown(possibleY + this.height_blocks))) {
                    this.h_vel = 0;
                    this.x = Math.ceil(possibleX);
                }
                
            }   
        }

        //Set entity position
        this.updatePos(deltaTime);
    }

    updatePos(deltaTime) {
        this.x += this.h_vel * deltaTime;
        this.y += this.v_vel * deltaTime;


        if (this.isInSolidBlock()) {
            this.punt();
        }
    }

    punt() {
        this.y++;
    }
}

export { Entity };

import { Item_Directory } from '../generation/blocks.js';
class Entity_item extends Entity {
    constructor(game, entityID, x, y, itemID, spawnTick, dimensions, durability) {
        super(game, entityID, x, y, 0.5, 0.5);
        this.width_blocks = dimensions.width; // in unit blocks
        this.height_blocks = dimensions.height; // in unit blocks
        this.durability = durability;

        this.width = this.game.block_size * this.width_blocks;
        this.height = this.game.block_size * this.height_blocks;
        
        this.itemID = itemID;

        this.item_directory = this.game.item_directory;
        this.texture_location = this.item_directory.getTextureLocationByID(this.itemID);

        this.spawnTick = spawnTick;
        this.pickup_grace = 40; //ticks
        this.player_maxReach = 1.05;

        this.entityType = 'item';
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

class EntityHandler {
    constructor(game) {
        this.game = game;
        this.calc = this.game.calculator;

        this.level_data = this.game.level.data;
        this.entity_data = []; //formatted for local storage saving

        this.nextEntityID = 1;
        this.entity_item_dimensions = {
            width: 0.5,
            height: 0.5
        };
    }

    copy(data) { //from saved data
        for (let i = 0; i < data.length; i++) {
            const entity = data[i];
            const entity_data = {
                itemID: entity.itemID,
                x: entity.x,
                y: entity.y,
                width: entity.width,
                height: entity.height,
                h_vel: entity.h_vel,
                v_vel: entity.v_vel,
                entityType: entity.entityType,
                durability: entity.durability
            };

            if (entity_data.entityType === 'item') {
                this.newEntity_Item(entity_data.x, entity_data.y, entity_data.itemID, entity_data.h_vel, entity_data.v_vel, entity_data.durability);
            }
        }
    }

    newEntity_Item(x, y, itemID, h_vel, v_vel, durability) {
        const spawnTick = this.game.tick;
        const entity = new Entity_item(this.game, this.nextEntityID, x, y, itemID, spawnTick, this.entity_item_dimensions, durability);
        entity.h_vel = h_vel;
        entity.v_vel = v_vel;
        
        this.nextEntityID++;

        this.level_data[this.calc.getChunkID(x)].entity_data.push(entity);
    }

    update(deltaTime) {
        const loaded_chunks = this.calc.getLoadedChunks();

        for (let i = 0; i < loaded_chunks.length; i++) {
            const currentChunkID = loaded_chunks[i];

            for (let j = 0; j < this.game.level.data[currentChunkID].entity_data.length; j++) {
                const entity = this.game.level.data[currentChunkID].entity_data[j];
                
                entity.update([], deltaTime);
            }

        }
    }

    saveEntityData() {
        let data = [];
        const minChunk = this.calc.getChunkID(this.calc.getWorldBorders().minX);
        const maxChunk = this.calc.getChunkID(this.calc.getWorldBorders().maxX);
        for (let i = minChunk; i < maxChunk; i++) {
            for (let j = 0; j < this.game.level.data[i].entity_data.length; j++) {
                const entity = this.game.level.data[i].entity_data[j];
                
                const entity_data = {
                    itemID: entity.itemID,
                    x: entity.x,
                    y: entity.y,
                    width: entity.width,
                    height: entity.height,
                    h_vel: entity.h_vel,
                    v_vel: entity.v_vel,
                    entityType: entity.entityType,
                    durability: entity.durability
                };
                data.push(entity_data);
            }
        }
        
        this.entity_data = data;
    }

    run_gametick_logic(tick) {
        const loaded_chunks = this.calc.getLoadedChunks();

        for (let i = 0; i < loaded_chunks.length; i++) {
            const currentChunkID = loaded_chunks[i];

            for (let j = 0; j < this.game.level.data[currentChunkID].entity_data.length; j++) {
                const entity = this.game.level.data[currentChunkID].entity_data[j];                
                entity.run_gametick_logic(tick);

                //Delete item if 'unactive'
                if (!entity.active) {
                    this.game.level.data[currentChunkID].entity_data.splice(j, 1);
                }
            }
        }

        //Save
        if (tick % 20 === 0) {
            this.saveEntityData();
        }
    }
}

export { EntityHandler };