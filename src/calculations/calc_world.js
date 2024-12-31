class Calc_World {
    constructor(game) {
        this.game = game;
    }

    getChunkID(x) {
        const chunkID = Math.floor(x / this.game.level.chunk_size);
        return chunkID;
    }

    getBlockData(x, y) {
        const chunkID = this.getChunkID(x);
        const relativeX = Math.abs(x % this.game.level.chunk_size); // X-value relative to chunk

        const block_data = this.game.level.data[chunkID].block_data[relativeX][y];
        return block_data;
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

}

export { Calc_World };