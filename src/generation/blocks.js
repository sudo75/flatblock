class Block {
    constructor(name, x, y, texture_location) {
        this.name = name;
        this.x = x;
        this.y = y;

        this.texture_location = texture_location;
    }
}

class Block_Solid extends Block {
    constructor(name, x, y, hardness, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'solid';
        this.viscosity = 1;
        this.transparency = 0;

        this.hardness = hardness;
        this.break_status = 0; // 0 - 5
    }
}

class Block_Liquid extends Block {
    constructor(name, x, y, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'liquid';
        this.viscosity = 0;
        this.transparency = 0.8;
    }
}

class Block_Air extends Block {
    constructor(x, y) {
        super('air', x, y, null);
        this.type = 'air';
        this.viscosity = 0;
        this.transparency = 1;

        this.id = 0;
    }
}


// BLOCKS ----------------------------------------->

class Block_dirt extends Block_Solid {
    constructor(x, y) {
        super('dirt', x, y, 10, './assets/textures/dirt.png');
        this.id = 1;
    }
}

class Block_grass extends Block_Solid {
    constructor(x, y) {
        super('grass', x, y, 10, './assets/textures/grass.png');
        this.id = 2;
    }
}

class Block_stone extends Block_Solid {
    constructor(x, y) {
        super('stone', x, y, 50, './assets/textures/stone.png');
        this.id = 3;
    }
}

export const getTextureLocationByID = (id) => {
    const items = {
        '0': null,
        '1': './assets/textures/dirt.png',
        '2': './assets/textures/grass.png',
        '3': './assets/textures/stone.png'
    }

    return items[id];
};

export { Block_Air, Block_dirt, Block_grass, Block_stone };