class Meta {
    constructor(name, texture_location, item_type) {
        this.name = name;
        this.texture_location = texture_location;

        this.item_type = item_type;
        this.isBlock = true;
    }
}

class Block extends Meta {
    constructor(name, x, y, texture_location) {
        super(name, texture_location, 'block');
        this.x = x;
        this.y = y;
    }
}

class Block_Solid extends Block {
    constructor(name, x, y, hardness, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'solid';
        this.viscosity = 1;
        this.transparency = 0;

        this.hardness = hardness;
        this.break_status = 0; // 0 - hardness

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

class Item extends Meta {
    constructor(name, texture_location) {
        super(name, texture_location, 'tool');
        this.isBlock = false;
    }
}

class Tool extends Item {
    constructor(name, texture_location) {
        super(name, texture_location);
    }
}

// ITEMS ------------------------------------------>

class Item_woodenPicaxe extends Tool {
    constructor() {
        super('wooden_picaxe', './assets/items/wooden_picaxe.png');
        this.id = 128;
        this.durability = 5;

        this.strength = 2;
        this.purpose = [3]; //list of block IDs the tool breaks
    }
}


// BLOCKS ----------------------------------------->

class Block_dirt extends Block_Solid {
    constructor(x, y) {
        super('dirt', x, y, 20, './assets/textures/dirt.png');
        this.id = 1;
        this.itemDrop_id = 1;
    }
}

class Block_grass extends Block_Solid {
    constructor(x, y) {
        super('grass', x, y, 30, './assets/textures/grass.png');
        this.id = 2;
        this.itemDrop_id = 2;
    }
}

class Block_stone extends Block_Solid {
    constructor(x, y) {
        super('stone', x, y, 100, './assets/textures/stone.png');
        this.id = 3;
        this.itemDrop_id = 3;
    }
}

class Block_treeLog extends Block_Solid {
    constructor(x, y) {
        super('treeLog', x, y, 50, './assets/textures/log.png');
        this.id = 4;
        this.itemDrop_id = 5;
        this.physics = false;
    }
}

class Block_log extends Block_Solid {
    constructor(x, y) {
        super('log', x, y, 50, './assets/textures/log.png');
        this.id = 5;
        this.itemDrop_id = 5;
    }
}

class Block_treeleaves extends Block_Solid {
    constructor(x, y) {
        super('treeLeaves', x, y, 10, './assets/textures/leaves.png');
        this.id = 6;
        this.itemDrop_id = 7;
        this.physics = false;
    }
}

class Block_leaves extends Block_Solid {
    constructor(x, y) {
        super('leaves', x, y, 10, './assets/textures/leaves.png');
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
            '7': Block_leaves,

            '128': Item_woodenPicaxe
        }
    }

    getProperty(id, property) {
        if (!this.item[id]) return;

        const itemClass = this.item[id];
        const itemInstance = new itemClass;

        return itemInstance[property];
    }

    getTextureLocationByID(id) {

        return this.getProperty(id, 'texture_location');
    }
}

export { Item_Directory };