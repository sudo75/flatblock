import { Utils } from "../calculations/utils.js";

class Meta {
    constructor(name, texture_location, item_type) {
        this.name = name;
        this.texture_location = texture_location;

        this.item_type = item_type;
        this.isBlock = true;

        this.untouchable = false;
        this.pendingDestroy = false;

        this.item_directory = new Item_Directory();
        this.utils = new Utils();

        this.maxStackSize = 16;

        this.strength = 1;
        this.damage = 1;
        this.purpose = 'all';

        this.requireClick_interact = false; // to place/interect

        this.spriteSheetX = 0;

        this.fuel_value = 0;

        this.light_source = 0;
        this.light_source_sun = 0;
        this.light = 0; // 0 - 15;

        this.status = 0;

        this.placedAt = 0; //Tick when placed

        this.entityBound = true; // true = can only be placed where there is no entity

        this.onNextTick = null; // Should be set as an object with an id of new block and properties of that block {id: ..., properties: {...}}

        this.placeRequirements = {
            all: { // must follow all of these rules
                adjacent: [], // within each array, only one must be true: ex. adjacent: [2, 3] => either a block of id 2 or 3 will sufice

                left: [],
                right: [],
                top: [],
                bottom: [], // use to define properties that the value may (not) take: {property: true, key: ..., value: ...}
            },

            oneOf: [ // must follow one of these rules: ex. [{left: [2]}, {right: 2}] => either left or right neighbour must have id = 2
                {
                    adjacent: [],

                    left: [],
                    right: [],
                    top: [],
                    bottom: [],
                },
                {
                    // rule 2
                }
            ]
        };

        //placeBlock_id is optional

        this.giveItemUponPlace = null; // {id: ..., quantity: ...}

        this.spawnItems = null; // Spawn item on next tick [{id: ..., quantity: ..., durability (optional), chance: (optional)}]
        this.removeItem = false;
        this.giveItem = null; // {id: ..., quantity: ...}
        this.decrementDurability = false;

        const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/') + 'assets/sounds/';
        this.soundController = {
            setType(soundTarget, type) {
                // Clear
                for (const key in soundTarget) {
                    delete soundTarget[key];
                }
                // Set
                for (const key in this.soundPaths) {
                    const typeSounds = this.soundPaths[key]?.[type];
                    const defaultSounds = this.soundPaths[key]?.default;

                    if (typeSounds) {
                        soundTarget[key] = typeSounds;
                    } else if (defaultSounds) {
                        soundTarget[key] = defaultSounds;
                    }
                    
                }
            },
            soundPaths: {
                break: {
                    dirt: [
                        `${basePath}/break_gravel_1.mp3`,
                        `${basePath}/break_gravel_2.mp3`,
                        `${basePath}/break_gravel_3.mp3`
                    ],
                    wood: [
                        `${basePath}/break_wood_1.mp3`,
                        `${basePath}/break_wood_2.mp3`,
                        `${basePath}/break_wood_3.mp3`,
                        `${basePath}/break_wood_4.mp3`
                    ],
                    stone: [
                        `${basePath}/break_wood_1.mp3`,
                        `${basePath}/break_wood_2.mp3`,
                        `${basePath}/break_wood_3.mp3`,
                        `${basePath}/break_wood_4.mp3`
                    ]
                },
                broke: {
                    default: [`${basePath}/clack_low.mp3`]
                },
                walk: { // walking on a block
                    dirt: [
                        `${basePath}/break_gravel_1.mp3`,
                        `${basePath}/break_gravel_2.mp3`,
                        `${basePath}/break_gravel_3.mp3`,
                        `${basePath}/walk_grass_1.mp3`,
                        `${basePath}/walk_grass_2.mp3`,
                        `${basePath}/walk_grass_3.mp3`,
                        `${basePath}/walk_grass_4.mp3`
                    ],
                    wood: [
                        `${basePath}/break_wood_1.mp3`,
                        `${basePath}/break_wood_2.mp3`,
                        `${basePath}/break_wood_3.mp3`,
                        `${basePath}/break_wood_4.mp3`
                    ],
                    stone: [
                        `${basePath}/break_wood_1.mp3`,
                        `${basePath}/break_wood_2.mp3`,
                        `${basePath}/break_wood_3.mp3`,
                        `${basePath}/break_wood_4.mp3`
                    ]
                },
                wade: { // when moving THROUGH a block -- not walking on top
                    water: [
                        `${basePath}/splash_1.mp3`,
                        `${basePath}/splash_2.mp3`,
                        `${basePath}/splash_3.mp3`,
                        `${basePath}/splash_4.mp3`
                    ]
                },
                interact: {
                    water: [
                        `${basePath}/splash_1.mp3`,
                        `${basePath}/splash_2.mp3`,
                        `${basePath}/splash_3.mp3`,
                        `${basePath}/splash_4.mp3`
                    ]
                },
                place: {
                    default: [
                        `${basePath}/clack.wav`
                    ],
                    water: [
                        `${basePath}/splash_1.mp3`,
                        `${basePath}/splash_2.mp3`,
                        `${basePath}/splash_3.mp3`,
                        `${basePath}/splash_4.mp3`
                    ]
                }
            }
        }

        this.sound = {};

        this.soundController.setType(this.sound, 'dirt');
        this.soundPlaying = false;
    }

    getSound(audio_class) {
        if (!this.sound?.[audio_class]) return;
        const audioArray = this.sound[audio_class];

        const randIndex = Math.floor(Math.random() * audioArray.length);

        return new Audio(audioArray[randIndex]);
    }

    playSound(audio, volume = 1, cooldown = 0) {
        if (this.soundPlaying || !audio) return;
        this.soundPlaying = true;

        const cleanup = () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            this.soundPlaying = false;
        };

        const onTimeUpdate = () => {
            const progress = audio.currentTime / audio.duration;
            if (progress >= 0.25) {
                cleanup();
            }
        };

        const onEnded = () => {
            cleanup();
        };

        // Effects
        audio.volume = volume;

        // Listeners
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);

        // Play
        audio.play();
    }

    playSoundInteract(volume = 1) {
        return new Promise((resolve) => {
            const audio = this.getSound('interact');
            if (this.soundPlaying || !audio) {
                return resolve();
            }

            this.soundPlaying = true;

            const onTimeUpdate = () => {
                const progress = audio.currentTime / audio.duration;
                if (progress >= 0.25) {
                    audio.removeEventListener('timeupdate', onTimeUpdate);
                    this.soundPlaying = false;
                    resolve(); // resolve once 25% has played
                }
            };

            audio.addEventListener('timeupdate', onTimeUpdate);
            audio.volume = volume;
            audio.play();
        });
    }

    setStatus(status_value) {
        this.status = status_value;
        this.spriteSheetX = 16 * status_value;
    }

    interact(seletedItemID) {
        // No function
    }

    distanceFromBlock_euclidean(id, maxDist) {
        maxDist = maxDist ? maxDist: 8;
        
        const queue = [{neighbour_data: this.neighbour_data}];
        const og_x = this.x;
        const og_y = this.y;

        while (queue.length > 0) {

            const { neighbour_data } = queue.shift(); // Remove first element from queue

            for (const key in neighbour_data) {
                const neighbour = neighbour_data[key];

                if (!neighbour) continue;

                const new_x = neighbour.x;
                const new_y = neighbour.y;

                const new_dist = Math.max(Math.abs(new_x - og_x), Math.abs(new_y - og_y));

                if (new_dist > maxDist) {
                    return Infinity;
                }

                if (neighbour.id === id) {
                    return new_dist;
                }
    
                queue.push({neighbour_data: neighbour.neighbour_data});
            }
        }
    }

    distanceFromBlock(id, maxDist) {
        maxDist = maxDist ? maxDist: 8;
        
        const queue = [{neighbour_data: this.neighbour_data, dist: 0}];


        while (queue.length > 0) {

            const { neighbour_data, dist } = queue.shift(); // Remove first element from queue

            for (const key in neighbour_data) {
                const neighbour = neighbour_data[key];
                if (!neighbour) continue;

                const new_dist = dist + 1;

                if (new_dist > maxDist) {
                    return Infinity;
                }

                if (neighbour.id === id) {
                    return new_dist;
                }
    
                queue.push({neighbour_data: neighbour.neighbour_data, dist: new_dist});
            }
        }
    }

    randomBool_precise(chance) {
        const rand = Math.random() * 100;

        if (rand <= chance) {
            return true;
        }
        return false;
    }
}

class Block extends Meta {
    constructor(name, x, y, texture_location) {
        super(name, texture_location, 'block');
        this.x = x;
        this.y = y;

        this.break_block = false;
    }

    break() {
        /*
        this.spawnItems = this.itemDrop_id;
        this.onNextTick = {
            id: 0, // air
            properties: {}
        };
        */

        this.break_block = true;

    }
}

class Block_Solid extends Block {
    constructor(name, x, y, hardness, texture_location) {
        super(name, x, y, texture_location);
        this.type = 'solid';
        this.torchAffinity = true;
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
        this.viscosity = 0.5;
        this.sinkFactor = 0.3;
        this.transparency = 0.8;
        this.physics = true;

        this.liquid_spread = 8;
        this.source = true;

        this.touchCooldown = 4; // Number of ticks that must have passed for the liquid to be interacted with again
    }

    run_gametick_logic(tick) {
        if (tick - this.placedAt < this.touchCooldown) {
            this.untouchable = true;
        } else {
            this.untouchable = false;
        }
    }
}

class Block_water extends Block_Liquid {
    constructor(x, y) {
        super('water', x, y, './assets/textures/water.png');
        this.id = 13;

        this.spread_speed = 10;

        this.entityBound = false;

        this.requireClick_interact = true;

        this.soundController.setType(this.sound, 'water');
    }

    interact(seletedItemID) {
        if (seletedItemID === 50 && this.source && !this.untouchable) {
            this.playSound(this.getSound('interact'), 1, 0);
            this.removeItem = true;
            this.giveItem = {
                id: 51, // Water bucket
                quantity: 1
            }
            this.onNextTick = {
                id: 0, // Air
                properties: {}
            }
        }

    }
}



class Block_Air extends Block {
    constructor(x, y) {
        super('air', x, y, null);
        this.type = 'air';
        this.viscosity = 0;
        this.transparency = 1;

        this.id = 0;

        this.sound = null;
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

class Item_bread extends Item_food {
    constructor() {
        super('bread', './assets/items/bread.png');
        this.id = 66;

        this.nutrition = 5;
        this.consumption_cooldown = 30;
    }
}


// Farming & plants ----------------------------->

class Block_farmlandDry extends Block_Solid {
    constructor(x, y) {
        super('farmland_dry', x, y, 40, './assets/textures/farmland_dry.png');
        this.id = 14;
        this.itemDrop_id = [
            {id: 1, quantity: 1}
        ];

        this.decayChance = 1;
    }

    run_gametick_logic(tick) {        
        if (this.neighbour_data) {
            if (this.neighbour_data.up.type === 'solid' && this.neighbour_data.up.physics) {
                this.onNextTick = {
                    id: 1, // dirt
                    properties: {}
                }
            }
        }
        

        if (this.distanceFromBlock(13, 4) <= 4) {
            this.onNextTick = {
                id: 15, // wet farmland
                properties: {}
            }
        } else if (this.randomBool_precise(this.decayChance)) {
            this.onNextTick = {
                id: 1,
                properties: {}
            }
        }
    }
}

class Block_farmlandWet extends Block_Solid {
    constructor(x, y) {
        super('farmland_wet', x, y, 40, './assets/textures/farmland_wet.png');
        this.id = 15;
        this.itemDrop_id = [
            {id: 1, quantity: 1}
        ];

        this.dehydrationChance = 5;
    }

    run_gametick_logic(tick) {
        if (this.neighbour_data) {
            if (this.neighbour_data.up.type === 'solid' && this.neighbour_data.up.physics) {
                this.onNextTick = {
                    id: 1, // dirt
                    properties: {}
                }
            }
    
            if (this.distanceFromBlock(13, 5) > 4 && this.randomBool_precise(this.dehydrationChance)) {
                this.onNextTick = {
                    id: 14, // dry farmland
                    properties: {}
                }
            }
        }
    }
}

class Block_wheat extends Block_Solid {
    constructor(x, y) {
        super('wheat', x, y, 0, './assets/textures/wheat.png');
        this.id = 16;
        this.itemDrop_id = [
            {id: 40, quantity: 1}
        ];
        this.physics = false;

        this.growthChance = 0.1; //Percent chance of growth in a given tick
        this.maxGrowthState = 7;

        this.placeRequirements = {
            all: { // must follow all of these rules
                adjacent: [],

                left: [],
                right: [],
                top: [],
                bottom: [14, 15]
            },

            oneOf: []
        };

        this.minimumGrowthLight = 10;
        this.torchAffinity = false;
    }

    setStatus(status_value) {
        super.setStatus(status_value);

        if (status_value === 7) { // Full growth
            this.itemDrop_id = [
                {id: 40, quantity: 2},
                {id: 41, quantity: 1}
            ];
        }
    }

    run_gametick_logic(tick) {
        if (this.randomBool_precise(this.growthChance) && this.light >= this.minimumGrowthLight) {
            const growthState = this.status === this.maxGrowthState ? this.status: this.status + 1;
            this.setStatus(growthState);
        }
        
    }
}

class Item_wheatSeeds extends Item {
    constructor() {
        super('wheat_seeds', './assets/items/wheat_seeds.png');
        this.id = 40;
        this.placeBlock_id = 16;

    }
}

class Item_wheatBundle extends Item {
    constructor() {
        super('wheat_bundle', './assets/items/wheat_bundle.png');
        this.id = 41;

        this.fuel_value = 50;
    }
}

class Item_bucket extends Item {
    constructor() {
        super('bucket', './assets/items/bucket.png');
        this.id = 50;

        this.maxStackSize = 1;
    }
}

class Item_bucketWater extends Item {
    constructor() {
        super('bucket_water', './assets/items/bucket_water.png');
        this.id = 51;

        this.placeBlock_id = 13;
        this.giveItemUponPlace = 50;

        this.maxStackSize = 1;

        this.requireClick_interact = true;
    }
}

class Block_sapling extends Block_Solid {
    constructor(x, y) {
        super('sapling', x, y, 40, './assets/textures/sapling.png');
        this.id = 17;
        this.itemDrop_id = [
            {id: 17, quantity: 1}
        ];
        this.physics = false;

        this.growthChance = 0.1; //Percent chance of growth in a given tick
        this.maxGrowthState = 7;

        this.placeRequirements = {
            all: { // must follow all of these rules
                adjacent: [],

                left: [],
                right: [],
                top: [],
                bottom: [1, 2]
            },

            oneOf: []
        };

        this.minimumGrowthLight = 10;
        this.torchAffinity = false;
    }

    run_gametick_logic(tick) {
        if (this.randomBool_precise(this.growthChance) && this.light >= this.minimumGrowthLight) {
            this.growTree();
        }
    }

    growTree() {
        const blocks_template = [
            {id: 4, dx: 0, dy: 0, chance: 100},
            {id: 4, dx: 0, dy: 1, chance: 100},
            {id: 4, dx: 0, dy: 2, chance: 100},
            {id: 4, dx: 0, dy: 3, chance: 100},

            {id: 6, dx: -1, dy: 2, chance: 100},
            {id: 6, dx: -1, dy: 3, chance: 100},
            {id: 6, dx: -1, dy: 4, chance: 100},
            {id: 6, dx: 0, dy: 4, chance: 100},
            {id: 6, dx: 1, dy: 4, chance: 100},
            {id: 6, dx: 1, dy: 3, chance: 100},
            {id: 6, dx: 1, dy: 2, chance: 100},
            
            {id: 6, dx: -2, dy: 2, chance: 80},
            {id: 6, dx: -2, dy: 3, chance: 80},
            {id: 6, dx: -1, dy: 5, chance: 80},
            {id: 6, dx: 0, dy: 5, chance: 100},
            {id: 6, dx: 1, dy: 5, chance: 80},
            {id: 6, dx: 2, dy: 3, chance: 80},
            {id: 6, dx: 2, dy: 2, chance: 80},
        ];

        let blocks = [];

        // Calculate block positions
        for (let i = 0; i < blocks_template.length; i++) {
            if (this.utils.randomBool(blocks_template[i].chance)) {
                blocks.push(blocks_template[i]);
            }
        }

        // Tree may grow if all logs can be placed AND 3 or fewer leaves are obstructed
        const canGrow = (() => {
            let leaf_obstructions = 0;

            for (let i = 0; i < blocks.length; i++) {
                const blockID = blocks[i].id;

                // Use neighbour block interface to find the block information

                let dx = blocks[i].dx;
                let dy = blocks[i].dy;

                let focusBlock = this;

                while(Math.abs(dx) > 0) {
                    if (dx > 0) {// if positive
                        if (!focusBlock.neighbour_data?.right) return false;
                        focusBlock = focusBlock.neighbour_data.right;
                        
                        dx--;
                    }
                    if (dx < 0) {// if negative
                        if (!focusBlock.neighbour_data?.left) return false;
                        focusBlock = focusBlock.neighbour_data.left;
                        
                        dx++;
                    }
                }

                while(Math.abs(dy) > 0) {
                    if (dy > 0) {// if positive
                        if (!focusBlock.neighbour_data?.up) return false;
                        focusBlock = focusBlock.neighbour_data.up;
                        
                        dy--;
                    }
                    if (dy < 0) {// if negative
                        if (!focusBlock.neighbour_data?.down) return false;
                        focusBlock = focusBlock.neighbour_data.down;
                        
                        dy++;
                    }
                }

                if (focusBlock.id !== 0 && (focusBlock.x !== this.x && focusBlock.y !== this.y)) { //if not air & not current sapling
                    if (blockID === 4) { // do not allow tree to grow if log is obstructed
                        return false;
                    }

                    leaf_obstructions++;
                }
            }

            return leaf_obstructions <= 3;
        })();


        // Grow tree
        if (canGrow) {
            for (let i = 0; i < blocks.length; i++) {
                const blockID = blocks[i].id;

                // Use neighbour block interface to find the block information

                let dx = blocks[i].dx;
                let dy = blocks[i].dy;

                let focusBlock = this;

                while(Math.abs(dx) > 0) {
                    if (dx > 0) {// if positive
                        focusBlock = focusBlock.neighbour_data.right;
                        
                        dx--;
                    }
                    if (dx < 0) {// if negative
                        focusBlock = focusBlock.neighbour_data.left;
                        
                        dx++;
                    }
                }

                while(Math.abs(dy) > 0) {
                    if (dy > 0) {// if positive
                        focusBlock = focusBlock.neighbour_data.up;
                        
                        dy--;
                    }
                    if (dy < 0) {// if negative
                        focusBlock = focusBlock.neighbour_data.down;
                        
                        dy++;
                    }
                }

                if (focusBlock.id === 0 || (focusBlock.x === this.x && focusBlock.y === this.y)) { //if air or current sapling
                    focusBlock.onNextTick = {
                        id: blockID,
                        properties: {}
                    }
                }
            }
        }

    }
}


// Pickaxes ---------------------------->

class Item_pickaxe extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [3, 24, 26, 28, 30, 32]; //list of block IDs the tool breaks

        this.toolClass = 'pickaxe';
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

        this.toolClass = 'axe';
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
        this.purpose = [1, 2, 14, 15]; //list of block IDs the tool breaks

        this.toolClass = 'shovel';
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

// Swords ---------------------------->

class Item_sword extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = [6, 7]; //list of block IDs the tool breaks

        this.toolClass = 'sword';
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

// Hoes ---------------------------->

class Item_hoe extends Tool {
    constructor(name, texture_location) {
        super(name, texture_location);
        this.purpose = []; //list of block IDs the tool breaks

        this.toolClass = 'hoe';
    }
}

class Item_woodenHoe extends Item_hoe {
    constructor() {
        super('wooden_hoe', './assets/items/wooden_hoe.png');
        this.id = 153;
        this.durability = 32;

        this.strength = 2;
        this.damage = 1;

        this.fuel_value = 200;
    }
}

class Item_stoneHoe extends Item_hoe {
    constructor() {
        super('stone_hoe', './assets/items/stone_hoe.png');
        this.id = 154;
        this.durability = 64;

        this.strength = 3;
        this.damage = 2;
    }
}

class Item_copperHoe extends Item_hoe {
    constructor() {
        super('copper_hoe', './assets/items/copper_hoe.png');
        this.id = 155;
        this.durability = 192;

        this.strength = 5;
        this.damage = 2;
    }
}

class Item_goldenHoe extends Item_hoe {
    constructor() {
        super('golden_hoe', './assets/items/golden_hoe.png');
        this.id = 156;
        this.durability = 96;

        this.strength = 7;
        this.damage = 2;
    }
}

class Item_ironHoe extends Item_hoe {
    constructor() {
        super('iron_hoe', './assets/items/iron_hoe.png');
        this.id = 157;
        this.durability = 256;

        this.strength = 6;
        this.damage = 3;
    }
}

class Item_diamondHoe extends Item_hoe {
    constructor() {
        super('diamond_hoe', './assets/items/diamond_hoe.png');
        this.id = 158;
        this.durability = 1024;

        this.strength = 8;
        this.damage = 4;
    }
}


// ARMOUR ----------------------------------------->

class Item_Armour extends Item {
    constructor(name, texture_location) {
        super(name, texture_location);
        
        this.armour = 0; // armour bars
        this.maxStackSize = 1;
    }
}

class Item_Boots extends Item_Armour {
    constructor(name, texture_location) {
        super(name, texture_location);

        this.armourType = 'boots';
    }
}

class Item_Leggings extends Item_Armour {
    constructor(name, texture_location) {
        super(name, texture_location);

        this.armourType = 'leggings';
    }
}

class Item_Chestplate extends Item_Armour {
    constructor(name, texture_location) {
        super(name, texture_location);

        this.armourType = 'chestplate';
    }
}

class Item_Helmet extends Item_Armour {
    constructor(name, texture_location) {
        super(name, texture_location);

        this.armourType = 'helmet';
    }
}

// Copper

class Item_copperBoots extends Item_Boots {
    constructor() {
        super('copper_boots', './assets/items/copper_boots.png');

        this.id = 170;
        this.durability = 192;

        this.armour = 2;
    }
}

class Item_copperLeggings extends Item_Leggings {
    constructor() {
        super('copper_leggings', './assets/items/copper_leggings.png');

        this.id = 171;
        this.durability = 192;

        this.armour = 2;
    }
}

class Item_copperChestplate extends Item_Chestplate {
    constructor() {
        super('copper_chestplate', './assets/items/copper_chestplate.png');

        this.id = 172;
        this.durability = 192;

        this.armour = 3;
    }
}

class Item_copperHelmet extends Item_Helmet {
    constructor() {
        super('copper_helmet', './assets/items/copper_helmet.png');

        this.id = 173;
        this.durability = 192;

        this.armour = 2;
    }
}

// Gold

class Item_goldenBoots extends Item_Boots {
    constructor() {
        super('golden_boots', './assets/items/golden_boots.png');

        this.id = 174;
        this.durability = 96;

        this.armour = 2;
    }
}

class Item_goldenLeggings extends Item_Leggings {
    constructor() {
        super('golden_leggings', './assets/items/golden_leggings.png');

        this.id = 175;
        this.durability = 96;

        this.armour = 2;
    }
}

class Item_goldenChestplate extends Item_Chestplate {
    constructor() {
        super('golden_chestplate', './assets/items/golden_chestplate.png');

        this.id = 176;
        this.durability = 96;

        this.armour = 3;
    }
}

class Item_goldenHelmet extends Item_Helmet {
    constructor() {
        super('golden_helmet', './assets/items/golden_helmet.png');

        this.id = 177;
        this.durability = 96;

        this.armour = 2;
    }
}

// Iron

class Item_ironBoots extends Item_Boots {
    constructor() {
        super('iron_boots', './assets/items/iron_boots.png');

        this.id = 178;
        this.durability = 256;

        this.armour = 2;
    }
}

class Item_ironLeggings extends Item_Leggings {
    constructor() {
        super('iron_leggings', './assets/items/iron_leggings.png');

        this.id = 179;
        this.durability = 256;

        this.armour = 5;
    }
}

class Item_ironChestplate extends Item_Chestplate {
    constructor() {
        super('iron_chestplate', './assets/items/iron_chestplate.png');

        this.id = 180;
        this.durability = 256;

        this.armour = 6;
    }
}

class Item_ironHelmet extends Item_Helmet {
    constructor() {
        super('iron_helmet', './assets/items/iron_helmet.png');

        this.id = 181;
        this.durability = 256;

        this.armour = 2;
    }
}

// Diamond

class Item_diamondBoots extends Item_Boots {
    constructor() {
        super('diamond_boots', './assets/items/diamond_boots.png');

        this.id = 182;
        this.durability = 1024;

        this.armour = 3;
    }
}

class Item_diamondLeggings extends Item_Leggings {
    constructor() {
        super('diamond_leggings', './assets/items/diamond_leggings.png');

        this.id = 183;
        this.durability = 1024;

        this.armour = 6;
    }
}

class Item_diamondChestplate extends Item_Chestplate {
    constructor() {
        super('diamond_chestplate', './assets/items/diamond_chestplate.png');

        this.id = 184;
        this.durability = 1024;

        this.armour = 8;
    }
}

class Item_diamondHelmet extends Item_Helmet {
    constructor() {
        super('diamond_helmet', './assets/items/diamond_helmet.png');

        this.id = 185;
        this.durability = 1024;

        this.armour = 3;
    }
}

// BLOCKS ----------------------------------------->

class Block_dirt extends Block_Solid {
    constructor(x, y) {
        super('dirt', x, y, 40, './assets/textures/dirt.png');
        this.id = 1;
        this.itemDrop_id = [
            {id: 1, quantity: 1}
        ];

        this.grassGrowthChance = 1;
    }

    interact(seletedItemID) {
        const toolClass = this.item_directory.getProperty(seletedItemID, 'toolClass');

        if (toolClass === 'hoe') {
            this.onNextTick = {
                id: 14, // dry farmland
                properties: {}
            };
            this.decrementDurability = true;
        }

    }

    run_gametick_logic(tick) {
        if (
            this.distanceFromBlock_euclidean(2, 6) === 1 &&
            this.neighbour_data.up.type !== 'solid' &&
            this.neighbour_data.up.type !== 'liquid' &&

            this.randomBool_precise(this.grassGrowthChance)
        ) {
            this.onNextTick = {
                id: 2, // dry farmland
                properties: {}
            }
        }
    }


}

class Block_grass extends Block_Solid {
    constructor(x, y) {
        super('grass', x, y, 60, './assets/textures/grass.png');
        this.id = 2;
        this.itemDrop_id = [
            {id: 1, quantity: 1}
        ];

        this.getSeedChance = 20; //Percent chance of getting a seed when interacted with by a hoe
    }

    interact(seletedItemID) {
        const toolClass = this.item_directory.getProperty(seletedItemID, 'toolClass');

        if (toolClass === 'hoe') {
            this.onNextTick = {
                id: 14, // dry farmland
                properties: {}
            };

            const rand = Math.random() * 100;

            if (rand <= this.getSeedChance) {
                this.spawnItems = [{
                    id: 40,
                    quantity: 2
                }];
            }
            this.decrementDurability = true;
        }

    }

    run_gametick_logic(tick) {
        if (this.neighbour_data) {
            if (this.neighbour_data.up.type === 'solid' && this.neighbour_data.up.physics) {
                this.onNextTick = {
                    id: 1, // dirt
                    properties: {}
                }
            }
        }
    }
}

class Block_stone extends Block_Solid {
    constructor(x, y) {
        super('stone', x, y, 100, './assets/textures/stone.png');
        this.id = 3;
        this.itemDrop_id = [
            {id: 23, quantity: 1}
        ];

        this.soundController.setType(this.sound, 'stone');
    }
}

class Block_cobblestone extends Block_Solid {
    constructor(x, y) {
        super('cobblestone', x, y, 120, './assets/textures/cobblestone.png');
        this.id = 23;
        this.itemDrop_id = [
            {id: 23, quantity: 1}
        ];

        this.furnace_result = 3; //ID of smelted item

        this.soundController.setType(this.sound, 'stone');
    }
}

class Block_treeLog extends Block_Solid {
    constructor(x, y) {
        super('tree_log', x, y, 100, './assets/textures/log.png');
        this.id = 4;
        this.itemDrop_id = [
            {id: 5, quantity: 1}
        ];
        this.physics = false;
        this.transparency = 1;

        this.fuel_value = 400;

        this.soundController.setType(this.sound, 'wood');
    }
}

class Block_log extends Block_Solid {
    constructor(x, y) {
        super('log', x, y, 100, './assets/textures/log.png');
        this.id = 5;
        this.itemDrop_id = [
            {id: 5, quantity: 1}
        ];

        this.fuel_value = 400;
        this.furnace_result = 25;

        this.soundController.setType(this.sound, 'wood');
    }
}

class Block_treeLeaves extends Block_Solid {
    constructor(x, y) {
        super('tree_leaves', x, y, 15, './assets/textures/leaves.png');
        this.id = 6;
        this.itemDrop_id = [
            {id: 17, quantity: 1, chance: 15}
        ];
        this.physics = false;
        this.transparency = 1;

        this.fuel_value = 50;
        this.decayChance = 0.5; // Per tick

        this.decayRange = 3;
    }

    run_gametick_logic(tick) {
        const distFromTreeLog = this.distanceFromBlock(4, 4);

        if (distFromTreeLog > this.decayRange && this.randomBool_precise(this.decayChance)) {
            this.break();
        }
    }
}

class Block_leaves extends Block_Solid {
    constructor(x, y) {
        super('leaves', x, y, 15, './assets/textures/leaves.png');
        this.id = 7;
        this.itemDrop_id = [
            {id: 17, quantity: 1, chance: 15}
        ];

        this.fuel_value = 50;
    }
}

class Block_planks extends Block_Solid {
    constructor(x, y) {
        super('planks', x, y, 60, './assets/textures/planks.png');
        this.id = 8;
        this.itemDrop_id = [
            {id: 8, quantity: 1}
        ];

        this.fuel_value = 300;

        this.soundController.setType(this.sound, 'wood');
    }
}

class Block_torch extends Block_Solid {
    constructor(x, y) {
        super('torch', x, y, 1, './assets/textures/torch.png');
        this.id = 12;
        this.itemDrop_id = [
            {id: 12, quantity: 1}
        ];
        this.physics = false;
        this.transparency = 1;

        this.light_source = 15;
        this.spriteSheetX = 0;

        this.entityBound = false;

        this.placeRequirements = {
                
            all: { // must follow all of these rules
                adjacent: [],

                left: [],
                right: [],
                top: [],
                bottom: [],
            },

            oneOf: [ // must follow one of these rules: ex. [{left: [2]}, {right: 2}] => either left or right neighbour must have id = 2
                {
                    left: [{property: true, key: 'torchAffinity', value: true}]
                },
                {
                    right: [{property: true, key: 'torchAffinity', value: true}]
                },
                {
                    bottom: [{property: true, key: 'torchAffinity', value: true}]
                }
            ]
        }

        this.torchAffinity = false;
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
        this.itemDrop_id = [
            {id: 25, quantity: 1}
        ];

        this.furnace_result = 25;

        this.soundController.setType(this.sound, 'stone');
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
        this.itemDrop_id = [
            {id: 26, quantity: 1}
        ];

        this.furnace_result = 27;

        this.soundController.setType(this.sound, 'stone');
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
        this.itemDrop_id = [
            {id: 28, quantity: 1}
        ];

        this.furnace_result = 29;

        this.soundController.setType(this.sound, 'stone');
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
        this.itemDrop_id = [
            {id: 30, quantity: 1}
        ];

        this.furnace_result = 31;

        this.soundController.setType(this.sound, 'stone');
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
        this.itemDrop_id = [
            {id: 33, quantity: 1}
        ];

        this.furnace_result = 33;

        this.soundController.setType(this.sound, 'stone');
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
        this.itemDrop_id = [
            {id: 9, quantity: 1}
        ];

        this.inventory = new Inventory();
        this.physics = false;
        this.interactive = true;

        this.soundController.setType(this.sound, 'wood');
    }
}

class Block_craftingTable extends Block_Solid {
    constructor(x, y) {
        super('crafting_table', x, y, 40, './assets/textures/crafting_table.png');
        this.id = 10;
        this.itemDrop_id = [
            {id: 10, quantity: 1}
        ];

        this.inventory = new Inventory();
        this.physics = false;
        this.interactive = true;

        this.soundController.setType(this.sound, 'wood');
    }
}

class Block_furnace extends Block_Solid {
    constructor(x, y) {
        super('furnace', x, y, 40, './assets/textures/furnace_unlit.png');
        this.id = 11;
        this.itemDrop_id = [
            {id: 11, quantity: 1}
        ];

        this.inventory = new Inventory();
        this.physics = false;
        this.interactive = true;

        this.og_fuelPoints = 0;
        this.fuelPoints = 0; //in ticks;

        this.fuel_efficiency_percent = 100;
        this.efficiency = 200; //required process points to smelt an item
        
        this.processPoints = 0; //in ticks

        this.soundController.setType(this.sound, 'stone');
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

class Block_bedrock extends Block_Solid {
    constructor(x, y) {
        super('bedrock', x, y, Infinity, './assets/textures/bedrock.png');
        this.id = 200;
        this.itemDrop_id = [
            {id: 200, quantity: 1}
        ];

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
            '14': Block_farmlandDry,
            '15': Block_farmlandWet,
            '16': Block_wheat,
            '17': Block_sapling,

            '23': Block_cobblestone,
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

            '40': Item_wheatSeeds,
            '41': Item_wheatBundle,
            '50': Item_bucket,
            '51': Item_bucketWater,

            '64': Item_pork,
            '65': Item_porkCooked,
            '66': Item_bread,

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
            '152': Item_diamondSword,

            '153': Item_woodenHoe,
            '154': Item_stoneHoe,
            '155': Item_copperHoe,
            '156': Item_goldenHoe,
            '157': Item_ironHoe,
            '158': Item_diamondHoe,

            '170': Item_copperBoots,
            '171': Item_copperLeggings,
            '172': Item_copperChestplate,
            '173': Item_copperHelmet,

            '174': Item_goldenBoots,
            '175': Item_goldenLeggings,
            '176': Item_goldenChestplate,
            '177': Item_goldenHelmet,

            '178': Item_ironBoots,
            '179': Item_ironLeggings,
            '180': Item_ironChestplate,
            '181': Item_ironHelmet,

            '182': Item_diamondBoots,
            '183': Item_diamondLeggings,
            '184': Item_diamondChestplate,
            '185': Item_diamondHelmet,

            '200': Block_bedrock
        }
    }

    getProperty(id, property) {
        if (!this.item[id]) return;

        const itemClass = this.item[id];
        const itemInstance = new itemClass;

        return itemInstance[property];
    }

    getItemsWithProperty(property) {
        let itemIDs = [];
        for (const id in this.item) {
            const itemClass = this.item[id];
            if (!itemClass) continue;
    
            const itemInstance = new itemClass();
            if (itemInstance[property]) {
                itemIDs.push(id);
            }
        }

        return itemIDs;
    }

    getItemsWithPropertyAndValue(property, value) {
        const itemsWithProperty = this.getItemsWithProperty(property);

        let items = [];

        for (let i = 0; i < itemsWithProperty.length; i++) {
            const item = itemsWithProperty[i];

            if (this.getProperty(item, property) === value) {
                items.push(item);
            }
        }

        return items;
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