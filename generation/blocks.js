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

        this.spriteSheetX = 0;

        this.fuel = 0;

        this.light_source = 0;
        this.light_source_sun = 0;
        this.light = 0; // 0 - 15;

        this.status = 0;
    }

    setStatus(status_value) {
        this.status = status_value;
        this.spriteSheetX = 16 * status_value;
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

// Fluids --------------------------------------->

class Block_Liquid extends Block {
    constructor(name, x, y, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'liquid';
        this.viscosity = 0;
        this.transparency = 0.8;
        this.physics = true;

        this.liquid_spread = 8;
        this.source = true;
    }
}

class Block_water extends Block_Liquid {
    constructor(x, y) {
        super('water', x, y, './assets/textures/water.png');
        this.id = 13;

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

// ITEMS ------------------------------------------>

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


class Item_stick extends Item {
    constructor() {
        super('stick', './assets/items/stick.png');
        this.id = 128;

        this.fuel_value = 100;
    }
}

// FOOD ------------------------------------------>

class Item_food extends Item {
    constructor(name, texture_location) {
        super(name, texture_location);

        this.maxStackSize = 1;
    }
}

class Item_pork extends Item_food {
    constructor() {
        super('pork', './assets/items/pork.png');
        this.id = 64;

        this.nutrition = 3;
        this.consumption_cooldown = 20;

        this.furnace_result = 65;
    }
}

class Item_porkCooked extends Item_food {
    constructor() {
        super('pork_cooked', './assets/items/pork_cooked.png');
        this.id = 65;

        this.nutrition = 6;
        this.consumption_cooldown = 30;
    }
}

// Pickaxes ---------------------------->

class Item_pickaxe extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [3, 24, 26, 28, 30, 32]; //list of block IDs the tool breaks

    }
}

class Item_woodenPickaxe extends Item_pickaxe {
    constructor() {
        super('wooden_pickaxe', './assets/items/wooden_pickaxe.png');
        this.id = 129;
        this.durability = 32;

        this.strength = 2;
        this.damage = 3;

        this.fuel_value = 200;
    }
}

class Item_stonePickaxe extends Item_pickaxe {
    constructor() {
        super('stone_pickaxe', './assets/items/stone_pickaxe.png');
        this.id = 130;
        this.durability = 64;

        this.strength = 3;
        this.damage = 4;
    }
}

class Item_copperPickaxe extends Item_pickaxe {
    constructor() {
        super('copper_pickaxe', './assets/items/copper_pickaxe.png');
        this.id = 131;
        this.durability = 192;

        this.strength = 5;
        this.damage = 4;

        this.fuel_value = 200;
    }
}

class Item_goldenPickaxe extends Item_pickaxe {
    constructor() {
        super('golden_pickaxe', './assets/items/golden_pickaxe.png');
        this.id = 132;
        this.durability = 96;

        this.strength = 7;
        this.damage = 4;

        this.fuel_value = 200;
    }
}

class Item_ironPickaxe extends Item_pickaxe {
    constructor() {
        super('iron_pickaxe', './assets/items/iron_pickaxe.png');
        this.id = 133;
        this.durability = 256;

        this.strength = 6;
        this.damage = 5;
    }
}


class Item_diamondPickaxe extends Item_pickaxe {
    constructor() {
        super('diamond_pickaxe', './assets/items/diamond_pickaxe.png');
        this.id = 134;
        this.durability = 1024;

        this.strength = 8;
        this.damage = 6;
    }
}


// Axes ---------------------------->

class Item_axe extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [4, 5, 7, 8]; //list of block IDs the tool breaks

    }
}

class Item_woodenAxe extends Item_axe {
    constructor() {
        super('wooden_axe', './assets/items/wooden_axe.png');
        this.id = 135;
        this.durability = 32;

        this.strength = 2;
        this.damage = 3;

        this.fuel_value = 200;
    }
}

class Item_stoneAxe extends Item_axe {
    constructor() {
        super('stone_axe', './assets/items/stone_axe.png');
        this.id = 136;
        this.durability = 64;

        this.strength = 3;
        this.damage = 4;
    }
}

class Item_copperAxe extends Item_axe {
    constructor() {
        super('copper_axe', './assets/items/copper_axe.png');
        this.id = 137;
        this.durability = 192;

        this.strength = 5;
        this.damage = 5;
    }
}

class Item_goldenAxe extends Item_axe {
    constructor() {
        super('golden_axe', './assets/items/golden_axe.png');
        this.id = 138;
        this.durability = 96;

        this.strength = 7;
        this.damage = 5;
    }
}

class Item_ironAxe extends Item_axe {
    constructor() {
        super('iron_axe', './assets/items/iron_axe.png');
        this.id = 139;
        this.durability = 256;

        this.strength = 6;
        this.damage = 6;
    }
}

class Item_diamondAxe extends Item_axe {
    constructor() {
        super('diamond_axe', './assets/items/diamond_axe.png');
        this.id = 140;
        this.durability = 1024;

        this.strength = 8;
        this.damage = 7;
    }
}

// Shovels ---------------------------->

class Item_shovel extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [1, 2]; //list of block IDs the tool breaks

    }
}

class Item_woodenShovel extends Item_shovel {
    constructor() {
        super('wooden_shovel', './assets/items/wooden_shovel.png');
        this.id = 141;
        this.durability = 32;

        this.strength = 2;
        this.damage = 2;

        this.fuel_value = 200;
    }
}

class Item_stoneShovel extends Item_shovel {
    constructor() {
        super('stone_shovel', './assets/items/stone_shovel.png');
        this.id = 142;
        this.durability = 64;

        this.strength = 3;
        this.damage = 3;
    }
}

class Item_copperShovel extends Item_shovel {
    constructor() {
        super('copper_shovel', './assets/items/copper_shovel.png');
        this.id = 143;
        this.durability = 192;

        this.strength = 5;
        this.damage = 3;
    }
}

class Item_goldenShovel extends Item_shovel {
    constructor() {
        super('golden_shovel', './assets/items/golden_shovel.png');
        this.id = 144;
        this.durability = 96;

        this.strength = 7;
        this.damage = 3;
    }
}

class Item_ironShovel extends Item_shovel {
    constructor() {
        super('iron_shovel', './assets/items/iron_shovel.png');
        this.id = 145;
        this.durability = 256;

        this.strength = 6;
        this.damage = 4;
    }
}

class Item_diamondShovel extends Item_shovel {
    constructor() {
        super('diamond_shovel', './assets/items/diamond_shovel.png');
        this.id = 146;
        this.durability = 1024;

        this.strength = 8;
        this.damage = 5;
    }
}

// Sword ---------------------------->

class Item_sword extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [6, 7]; //list of block IDs the tool breaks

    }
}

class Item_woodenSword extends Item_sword {
    constructor() {
        super('wooden_sword', './assets/items/wooden_sword.png');
        this.id = 147;
        this.durability = 32;

        this.strength = 2;
        this.damage = 4;

        this.fuel_value = 200;
    }
}

class Item_stoneSword extends Item_sword {
    constructor() {
        super('stone_sword', './assets/items/stone_sword.png');
        this.id = 148;
        this.durability = 64;

        this.strength = 3;
        this.damage = 5;
    }
}

class Item_copperSword extends Item_sword {
    constructor() {
        super('copper_sword', './assets/items/copper_sword.png');
        this.id = 149;
        this.durability = 192;

        this.strength = 5;
        this.damage = 6;
    }
}

class Item_goldenSword extends Item_sword {
    constructor() {
        super('golden_sword', './assets/items/golden_sword.png');
        this.id = 150;
        this.durability = 96;

        this.strength = 7;
        this.damage = 6;
    }
}

class Item_ironSword extends Item_sword {
    constructor() {
        super('iron_sword', './assets/items/iron_sword.png');
        this.id = 151;
        this.durability = 256;

        this.strength = 6;
        this.damage = 7;
    }
}

class Item_diamondSword extends Item_sword {
    constructor() {
        super('diamond_sword', './assets/items/diamond_sword.png');
        this.id = 152;
        this.durability = 1024;

        this.strength = 8;
        this.damage = 8;
    }
}


// BLOCKS ----------------------------------------->

class Block_dirt extends Block_Solid {
    constructor(x, y) {
        super('dirt', x, y, 40, './assets/textures/dirt.png');
        this.id = 1;
        this.itemDrop_id = 1;
    }
}

class Block_grass extends Block_Solid {
    constructor(x, y) {
        super('grass', x, y, 60, './assets/textures/grass.png');
        this.id = 2;
        this.itemDrop_id = 2;
    }
}

class Block_stone extends Block_Solid {
    constructor(x, y) {
        super('stone', x, y, 120, './assets/textures/stone.png');
        this.id = 3;
        this.itemDrop_id = 3;

        this.furnace_result = 2; //ID of smelted item
    }
}

class Block_treeLog extends Block_Solid {
    constructor(x, y) {
        super('tree_log', x, y, 100, './assets/textures/log.png');
        this.id = 4;
        this.itemDrop_id = 5;
        this.physics = false;
        this.transparency = 1;

        this.fuel_value = 400;
    }
}

class Block_log extends Block_Solid {
    constructor(x, y) {
        super('log', x, y, 100, './assets/textures/log.png');
        this.id = 5;
        this.itemDrop_id = 5;

        this.fuel_value = 400;
        this.furnace_result = 25;
    }
}

class Block_treeLeaves extends Block_Solid {
    constructor(x, y) {
        super('tree_leaves', x, y, 15, './assets/textures/leaves.png');
        this.id = 6;
        this.itemDrop_id = 7;
        this.physics = false;
        this.transparency = 1;

        this.fuel_value = 50;
    }
}

class Block_leaves extends Block_Solid {
    constructor(x, y) {
        super('leaves', x, y, 15, './assets/textures/leaves.png');
        this.id = 7;
        this.itemDrop_id = 7;

        this.fuel_value = 50;
    }
}

class Block_planks extends Block_Solid {
    constructor(x, y) {
        super('planks', x, y, 60, './assets/textures/planks.png');
        this.id = 8;
        this.itemDrop_id = 8;

        this.fuel_value = 300;
    }
}

class Block_torch extends Block_Solid {
    constructor(x, y) {
        super('torch', x, y, 1, './assets/textures/torch.png');
        this.id = 12;
        this.itemDrop_id = 12;
        this.physics = false;
        this.transparency = 1;

        this.light_source = 15;
        this.spriteSheetX = 0;
    }

    run_gametick_logic(tick) {
        this.spriteSheetX = 0;

        if (!this.neighbour_data) return;

        if (this.neighbour_data.left) {
            if (this.neighbour_data.left.type === 'solid') {
                this.status = 1;
                this.spriteSheetX = 16;
            }
        }
        if (this.neighbour_data.right) {
            if (this.neighbour_data.right.type === 'solid') {
                this.status = 2;
                this.spriteSheetX = 32;
            }
        }

        if (this.neighbour_data.down) {
            if (this.neighbour_data.down.type === 'solid') {
                this.status = 0;
                this.spriteSheetX = 0;
            }
        }
        
    }
}


// Minerals -------------------------------------->

class Block_coalOre extends Block_Solid {
    constructor(x, y) {
        super('coal_ore', x, y, 140, './assets/textures/coal_ore.png');
        this.id = 24;
        this.itemDrop_id = 25;

        this.furnace_result = 25;
    }
}

class Item_coal extends Item {
    constructor() {
        super('coal', './assets/items/coal.png');
        this.id = 25;

        this.fuel_value = 1600;
    }
}

class Block_copperOre extends Block_Solid {
    constructor(x, y) {
        super('copper_ore', x, y, 140, './assets/textures/copper_ore.png');
        this.id = 26;
        this.itemDrop_id = 26;

        this.furnace_result = 27;
    }
}

class Item_copperIngot extends Item {
    constructor() {
        super('copper_ingot', './assets/items/copper_ingot.png');
        this.id = 27;
    }
}

class Block_goldOre extends Block_Solid {
    constructor(x, y) {
        super('gold_ore', x, y, 140, './assets/textures/gold_ore.png');
        this.id = 28;
        this.itemDrop_id = 28;

        this.furnace_result = 29;
    }
}

class Item_goldIngot extends Item {
    constructor() {
        super('gold_ingot', './assets/items/gold_ingot.png');
        this.id = 29;
    }
}

class Block_ironOre extends Block_Solid {
    constructor(x, y) {
        super('iron_ore', x, y, 140, './assets/textures/iron_ore.png');
        this.id = 30;
        this.itemDrop_id = 30;

        this.furnace_result = 31;
    }
}

class Item_ironIngot extends Item {
    constructor() {
        super('iron_ingot', './assets/items/iron_ingot.png');
        this.id = 31;
    }
}

class Block_diamondOre extends Block_Solid {
    constructor(x, y) {
        super('diamond_ore', x, y, 150, './assets/textures/diamond_ore.png');
        this.id = 32;
        this.itemDrop_id = 33;

        this.furnace_result = 33;
    }
}

class Item_diamond extends Item {
    constructor() {
        super('diamond', './assets/items/diamond.png');
        this.id = 33;
    }
}


// INTERACTIVE BLOCKS ------------------------>

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
            '12': Block_torch,
            '13': Block_water,

            '24': Block_coalOre,
            '25': Item_coal,
            '26': Block_copperOre,
            '27': Item_copperIngot,
            '28': Block_goldOre,
            '29': Item_goldIngot,
            '30': Block_ironOre,
            '31': Item_ironIngot,
            '32': Block_diamondOre,
            '33': Item_diamond,

            '64': Item_pork,
            '65': Item_porkCooked,

            '128': Item_stick,

            '129': Item_woodenPickaxe,
            '130': Item_stonePickaxe,
            '131': Item_copperPickaxe,
            '132': Item_goldenPickaxe,
            '133': Item_ironPickaxe,
            '134': Item_diamondPickaxe,

            '135': Item_woodenAxe,
            '136': Item_stoneAxe,
            '137': Item_copperAxe,
            '138': Item_goldenAxe,
            '139': Item_ironAxe,
            '140': Item_diamondAxe,

            '141': Item_woodenShovel,
            '142': Item_stoneShovel,
            '143': Item_copperShovel,
            '144': Item_goldenShovel,
            '145': Item_ironShovel,
            '146': Item_diamondShovel,

            '147': Item_woodenSword,
            '148': Item_stoneSword,
            '149': Item_copperSword,
            '150': Item_goldenSword,
            '151': Item_ironSword,
            '152': Item_diamondSword
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