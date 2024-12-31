class Entity { //ONLY DEALS WITH PHYSICS AND LOGIC - rendering is done with a subclass
    constructor(game, x, y, width, height) {
        this.game = game;
        this.ctx = this.game.ctx_entities;
        this.width = width;
        this.height = height;
        this.x = x; // x = 0 at left
        this.y = y; // y = 0 at bottom

        //this.speed = 0; // in blocks per second

        this.h_maxVel = 4;
        this.h_minVel = -4;
        this.v_maxVel = 4;
        this.v_minVel = -4;

        this.h_vel = 0; // horizontal velocity
        this.v_vel = 0; // vertical velocity
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    update(input, deltaTime) {
        if (isNaN(this.x) || isNaN(this.y)) return;
        //Set velocities
        this.h_vel = 0;
        if (input.includes('ArrowLeft')) {
            this.h_vel = this.h_minVel;
        }
        if (input.includes('ArrowRight')) {
            this.h_vel = this.h_maxVel;
        }

        this.v_vel = 0;
        if (input.includes('ArrowUp')) {
            this.v_vel = this.v_maxVel;
        }
        if (input.includes('ArrowDown')) {
            this.v_vel = this.v_minVel;
        }

        //Set entity position
        const deltaTime_sec = deltaTime / 1000;

        this.x += this.h_vel * deltaTime_sec;
        this.y += this.v_vel * deltaTime_sec;

        //console.log(this.x, this.y);
    }
}

export { Entity };