export class OreTable {
    constructor(game, seed) {
        this.game = game;
        this.seed = seed;
        this.seed2 = {
            coal_ore: 45.1,
            copper_ore: 999.76543,
            iron_ore: 95353.4,
            gold_ore: 0.976,
            diamond_ore: 740
        };

        this.calc = this.game.calculator;

        this.table = this.generateTable();
        this.oreOrder = ['coal_ore', 'copper_ore', 'iron_ore', 'gold_ore', 'diamond_ore'];
    }

    generateTable() {
        let table = {};

        for (let y = 0; y < this.game.level.properties.height_blocks; y++) {
            table[y] = {
                'coal_ore': {
                    frequency: 6 - y / 10 //as a percent
                },
                'copper_ore': {
                    frequency: 6 - y / 10
                },
                'iron_ore': {
                    frequency: 5 - y / 10
                },
                'gold_ore': {
                    frequency: 4 - y / 8
                },
                'diamond_ore': {
                    frequency: 4 - y / 5
                }
            }
        }
        
        return table;
    }

    isOreType_id(x, y) {
        const tableSegment = this.table[y];
        for (let oreName of this.oreOrder) {
            const frequency = tableSegment[oreName].frequency;
            
            const seed2 = this.seed2[oreName];
            const isOre = this.calc.randomBoolByTwoSeeds(this.seed, seed2 * (x * 0.5 + y * 8.1), frequency);

            if (isOre) {
                return this.game.item_directory.getIDByName(oreName);
            }
        }

        return undefined;
    }

}