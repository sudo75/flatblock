class Entity { //ONLY DEALS WITH PHYSICS AND LOGIC - rendering is done seperately
    constructor(game, entityID, x, y, width_blocks, height_blocks, vel_data) {
        this.game = game;
        this.ctx = this.game.ctx_entities;
        
        this.width_blocks = width_blocks;
        this.height_blocks = height_blocks;
        this.width = this.game.block_size * this.width_blocks;
        this.height = this.game.block_size * this.height_blocks;

        this.calc = this.game.calculator;
        this.id = entityID;

        this.direction = 'right'; //facing direction

        this.x = x; // x = 0 at left
        this.y = y; // y = 0 at bottom

        this.gravity_acceleration = -24; //earth = -9.8, default = 24

        //These values should be assigned via argument
        this.h_maxVel = 3;
        this.h_minVel = -3;

        this.h_maxVel_default = 3;
        this.h_minVel_default = -3;
        this.h_maxVel_sprint = 5;
        this.h_minVel_sprint = -5;

        this.v_maxVel = 10;
        this.v_minVel = -20;


        if (vel_data) {
            this.h_maxVel = vel_data.h_maxVel ? vel_data.h_maxVel: 3;
            this.h_minVel = vel_data.h_minVel ? vel_data.h_minVel: -3;
    
            this.h_maxVel_default = vel_data.h_maxVel_default ? vel_data.h_maxVel_default: 3;
            this.h_minVel_default = vel_data.h_minVel_default ? vel_data.h_minVel_default: -3;
            this.h_maxVel_sprint = vel_data.h_maxVel_sprint ? vel_data.h_maxVel_sprint: 5;
            this.h_minVel_sprint = vel_data.h_minVel_sprint ? vel_data.h_minVel_sprint: -5;
    
            this.v_maxVel = vel_data.v_maxVel ? vel_data.v_maxVel: 10;
            this.v_minVel = vel_data.v_minVel ? vel_data.v_minVel: -20;
        }
        

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
            for (let x = Math.floor(this.x); x <= this.calc.hardRoundDown(this.x + this.width_blocks); x++) {
                if ((this.calc.isSolidBlock(x, this.y - 1) && this.calc.hasPhysics(x, this.y - 1))) {
                    return true;
                }
            }
            /*
            if (
                (this.calc.isSolidBlock(Math.floor(this.x), this.y - 1) && this.calc.hasPhysics(Math.floor(this.x), this.y - 1)) ||
                (this.calc.isSolidBlock(this.calc.hardRoundDown(this.x + this.width_blocks), this.y - 1) && this.calc.hasPhysics(this.calc.hardRoundDown(this.x + this.width_blocks), this.y - 1))
            ) {
                return true;
            }
                */
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
            this.h_maxVel = this.h_maxVel_sprint;
            this.h_minVel = this.h_minVel_sprint;
        } else {
            this.h_maxVel = this.h_maxVel_default;
            this.h_minVel = this.h_minVel_default;
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
                    this.x = Math.floor(possibleX + this.width_blocks) - this.width_blocks;
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

class Entity_creature extends Entity {
    constructor(game, entityID, x, y, width_blocks, height_blocks, health, maxHealth, vel_data) {
        super(game, entityID, x, y, width_blocks, height_blocks, vel_data);
        
        this.health = health;
        this.maxHealth = maxHealth;
    }

    applyDamage(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.active = false;
        }
    }
}

export { Entity_creature };