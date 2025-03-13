class Calc_World {
    constructor(game) {
        this.game = game;
    }

    hardRoundDown(number) {
        if (number % 1 === 0) { // Check if the number is whole
            return number - 1;
        }
        return Math.floor(number);
    }

    getLoadedChunks() {
        const minX = Math.floor(this.getRenderingCornerstones().leftmost_blockX);
        const maxX = Math.floor(this.getRenderingCornerstones().rightmost_blockX);
        
        let chunks = [];
        for (let x = minX; x < maxX; x++) {
            const chunkID = this.getChunkID(x);
            if (!chunks.includes(chunkID) && this.isWithinWorldBounds(x, 0)) {
                chunks.push(chunkID);
            }
        }

        return chunks;
    }

    getChunkID(x) {
        const chunkID = Math.floor(x / this.game.level.chunk_size);
        return chunkID;
    }

    randomBool(chance) {
        const rand = Math.ceil(Math.random() * 100);

        if (rand <= chance) {
            return true;
        }
        return false;
    }

    randomBoolBySeed(seed, chance) { //in percent
        const a = 1664525;
        const c = 1013904223;
        const m = 2 ** 31;
    
        const result = (seed * a + c) % m;
        const result_normalised = (result / m) * 100;
    
        if (result_normalised <= chance) {
            return true;
        }
        return false;
    }

    randomBoolByTwoSeeds(seed, seed2, chance) { //in percent
        if (seed < 0) {
            seed *= -3.14;
        }
        if (seed2 < 0) {
            seed2 *= -3.14;
        }
        
        seed = Math.log10(seed);
        seed2 = Math.log10(seed2);
        
        const a = 101;
        const c = 1001;
        const m = 2 ** 12;
    
        const ampl1 = Math.log10(seed);
        const freq1 = (1 / c) * seed;
        const hori1 = a * c * seed;
    
        const result1 = ampl1 * Math.sin(freq1 * ((seed) + hori1)) + a * c;
        
        const ampl2 = a * seed2 + c;
        const freq2 = seed2 / 10;
        const hori2 = a * c * seed;
        const result2 = ampl2 * Math.sin(freq2 * ((seed2) + hori2));
    
        const result = (result1 * a + c * result2) % m;
    
        const result_normalised = (result / m) * 100;
    
        if (result_normalised <= chance) {
            return true;
        }
        return false;
    }

    deepCloneObj(obj) {
        const deepCopy = structuredClone(obj);

        return deepCopy;
    }

    getBlockByRealXY(real_x, real_y) {
        const x = Math.floor(real_x / this.game.block_size + this.game.renderer.leftmost_blockX);
        const y = Math.floor((this.game.height - real_y) / this.game.block_size + this.game.renderer.bottommost_blockY);

        return {x: x, y: y};
    }

    hasPhysics(x, y) {
        if (!this.isWithinWorldBounds(x, y)) return false;
        const block_data = this.getBlockData(x, y);

        if (block_data.physics) {
            return true;
        } else {
            return false;
        }
    }

    isSolidBlock(x, y) {
        if (!this.isWithinWorldBounds(x, y)) return false;
        const block_data = this.getBlockData(x, y);

        if (block_data.type === 'solid') {
            return true;
        } else {
            return false;
        }
    }

    getRelativeX(x) {
        const chunkSize = this.game.level.chunk_size;
        const relativeX = (x % chunkSize + chunkSize) % chunkSize; // X-value relative to chunk

        return relativeX;
    }

    getAbsoluteX(relativeX, chunkID) {
        const absoluteX = this.game.level.chunk_size * chunkID + relativeX;

        return absoluteX;
    }

    getBlockData(x, y) {
        const chunkID = this.getChunkID(x);
        const relativeX = this.getRelativeX(x);

        const block_data = this.game.level.data[chunkID].block_data[relativeX][y];
        return block_data;
    }

    setBlockProperty(x, y, property, value) {
        const chunkID = this.getChunkID(x);
        const relativeX = this.getRelativeX(x);

        this.game.level.data[chunkID].block_data[relativeX][y][property] = value;
    }

    isWithinWorldBounds(x, y) {
        const bounds = this.getWorldBorders();

        if (x >= bounds.minX && x <= bounds.maxX && y >= 0 && y < this.game.level.properties.height_blocks) {
            return true;
        } else {
            return false;
        }
    }

    chunkIsGenerated(chunkID) {
        if (this.game.level.data[chunkID]) {
            return true;
        } else {
            return false;
        }
    }

    getWorldBounds() { // returns leftmost and rightmost chunk indicies
        if (this.game.level.properties.width_chunks % 2 == 0) { // if world size in chunks is even
            const min = this.game.level.properties.width_chunks / 2 - 1 === 0 ? 0: -1 * (this.game.level.properties.width_chunks / 2 - 1);
            return [min, this.game.level.properties.width_chunks / 2];
        } else {
            return [-1 * Math.floor(this.game.level.properties.width_chunks / 2), Math.floor(this.game.level.properties.width_chunks / 2)];
        }
    }

    getXByChunkRelative(chunkID, relativeX) {
        return this.game.level.data[chunkID].block_data[relativeX][0].x;
    }

    getWorldBorders() { // returns leftmost and rightmost block x-values
        const world_bounds = this.getWorldBounds();
        const min_chunkID = world_bounds[0];
        const max_chunkID = world_bounds[1];

        const minX = this.getXByChunkRelative(min_chunkID, 0);
        const maxX = this.getXByChunkRelative(max_chunkID, this.game.level.chunk_size - 1);

        return {minX: minX, maxX: maxX};
    }

    getRenderingCornerstones() { //Returns leftmost x-values and bottommost y-values visible on screen
        const viewWidth = this.game.settings.blockview_width;
        const viewHeight = this.game.settings.blockview_height;
        
        const playerX = this.game.player.x;
        const playerY = this.game.player.y;
        
        //Set values and check for world bound compliance
        let leftmost_blockX = playerX - viewWidth / 2;
        if (leftmost_blockX < this.getWorldBorders().minX) { // If player can not be centred horizontally - renders world outside world bounds
            leftmost_blockX = this.getWorldBorders().minX;
        }

        let rightmost_blockX = leftmost_blockX + this.game.settings.blockview_width;
        if (rightmost_blockX > this.getWorldBorders().maxX + 1) {
            leftmost_blockX = this.getWorldBorders().maxX + 1 - this.game.settings.blockview_width;
            rightmost_blockX = this.getWorldBorders().maxX + 1;
        }
        

        let bottommost_blockY = playerY - viewHeight / 2;
        if (bottommost_blockY < 0) { // If player can not be centred vertically - renders world below world bounds
            bottommost_blockY = 0;
        }

        const topmost_blockY = bottommost_blockY + this.game.settings.blockview_height;

        return {
            leftmost_blockX: leftmost_blockX,
            bottommost_blockY: bottommost_blockY,
            rightmost_blockX: rightmost_blockX,
            topmost_blockY: topmost_blockY
        };
    }

    solidBlockAdjacent(x, y) {
        if (
            this.isSolidBlock(x + 1, y) ||
            this.isSolidBlock(x - 1, y) ||
            this.isSolidBlock(x, y + 1) ||
            this.isSolidBlock(x, y - 1)
        ) {
            return true;
        }
        return false;
    }

    getBlockDistance(x1, y1, x2, y2) {
        const dist = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;

        return dist;
    }

}

export { Calc_World };