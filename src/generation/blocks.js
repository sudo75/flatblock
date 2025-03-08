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

        this.physics = true; //Follows physics rules
    }
}

class Block_Liquid extends Block {
    constructor(name, x, y, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'liquid';
        this.viscosity = 0;
        this.transparency = 0.8;
        this.physics = true;
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
        this.itemDrop_id = 1;
    }
}

class Block_grass extends Block_Solid {
    constructor(x, y) {
        super('grass', x, y, 10, './assets/textures/grass.png');
        this.id = 2;
        this.itemDrop_id = 2;
    }
}

class Block_stone extends Block_Solid {
    constructor(x, y) {
        super('stone', x, y, 50, './assets/textures/stone.png');
        this.id = 3;
        this.itemDrop_id = 3;
    }
}

class Block_treeLog extends Block_Solid {
    constructor(x, y) {
        super('treeLog', x, y, 10, './assets/textures/log.png');
        this.id = 4;
        this.itemDrop_id = 5;
        this.physics = false;
    }
}

class Block_log extends Block_Solid {
    constructor(x, y) {
        super('log', x, y, 10, './assets/textures/log.png');
        this.id = 5;
        this.itemDrop_id = 5;
    }
}

class Block_treeleaves extends Block_Solid {
    constructor(x, y) {
        super('treeLeaves', x, y, 20, './assets/textures/leaves.png');
        this.id = 6;
        this.itemDrop_id = 7;
        this.physics = false;
    }
}

class Block_leaves extends Block_Solid {
    constructor(x, y) {
        super('leaves', x, y, 20, './assets/textures/leaves.png');
        this.id = 7;
        this.itemDrop_id = 7;
    }
}



class Item_Directory {
    constructor() {
        this.item = {
            '0': Block_Air,
            '1': Block_dirt,
            '2': Block_grass,
            '3': Block_stone,
            '4': Block_treeLog,
            '5': Block_treeLog,
            '6': Block_treeleaves,
            '7': Block_leaves
        }
    }

    getTextureLocationByID(id) {
        if (!this.item[id]) return;

        const blockClass = this.item[id];
        const blockInstance = new blockClass;
        
        return blockInstance.texture_location;
    }
}

export { Item_Directory };
export { Block_Air, Block_dirt, Block_grass, Block_stone, Block_treeLog, Block_log, Block_treeleaves, Block_leaves };