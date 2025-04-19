import { MobHandler } from './mobs.js';
import { Entity_item } from './entity_items.js';

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

        this.chunkMobLimit = 5;

        this.mob_handler = new MobHandler(this);
    }

    copy(data) { //from saved data
        for (let i = 0; i < data.length; i++) {
            const entity = data[i];
            const entity_data = {
                itemID: entity.itemID,
                mobID: entity.mobID,
                health: entity.health,
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

            if (entity_data.entityType === 'mob') {
                this.newMob(entity_data.mobID, entity_data.x, entity_data.y, entity_data.health);
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

    newMob(mobID, x, y, health) {
        const MobClass = this.mob_handler.mob_directory.mob[mobID];
        const entity = new MobClass(this.game, this.nextEntityID, x, y);
        if (health) {
            entity.health = health;
        }
        
        this.nextEntityID++;
        this.level_data[this.calc.getChunkID(x)].entity_data.push(entity);
    }

    getMobAt(x, y) {
        const chunk_entityData = this.level_data[this.calc.getChunkID(x)].entity_data;

        for (let i = 0; i < chunk_entityData.length; i++) {
            const entity = chunk_entityData[i];

            const minX = entity.x;
            const maxX = entity.x + entity.width_blocks;

            const minY = entity.y;
            const maxY = entity.y + entity.height_blocks;

            if (
                (x >= minX && x <= maxX) &&
                (y >= minY && y <= maxY) &&
                entity.entityType === 'mob'
            ) {
                return entity;
            }
        }

        return null;
    }

    isMobAt(x, y) {
        if (this.getMobAt(x, y)) return true;
        return false;
    }

    spawnRandomPassiveMob(x, y) {
        this.mob_handler.spawnRandomPassiveMob(x, y);
    }

    spawnRandomHostileMob(x, y) {
        const chunkID = this.calc.getChunkID(x);
        if (!this.isWithinChunkMobLimit(chunkID)) return;

        this.mob_handler.spawnRandomHostileMob(x, y);
    }

    isWithinChunkMobLimit(chunckID) {
        let mobCount = 0;

        this.game.level.data[chunckID].entity_data.forEach(entity => {
            if (entity.entityType === 'mob') {
                mobCount++;
            }    
        });

        if (mobCount >= this.chunkMobLimit) {
            return false;
        }

        return true;
    }

    update(deltaTime) {
        const loaded_chunks = this.calc.getLoadedChunks();

        for (let i = 0; i < loaded_chunks.length; i++) {
            const currentChunkID = loaded_chunks[i];

            for (let j = 0; j < this.game.level.data[currentChunkID].entity_data.length; j++) {
                const entity = this.game.level.data[currentChunkID].entity_data[j];
                
                entity.update(entity.key_input, deltaTime);
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
                    mobID: entity.mobID,
                    health: entity.health,
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

        const chunk_min = this.calc.getWorldBounds()[0];
        const chunk_max = this.calc.getWorldBounds()[1];        
        for (let i = chunk_min; i <= chunk_max; i++) {
            for (let j = 0; j < this.game.level.data[i].entity_data.length; j++) {                
                const entity = this.game.level.data[i].entity_data[j];         
                entity.run_gametick_logic(tick);

                //Delete item if 'inactive'
                if (!entity.active) {
                    this.game.level.data[i].entity_data.splice(j, 1);
                }
            }
        }

        //Save
        if (tick % 20 === 0) {
            this.saveEntityData();
        }

        this.mob_handler.run_gametick_logic(tick);

        //Fix entity data
        for (let i = chunk_min; i <= chunk_max; i++) {
            for (let j = 0; j < this.game.level.data[i].entity_data.length; j++) {
                const entity = this.game.level.data[i].entity_data[j];
                
                const entity_chunk = this.calc.getChunkID(entity.x);
                if (i !== entity_chunk) {
                    this.game.level.data[entity_chunk].entity_data.push(entity);
                    this.game.level.data[i].entity_data.splice(j, 1);
                }
            }

        }
    }
}

export { EntityHandler };