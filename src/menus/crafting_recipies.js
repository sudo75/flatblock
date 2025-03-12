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

    { //2 planks => 4 sticks
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

    { //3 planks + 2 sticks => 1 wooden picaxe
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

    { //3 stone + 2 sticks => 1 stone picaxe
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

    { //3 stone + 2 sticks => 1 wooden axe
        result: 131,
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

    { //3 stone + 2 sticks => 1 stone axe
        result: 132,
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
    }
];

export { recipies };