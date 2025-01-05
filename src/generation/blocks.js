class Block {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

class Block_Solid extends Block {
    constructor(name, x, y) {
        super(name, x, y);
        this.type = 'solid';
        this.viscosity = 1;
        this.transparency = 0;
    }
}

class Block_Liquid extends Block {
    constructor(name, x, y) {
        super(name, x, y);
        this.type = 'liquid';
        this.viscosity = 0;
        this.transparency = 0.8;
    }
}

class Block_Air extends Block {
    constructor(x, y) {
        super('air', x, y);
        this.type = 'air';
        this.viscosity = 0;
        this.transparency = 1;

        this.id = 0;
    }
}

class Block_dirt extends Block_Solid {
    constructor(x, y) {
        super('dirt', x, y);
        this.hardness = 10;
        this.break_status = 0; // 0 - 5

        this.id = 1;
    }

}

export { Block_Air, Block_dirt };