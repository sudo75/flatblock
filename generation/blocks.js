class Meta {
    constructor(name, texture_location, item_type) {
        this.name = name;
        this.texture_location = texture_location;

        this.item_type = item_type;
        this.isBlock = true;

        this.item_directory = new Item_Directory();

        this.maxStackSize = 16;

        this.strength = 1;
        this.damage = 1;
        this.purpose = 'all';

        this.fuel = 0;
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
        this.maxStackSize = 1;
    }
}

// ITEMS ------------------------------------------>

class Item_stick extends Item {
    constructor() {
        super('stick', './assets/items/stick.png');
        this.id = 128;
    }
}

class Item_woodenPickaxe extends Tool {
    constructor() {
        super('wooden_pickaxe', './assets/items/wooden_pickaxe.png');
        this.id = 129;
        this.durability = 32;

        this.strength = 2;
        this.damage = 2;
        this.purpose = [3, 24]; //list of block IDs the tool breaks
    }
}

class Item_stonePickaxe extends Tool {
    constructor() {
        super('stone_pickaxe', './assets/items/stone_pickaxe.png');
        this.id = 130;
        this.durability = 64;

        this.strength = 3;
        this.damage = 3;
        this.purpose = [3, 24]; //list of block IDs the tool breaks
    }
}

class Item_woodenAxe extends Tool {
    constructor() {
        super('wooden_axe', './assets/items/wooden_axe.png');
        this.id = 129;
        this.durability = 32;

        this.strength = 2;
        this.damage = 3;
        this.purpose = [4, 5, 7, 8]; //list of block IDs the tool breaks
    }
}

class Item_stoneAxe extends Tool {
    constructor() {
        super('stone_axe', './assets/items/stone_axe.png');
        this.id = 130;
        this.durability = 64;

        this.strength = 3;
        this.damage = 4;
        this.purpose = [4, 5, 7, 8]; //list of block IDs the tool breaks
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
        super('stone', x, y, 150, './assets/textures/stone.png');
        this.id = 3;
        this.itemDrop_id = 3;

        this.furnace_result = 2; //ID of smelted item
    }
}

class Block_treeLog extends Block_Solid {
    constructor(x, y) {
        super('tree_log', x, y, 50, './assets/textures/log.png');
        this.id = 4;
        this.itemDrop_id = 5;
        this.physics = false;

        this.fuel_value = 20;
    }
}

class Block_log extends Block_Solid {
    constructor(x, y) {
        super('log', x, y, 50, './assets/textures/log.png');
        this.id = 5;
        this.itemDrop_id = 5;

        this.fuel_value = 300;
        this.furnace_result = 24;
    }
}

class Block_treeLeaves extends Block_Solid {
    constructor(x, y) {
        super('tree_leaves', x, y, 10, './assets/textures/leaves.png');
        this.id = 6;
        this.itemDrop_id = 7;
        this.physics = false;

        this.fuel_value = 40;
    }
}

class Block_leaves extends Block_Solid {
    constructor(x, y) {
        super('leaves', x, y, 10, './assets/textures/leaves.png');
        this.id = 7;
        this.itemDrop_id = 7;

        this.fuel_value = 40;
    }
}

class Block_planks extends Block_Solid {
    constructor(x, y) {
        super('planks', x, y, 40, './assets/textures/planks.png');
        this.id = 8;
        this.itemDrop_id = 8;

        this.fuel_value = 150;
    }
}


class Block_coalOre extends Block_Solid {
    constructor(x, y) {
        super('coal_ore', x, y, 250, './assets/textures/coal_ore.png');
        this.id = 24;
        this.itemDrop_id = 24;
    }
}

import { Inventory } from '../entities/inventory.js';
class Block_chest extends Block_Solid {
    constructor(x, y) {
        super('chest', x, y, 40, './assets/textures/chest.png');
        this.id = 9;
        this.itemDrop_id = 9;

        this.inventory = new Inventory();
        this.physics = false;
        this.interact = true;
    }
}

class Block_craftingTable extends Block_Solid {
    constructor(x, y) {
        super('chest', x, y, 40, './assets/textures/crafting_table.png');
        this.id = 10;
        this.itemDrop_id = 10;

        this.inventory = new Inventory();
        this.physics = false;
        this.interact = true;
    }
}

class Block_furnace extends Block_Solid {
    constructor(x, y) {
        super('furnace', x, y, 40, './assets/textures/furnace_unlit.png');
        this.id = 11;
        this.itemDrop_id = 11;

        this.inventory = new Inventory();
        this.physics = false;
        this.interact = true;

        this.og_fuelPoints = 0;
        this.fuelPoints = 0; //in ticks;

        this.fuel_efficiency_percent = 100;
        this.efficiency = 200; //required process points to smelt an item
        
        this.processPoints = 0; //in ticks

        this.status = 0; // 0 = unlit, 1 = lit
    }

    setStatus(status_value) {
        switch (status_value) {
            case 0:
                this.status = 0;
                this.texture_location = './assets/textures/furnace_unlit.png'
                break;
            case 1:
                this.status = 1;
                this.texture_location = './assets/textures/furnace_lit.png'
        }
    }

    run_gametick_logic(tick) {
        const input_slot = this.inventory.data[0];
        const getInputSlotFillStatus = (input_slot) => {
            if (input_slot.quantity > 0) {
                if (this.item_directory.getProperty(input_slot.id, 'furnace_result')) {
                    return true;
                }
            }

            return false;
        };
        const isFilled_input_slot = getInputSlotFillStatus(input_slot);

        const fuel_slot = this.inventory.data[1];
        const getFuelSlotFillStatus = (fuel_slot) => {
            if (fuel_slot.quantity > 0) {
                if (this.item_directory.getProperty(fuel_slot.id, 'fuel_value') > 0) {
                    return true;
                }
            }

            return false;
        }
        const isFilled_fuel_slot = getFuelSlotFillStatus(fuel_slot);
        
        const result_slot = this.inventory.data[2];
        const isFilled_result_slot = result_slot.quantity >= this.item_directory.getProperty(result_slot.id, 'maxStackSize');

        const result = this.item_directory.getProperty(input_slot.id, 'furnace_result');
        const canSmelt = () => {
            return isFilled_input_slot && ((result === this.inventory.data[2].id && !isFilled_result_slot) || (this.inventory.data[2].quantity === 0 || this.inventory.data[2].quantity === null))
        }

        //Fill fuel
        if (this.fuelPoints <= 0 && isFilled_fuel_slot && canSmelt()) { //fill fuel if fuel is empty, fuel slot is filled, and input is filled
            const fuel_value = Math.round((this.item_directory.getProperty(fuel_slot.id, 'fuel_value')) * this.fuel_efficiency_percent / 100);
            this.og_fuelPoints = fuel_value;
            this.fuelPoints = fuel_value;

            this.inventory.subtract(1); //Subtract from fuel slot

            return; //Don't start smelting on the same tick as when the fuel is lit
        }

        //Smelt item
        if (this.fuelPoints > 0 && canSmelt()) {
            this.processPoints++;

            if (this.processPoints >= this.efficiency) { //Finished smelting
                this.inventory.subtract(0);

                this.inventory.setSlot(result, 2, result_slot.quantity + 1, null);

                this.processPoints = 0;
            }
        } else { //Reverse progress if there is no fuel
            this.processPoints--;
            if (this.processPoints < 0) {
                this.processPoints = 0;
            }
        }

        //Use fuel & update status accordingly
        if (this.fuelPoints > 0) {
            this.fuelPoints--;
            this.setStatus(1); // On state
        } else {
            this.setStatus(0); // Off state
        }
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
            '5': Block_log,
            '6': Block_treeLeaves,
            '7': Block_leaves,
            '8': Block_planks,
            '9': Block_chest,
            '10': Block_craftingTable,
            '11': Block_furnace,

            '24': Block_coalOre,

            '128': Item_stick,
            '129': Item_woodenPickaxe,
            '130': Item_stonePickaxe,
            '131': Item_woodenAxe,
            '132': Item_stoneAxe,
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

    getIDByName(name) {
        for (let id in this.item) {
            if (this.getProperty(id, 'name') === name) {
                return id;
            }
        }

        return undefined;
    }
}

export { Item_Directory };