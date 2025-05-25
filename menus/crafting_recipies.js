const recipies = [
    { // 1 log => 4 planks
        result: 8,
        quantity: 4,
        recipie: [
            [
                [4, null, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, 4, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, 4],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [4, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, 4, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, 4],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [4, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, 4, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, null, 4]
            ],
            [
                [5, null, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, 5, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, 5],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [5, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, 5, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, 5],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [5, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, 5, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, null, 5]
            ]
        ]
    },

    { // 2 planks => 4 sticks
        result: 128,
        quantity: 4,
        recipie: [
            [
                [8, null, null],
                [8, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [8, null, null],
                [8, null, null]
            ],
            [
                [null, 8, null],
                [null, 8, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, 8, null],
                [null, 8, null]
            ],
            [
                [null, null, 8],
                [null, null, 8],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, 8],
                [null, null, 8]
            ]
        ]
    },

    { // 8 planks => 1 chest
        result: 9,
        quantity: 1,
        recipie: [
            [
                [8, 8, 8],
                [8, null, 8],
                [8, 8, 8]
            ]
        ]
    },

    { // 8 stone => 1 furnace
        result: 11,
        quantity: 1,
        recipie: [
            [
                [3, 3, 3],
                [3, null, 3],
                [3, 3, 3]
            ]
        ]
    },

    { // 4 planks => 1 crafting table
        result: 10,
        quantity: 1,
        recipie: [
            [
                [8, 8, null],
                [8, 8, null],
                [null, null, null]
            ],
            [
                [null, 8, 8],
                [null, 8, 8],
                [null, null, null]
            ],
            [
                [null, null, null],
                [8, 8, null],
                [8, 8, null]
            ],
            [
                [null, null, null],
                [null, 8, 8],
                [null, 8, 8]
            ]
        ]
    },

    { // 1 stick + 1 coal => 4 torches
        result: 12,
        quantity: 4,
        recipie: [
            [
                [25, null, null],
                [128, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [25, null, null],
                [128, null, null]
            ],
            [
                [null, 25, null],
                [null, 128, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, 25, null],
                [null, 128, null]
            ],
            [
                [null, null, 25],
                [null, null, 128],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, 25],
                [null, null, 128]
            ]
        ]
    },


    // PICKAXES --------------------------->

    { // 3 planks + 2 sticks => 1 wooden pickaxe
        result: 129,
        quantity: 1,
        recipie: [
            [
                [8, 8, 8],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 3 stone + 2 sticks => 1 stone pickaxe
        result: 130,
        quantity: 1,
        recipie: [
            [
                [3, 3, 3],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 3 copper + 2 sticks => 1 copper pickaxe
        result: 131,
        quantity: 1,
        recipie: [
            [
                [27, 27, 27],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 3 gold + 2 sticks => 1 golden pickaxe
        result: 132,
        quantity: 1,
        recipie: [
            [
                [29, 29, 29],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 3 iron + 2 sticks => 1 iron pickaxe
        result: 133,
        quantity: 1,
        recipie: [
            [
                [31, 31, 31],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 3 diamonds + 2 sticks => 1 diamond pickaxe
        result: 134,
        quantity: 1,
        recipie: [
            [
                [33, 33, 33],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    // AXES --------------------------->

    { // 3 planks + 2 sticks => 1 wooden axe
        result: 135,
        quantity: 1,
        recipie: [
            [
                [8, 8, null],
                [8, 128, null],
                [null, 128, null]
            ],
            [
                [null, 8, 8],
                [null, 128, 8],
                [null, 128, null]
            ]
        ]
    },

    { // 3 stone + 2 sticks => 1 stone axe
        result: 136,
        quantity: 1,
        recipie: [
            [
                [3, 3, null],
                [3, 128, null],
                [null, 128, null]
            ],
            [
                [null, 3, 3],
                [null, 128, 3],
                [null, 128, null]
            ]
        ]
    },

    { // 3 copper + 2 sticks => 1 copper axe
        result: 137,
        quantity: 1,
        recipie: [
            [
                [27, 27, null],
                [27, 128, null],
                [null, 128, null]
            ],
            [
                [null, 27, 27],
                [null, 128, 27],
                [null, 128, null]
            ]
        ]
    },

    { // 3 gold + 2 sticks => 1 golden axe
        result: 138,
        quantity: 1,
        recipie: [
            [
                [29, 29, null],
                [29, 128, null],
                [null, 128, null]
            ],
            [
                [null, 29, 29],
                [null, 128, 29],
                [null, 128, null]
            ]
        ]
    },

    { // 3 iron + 2 sticks => 1 iron axe
        result: 139,
        quantity: 1,
        recipie: [
            [
                [31, 31, null],
                [31, 128, null],
                [null, 128, null]
            ],
            [
                [null, 31, 31],
                [null, 128, 31],
                [null, 128, null]
            ]
        ]
    },

    { // 3 diamonds + 2 sticks => 1 diamond axe
        result: 140,
        quantity: 1,
        recipie: [
            [
                [33, 33, null],
                [33, 128, null],
                [null, 128, null]
            ],
            [
                [null, 33, 33],
                [null, 128, 33],
                [null, 128, null]
            ]
        ]
    },

    // SHOVELS --------------------------->

    { // 1 planks + 2 sticks => 1 wooden shovel
        result: 141,
        quantity: 1,
        recipie: [
            [
                [8, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 8, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 8],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    { // 1 stone + 2 sticks => 1 stone shovel
        result: 142,
        quantity: 1,
        recipie: [
            [
                [3, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 3, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 3],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    { // 1 copper + 2 sticks => 1 copper shovel
        result: 143,
        quantity: 1,
        recipie: [
            [
                [27, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 27, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 27],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    { // 1 gold + 2 sticks => 1 golden shovel
        result: 144,
        quantity: 1,
        recipie: [
            [
                [29, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 29, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 29],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    { // 1 iron + 2 sticks => 1 iron shovel
        result: 145,
        quantity: 1,
        recipie: [
            [
                [31, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 31, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 31],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    { // 1 diamonds + 2 sticks => 1 diamond shovel
        result: 146,
        quantity: 1,
        recipie: [
            [
                [33, null, null],
                [128, null, null],
                [128, null, null]
            ],
            [
                [null, 33, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, null, 33],
                [null, null, 128],
                [null, null, 128]
            ]
        ]
    },

    // SWORDS --------------------------->

    { // 2 planks + 1 sticks => 1 wooden sword
        result: 147,
        quantity: 1,
        recipie: [
            [
                [8, null, null],
                [8, null, null],
                [128, null, null]
            ],
            [
                [null, 8, null],
                [null, 8, null],
                [null, 128, null]
            ],
            [
                [null, null, 8],
                [null, null, 8],
                [null, null, 128]
            ]
        ]
    },

    { // 2 stone + 1 sticks => 1 stone sword
        result: 148,
        quantity: 1,
        recipie: [
            [
                [3, null, null],
                [3, null, null],
                [128, null, null]
            ],
            [
                [null, 3, null],
                [null, 3, null],
                [null, 128, null]
            ],
            [
                [null, null, 3],
                [null, null, 3],
                [null, null, 128]
            ]
        ]
    },

    { // 2 copper + 1 sticks => 1 copper sword
        result: 149,
        quantity: 1,
        recipie: [
            [
                [27, null, null],
                [27, null, null],
                [128, null, null]
            ],
            [
                [null, 27, null],
                [null, 27, null],
                [null, 128, null]
            ],
            [
                [null, null, 27],
                [null, null, 27],
                [null, null, 128]
            ]
        ]
    },

    { // 2 gold + 1 sticks => 1 golden sword
        result: 150,
        quantity: 1,
        recipie: [
            [
                [29, null, null],
                [29, null, null],
                [128, null, null]
            ],
            [
                [null, 29, null],
                [null, 29, null],
                [null, 128, null]
            ],
            [
                [null, null, 29],
                [null, null, 29],
                [null, null, 128]
            ]
        ]
    },

    { // 2 iron + 1 sticks => 1 iron sword
        result: 151,
        quantity: 1,
        recipie: [
            [
                [31, null, null],
                [31, null, null],
                [128, null, null]
            ],
            [
                [null, 31, null],
                [null, 31, null],
                [null, 128, null]
            ],
            [
                [null, null, 31],
                [null, null, 31],
                [null, null, 128]
            ]
        ]
    },

    { // 2 diamonds + 1 sticks => 1 diamond sword
        result: 152,
        quantity: 1,
        recipie: [
            [
                [33, null, null],
                [33, null, null],
                [128, null, null]
            ],
            [
                [null, 33, null],
                [null, 33, null],
                [null, 128, null]
            ],
            [
                [null, null, 33],
                [null, null, 33],
                [null, null, 128]
            ]
        ]
    },

    // HOES --------------------------->

    { // 2 planks + 2 sticks => 1 wooden hoe
        result: 153,
        quantity: 1,
        recipie: [
            [
                [8, 8, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 8, 8],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 2 stone + 2 sticks => 1 stone hoe
        result: 154,
        quantity: 1,
        recipie: [
            [
                [3, 3, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 3, 3],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 2 copper + 2 sticks => 1 copper hoe
        result: 155,
        quantity: 1,
        recipie: [
            [
                [27, 27, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 27, 27],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 2 gold + 2 sticks => 1 golden hoe
        result: 156,
        quantity: 1,
        recipie: [
            [
                [29, 29, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 29, 29],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 2 iron + 2 sticks => 1 iron hoe
        result: 157,
        quantity: 1,
        recipie: [
            [
                [31, 31, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 31, 31],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    { // 2 diamonds + 2 sticks => 1 diamond hoe
        result: 158,
        quantity: 1,
        recipie: [
            [
                [33, 33, null],
                [null, 128, null],
                [null, 128, null]
            ],
            [
                [null, 33, 33],
                [null, 128, null],
                [null, 128, null]
            ]
        ]
    },

    // Other -------------------------->

    { // 3 wheat => 1 bread
        result: 66,
        quantity: 1,
        recipie: [
            [
                [41, 41, 41],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [41, 41, 41],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [41, 41, 41]
            ]
        ]
    },

    { // 3 iron => 1 bucket
        result: 50,
        quantity: 1,
        recipie: [
            [
                [31, null, 31],
                [null, 31, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [31, null, 31],
                [null, 31, null]
            ]
        ]
    },

    // Boots

    { // 4 copper => 1 copper boots
        result: 170,
        quantity: 1,
        recipie: [
            [
                [27, null, 27],
                [27, null, 27],
                [null, null, null]
            ],
            [
                [null, null, null],
                [27, null, 27],
                [27, null, 27]
            ]
        ]
    },

    { // 4 gold => 1 golden boots
        result: 174,
        quantity: 1,
        recipie: [
            [
                [29, null, 29],
                [29, null, 29],
                [null, null, null]
            ],
            [
                [null, null, null],
                [29, null, 29],
                [29, null, 29]
            ]
        ]
    },

    { // 4 gold => 1 iron boots
        result: 178,
        quantity: 1,
        recipie: [
            [
                [31, null, 31],
                [31, null, 31],
                [null, null, null]
            ],
            [
                [null, null, null],
                [31, null, 31],
                [31, null, 31]
            ]
        ]
    },

    { // 4 gold => 1 diamond boots
        result: 182,
        quantity: 1,
        recipie: [
            [
                [33, null, 33],
                [33, null, 33],
                [null, null, null]
            ],
            [
                [null, null, null],
                [33, null, 33],
                [33, null, 33]
            ]
        ]
    },

    // Leggings

    { // 7 copper => 1 copper leggings
        result: 171,
        quantity: 1,
        recipie: [
            [
                [27, 27, 27],
                [27, null, 27],
                [27, null, 27]
            ]
        ]
    },

    { // 7 gold => 1 golden leggings
        result: 175,
        quantity: 1,
        recipie: [
            [
                [29, 29, 29],
                [29, null, 29],
                [29, null, 29]
            ]
        ]
    },

    { // 7 gold => 1 iron leggings
        result: 179,
        quantity: 1,
        recipie: [
            [
                [31, 31, 31],
                [31, null, 31],
                [31, null, 31]
            ]
        ]
    },

    { // 7 gold => 1 diamond leggings
        result: 183,
        quantity: 1,
        recipie: [
            [
                [33, 33, 33],
                [33, null, 33],
                [33, null, 33]
            ]
        ]
    },

    // Chestplates

    { // 8 copper => 1 copper chestplate
        result: 172,
        quantity: 1,
        recipie: [
            [
                [27, null, 27],
                [27, 27, 27],
                [27, 27, 27]
            ]
        ]
    },

    { // 8 gold => 1 golden chestplate
        result: 176,
        quantity: 1,
        recipie: [
            [
                [29, null, 29],
                [29, 29, 29],
                [29, 29, 29]
            ]
        ]
    },

    { // 8 gold => 1 iron chestplate
        result: 180,
        quantity: 1,
        recipie: [
            [
                [31, null, 31],
                [31, 31, 31],
                [31, 31, 31]
            ]
        ]
    },

    { // 8 gold => 1 diamond chestplate
        result: 184,
        quantity: 1,
        recipie: [
            [
                [33, null, 33],
                [33, 33, 33],
                [33, 33, 33]
            ]
        ]
    },

    // Helmets

    { // 5 copper => 1 copper helmet
        result: 173,
        quantity: 1,
        recipie: [
            [
                [27, 27, 27],
                [27, null, 27],
                [null, null, null]
            ],
            [
                [null, null, null],
                [27, 27, 27],
                [27, null, 27]
            ]
        ]
    },

    { // 5 gold => 1 golden helmet
        result: 177,
        quantity: 1,
        recipie: [
            [
                [29, 29, 29],
                [29, null, 29],
                [null, null, null]
            ],
            [
                [null, null, null],
                [29, 29, 29],
                [29, null, 29]
            ]
        ]
    },

    { // 5 gold => 1 iron helmet
        result: 181,
        quantity: 1,
        recipie: [
            [
                [31, 31, 31],
                [31, null, 31],
                [null, null, null]
            ],
            [
                [null, null, null],
                [31, 31, 31],
                [31, null, 31]
            ]
        ]
    },

    { // 5 gold => 1 diamond helmet
        result: 185,
        quantity: 1,
        recipie: [
            [
                [33, 33, 33],
                [33, null, 33],
                [null, null, null]
            ],
            [
                [null, null, null],
                [33, 33, 33],
                [33, null, 33]
            ]
        ]
    },

];

export { recipies };