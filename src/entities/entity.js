class Entity { //ONLY DEALS WITH PHYSICS AND LOGIC - rendering is done with a subclass
    constructor(game, x, y, width, height, width_blocks, height_blocks) {
        this.game = game;
        this.ctx = this.game.ctx_entities;
        this.width = width;
        this.height = height;
        this.width_blocks = width_blocks;
        this.height_blocks = height_blocks;
        this.calc = this.game.calculator;

        this.x = x; // x = 0 at left
        this.y = y; // y = 0 at bottom

        //this.speed = 0; // in blocks per second

        this.gravity_acceleration = -9.8;

        this.h_maxVel = 5;
        this.h_minVel = -5;
        this.v_maxVel = 5;
        this.v_minVel = -5;

        this.h_vel = 0; // horizontal velocity
        this.v_vel = 0; // vertical velocity
    }

    jump() {
        this.v_vel = this.v_maxVel;
    }

    isOnSolidBlock() {
        if (this.y % 1 == 0 && this.y - 1 >= 0) {
            if (
                this.calc.isSolidBlock(Math.floor(this.x), this.y - 1) ||
                this.calc.isSolidBlock(Math.floor(this.x + this.width_blocks), this.y - 1)
            ) {
                return true;
            }
            return false;
        }
        return false;
    }

    hardRoundDown(number) {
        if (number % 1 === 0) { // Check if the number is whole
            return number - 1;
        }
        return Math.floor(number);
    }

    willCollide(x, y, minX_, minY_, maxX_, maxY_) { // Input position to test

        const minX = minX_ ? minX_: Math.floor(x);
        const minY = minY_ ? minY_: Math.floor(y);
        const maxX = maxX_ ? maxX_: this.hardRoundDown(x + this.width_blocks);
        const maxY = maxY_ ? maxY_: this.hardRoundDown(y + this.height_blocks);

        for (let i = minX; i <= maxX; i++) {
            for (let j = minY; j <= maxY; j++) {
                if (!this.calc.isWithinWorldBounds(i, j)) continue;
                if (this.calc.isSolidBlock(i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    update(input, deltaTime) {
        if (isNaN(this.x) || isNaN(this.y)) return;

        //Physics
        if (!this.isOnSolidBlock()) {
            this.v_vel += this.gravity_acceleration * deltaTime;
        }

        //Set velocities
        this.h_vel = 0;
        if (input.includes('ArrowLeft')) {
            
            this.h_vel = this.h_minVel;
        }
        if (input.includes('ArrowRight')) {
            this.h_vel = this.h_maxVel;
        }

        //this.v_vel = 0;
        if (input.includes('ArrowUp')) {
            if (this.isOnSolidBlock()) {
                this.jump();
            }
        }
        if (input.includes('ArrowDown')) {
            //this.v_vel = this.v_minVel;
        }

        //Ensure velocity limits
        if (this.h_vel > this.h_maxVel) {
            this.h_vel = this.h_maxVel;
        }
        if (this.v_vel > this.v_maxVel) {
            this.v_vel = this.v_maxVel;
        }


        //Calculate possible position
        const possibleX = this.x + this.h_vel * deltaTime;
        const possibleY = this.y + this.v_vel * deltaTime;

        //Ensure world bound compliance
        if (possibleY < 0) {
            this.v_vel = 0;
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
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX), Math.floor(possibleY), this.hardRoundDown(possibleX + this.width_blocks), Math.floor(possibleY))) {
                    if (this.v_vel < 0) {
                        this.v_vel = 0;
                    }
                    this.y = Math.ceil(possibleY);
                }
                
            } else 
            if (crossedOverY_bottom) {
                if (this.willCollide(possibleX, possibleY, Math.floor(possibleX), this.hardRoundDown(possibleY + this.height_blocks), this.hardRoundDown(possibleX + this.height_blocks), this.hardRoundDown(possibleY + this.height_blocks))) {
                    this.v_vel = 0;
                    this.y = Math.floor(possibleY);
                }
            }

            if (crossedOverX_left) {
                this.h_vel = 0;
                this.x = Math.ceil(possibleX) - this.width_blocks;
            } else if (crossedOverX_right) {
                this.h_vel = 0;
                this.x = Math.ceil(possibleX);
            }   
        }

        //Set entity position
        this.x += this.h_vel * deltaTime;
        this.y += this.v_vel * deltaTime;
    }
}

export { Entity };