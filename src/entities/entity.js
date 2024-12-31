class Entity { //ONLY DEALS WITH PHYSICS AND LOGIC - rendering is done with a subclass
    constructor(game, x, y, width, height) {
        this.game = game;
        this.ctx = this.game.ctx_entities;
        this.width = width;
        this.height = height;
        this.x = x; // x = 0 at left
        this.y = y; // y = 0 at bottom
    }

    update(input) {
        // update code for inputs
    }
}

export { Entity };