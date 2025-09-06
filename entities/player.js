import { Entity_creature } from './entity.js';
import { Inventory } from './inventory.js';

class Player extends Entity_creature {
    constructor(game) {
        const vel = {
            h_maxVel: 3,
            h_minVel: -3,

            h_maxVel_default: 3,
            h_minVel_default: -3,
            h_maxVel_sprint: 5,
            h_minVel_sprint: -5,

            v_maxVel: 10,
            v_minVel: -20
        };

        const width_blocks = 14/16; // in unit blocks
        const height_blocks = 30/16; // in unit blocks

        const health = 20;
        const maxHealth = 20;

        super(game, 0, null, null, width_blocks, height_blocks, health, maxHealth, vel, null, true);
        
        this.game = game;
        this.ctx = this.game.ctx_player;
        this.calc = this.game.calculator;

        this.selectedBlock = {};
        this.cursorDistLim = 4;

        this.inventory = new Inventory();

        this.strength = 1; //block-breaking strength
        this.damage = 1;

        this.maxHitCooldown = 15;
        this.hitCooldown = 0; //in ticks

        this.mouseDownOnPreviousTick = false;

        this.skinCache = [];

        this.consumption_cooldown = 0;

        this.debug_inventory = false;

        this.armour = 0;
        this.maxArmour = 20;

        this.spawnPoint = {x: null, y: null}
    }

    spawn() {
        this.health = this.maxHealth;

        this.real_x = this.game.width / 2 - this.width / 2;
        this.real_y = this.game.height / 2;

        this.x = 5; // aligned to left of player
        this.y = null;
        
        while (this.y === null) {
            this.x++;
            // aligned to bottom of player
            this.y = this.calculateSpawnY(Math.floor(this.x));
        }

        this.spawnPoint = {
            x: this.x,
            y: this.y
        }

        this.inventory.init();

        if (this.game.debugger.settings.debug_inventory) {
            this.init_debug_inventory();
        }

        this.effects.invincible = 20;

        this.draw();
    }

    copy(data_player) { //copy from saved data
        this.x = data_player.position.x;
        this.y = data_player.position.y;

        this.inventory.data = data_player.inventory;
        this.inventory.armour = data_player.armour;

        this.calcArmour();

        this.draw();
    }

    calcArmour() {

    }

    throwItem(inventory_slot) {
        const itemDropPoint = {
            x: this.x + this.width_blocks / 2 - this.game.entity_handler.entity_item_dimensions.width / 2, // subtract half the item width width to centre
            y: this.y + this.height_blocks / 2
        };

        const itemID = this.inventory.data[inventory_slot].id;
        const durability = this.inventory.data[inventory_slot].durability;

        if (!itemID) return;

        const h_vel = this.direction === 'right' ? 8: -8;
        const v_vel = 6;
        this.dropItem(itemDropPoint.x, itemDropPoint.y, itemID, h_vel, v_vel, durability);

        //Subtract Item
        this.inventory.subtract(inventory_slot);
    }

    init_debug_inventory() { // inventory test
        this.inventory.setSlot(134, 0, 1);
        this.inventory.setSlot(140, 1, 1);
        this.inventory.setSlot(146, 2, 1);
        this.inventory.setSlot(52, 3, 8);

        this.inventory.setSlot(5, 4, 16);
        this.inventory.setSlot(23, 5, 16);

        this.inventory.setSlot(18, 6, 16);
        this.inventory.setSlot(12, 7, 16);
        this.inventory.setSlot(51, 8, 1);

        console.log(this.inventory.data)
    }

    calculateSpawnY(x) {
        for (let y = this.game.level.properties.height_blocks; y >= 0; y--) {
            const block_data = this.calc.getBlockData(x, y);
            const block_data_below = this.calc.getBlockData(x, y - 1);

            if (block_data?.name === 'air' && block_data_below?.type === 'solid') {
                return y;
            }
        }

        return null;
    }

    updateCursor() {
        const cursor = this.game.input.mouse_realXY;

        if (cursor.x == null || cursor.y == null) {
            this.selectedBlock = {
                x: null,
                y: null
            }
            return;
        }

        const blockXY = this.calc.getBlockByRealXY(cursor.x, cursor.y);
        this.selectedBlock = {
            x: blockXY.x,
            y: blockXY.y
        }
    }

    update(input, mouseDown, mouseDown_right, deltaTime) {
        if (this.game.menu_handler.aMenuIsOpen()) {
            if (input.length !== 0) {
                input = [];
                mouseDown = false;
                mouseDown_right = false;
            }
        }

        //For using food / other items
        if (mouseDown_right && this.consumption_cooldown === 0) {
            const selectedSlot = this.inventory.selectedSlot;
            const selectedItem = this.inventory.data[selectedSlot];

            const nutrition = this.game.item_directory.getProperty(selectedItem.id, 'nutrition');
            const consumption_cooldown = this.game.item_directory.getProperty(selectedItem.id, 'consumption_cooldown');

            if (nutrition && this.health < this.maxHealth) {
                this.applyHealth(nutrition);
                this.consumption_cooldown = consumption_cooldown;

                this.inventory.subtract(selectedSlot);
            }
        }

        // Check to see if this chunk should be added to the save list
        const currentChunkID = this.calc.getChunkID(this.x);
        if (!this.game.save_chunks.includes(currentChunkID) && this.game.slotLoaded !== 'default') {
            this.game.save_chunks.push(currentChunkID);
            console.log(`Added chunkID to save list: ${currentChunkID}`);
        }
        
        super.update(input, deltaTime);
    }

    update_real_pos() {
        const leftmost_blockX = this.calc.getRenderingCornerstones().leftmost_blockX;
        const rightmost_blockX = this.calc.getRenderingCornerstones().rightmost_blockX;
        const bottommost_blockY = this.calc.getRenderingCornerstones().bottommost_blockY;
        
        // Do not centre player to screen if player is too close to world boundary
        
        this.real_y = this.game.height / 2;
        if (bottommost_blockY <= 0) { // Vertical centring
            const dist = this.y - bottommost_blockY; // dist between bottommost block and player Y

            if (dist < this.game.settings.blockview_height / 2) {
                this.real_y = dist * this.game.block_size;
            }
        }


        this.real_x = this.game.width / 2;
        if (leftmost_blockX <= this.calc.getWorldBorders().minX) { // Horizontal centring
            const dist_left = this.x - leftmost_blockX; // dist between leftmost block and player Y

            if (dist_left < this.game.settings.blockview_width / 2) {
                this.real_x = dist_left * this.game.block_size;
            }
        }

        if (rightmost_blockX >= this.calc.getWorldBorders().maxX) { // Horizontal centring
            const dist_right = rightmost_blockX - this.x; // dist between rightmost block and player Y
            //const dist_left = this.game.settings.blockview_width - dist_right;

            if (dist_right < this.game.settings.blockview_width / 2) {
                this.real_x = this.game.settings.blockview_width * this.game.block_size - (dist_right * this.game.block_size);
            }
        }
    }

    run_gametick_logic(tick) {
        super.run_gametick_logic(tick);
        if (this.hitCooldown > 0) {
            this.hitCooldown--;
        }

        if (this.consumption_cooldown > 0) {
            this.consumption_cooldown--;
        }
        
        this.mouseDownOnPreviousTick = this.game.input.mouseDown;

        if (this.health <= 0) {
            this.uponDeath();
        }

        this.calcArmour();
    }

    uponDeath() {
        this.game.status = 3;
    }

    respawn() {
        this.health = this.maxHealth;
        this.effects.invincible = 20;

        this.h_vel = 0;
        this.v_vel = 0;


        this.real_x = this.game.width / 2 - this.width / 2;
        this.real_y = this.game.height / 2;

        this.x = this.spawnPoint.x; // aligned to left of player
        this.y = this.spawnPoint.y; // aligned to bottom of player

        this.draw();


        this.game.status = 1;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.game.width, this.game.height);
    }

    draw() {
        this.clear();

        this.update_real_pos();

        const left = this.real_x; //dist from x axis (left)
        const top = this.game.height - this.real_y - this.height; //dist from y axis (bottom)


        const player_image = './assets/player/player1.png';

        if (player_image) {
            let image;
            if (!this.skinCache[player_image]) {
                image = new Image();
                image.src = player_image;
    
                this.skinCache[player_image] = image;
            } else {
                image = this.skinCache[player_image];
            }
            
            this.ctx.drawImage(image, left, top, this.width, this.height);
        } else {
            this.ctx.fillStyle = 'lightgrey';
            this.ctx.fillRect(left, top, this.width, this.height);
        }
    }

    canHitMob() {
        if (this.hitCooldown === 0 || !this.mouseDownOnPreviousTick) {
            return true;
        }

        return false;
    }

    hitMob(mob) {
        if (!this.canHitMob()) return;

        this.hitCooldown = this.maxHitCooldown;
        mob.hit();
    }

    getBlockDistance(x, y) {
        return this.calc.getBlockDistance(x, y, this.x + this.width_blocks / 2, this.y + this.height_blocks / 2);
    }
}

export { Player };