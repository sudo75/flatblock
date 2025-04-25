import { Item_Directory } from '../generation/blocks.js';
import { recipies } from './crafting_recipies.js';

class Menu {
    constructor(canvas_menu, ctx, width, height) {
        this.isOpen = false;
        this.ctx = ctx;
        
        this.width = width; //Proportionate to canvas width
        this.height = height; //Proportionate to canvas height

        this.canvas_menu = canvas_menu;
        this.canvas_width = canvas_menu.width;
        this.canvas_height = canvas_menu.height;

        this.real_width = this.canvas_width * this.width;
        this.real_height = this.canvas_height * this.height;
        this.x = (this.canvas_width - this.real_width) / 2;
        this.y = (this.canvas_height - this.real_height) / 2;

        this.item_directory = new Item_Directory();
        this.recipies = recipies;
    }

    open() {
        this.isOpen = true;
        this.canvas_menu.style.pointerEvents = 'all';
    }

    close() {
        this.isOpen = false;
        this.canvas_menu.style.pointerEvents = 'none';

        this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
    }
}

class Menu_Inventory extends Menu {
    constructor(canvas_menu, ctx, inventory, type, game) {
        super(canvas_menu, ctx, 0.8, 0.8);
        this.game = game;
        this.inventory_data = inventory.data;
        this.inventory = inventory;
        this.textureCache = {};

        this.slotPosition = [];
        this.selectedSlotIndex = undefined;
        this.editingStack = false; // If using right click to move items from one stack to another
        this.additionalSlots = 0;

        this.slot_width = null;
        this.slot_height = null;
        this.slotPadding = 5;
        this.type = type;
        
        switch (type) {
            case 'inventory':
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Crafting(this, 0.4, 0.3, 2, 2, this.recipies);
                break;
            case 'crafting':
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Crafting(this, 0.4, 0.3, 3, 3, this.recipies);
                this.Menu_ComponentUI_1.x = this.x + (this.real_width - this.Menu_ComponentUI_1.real_width) / 2;
                break;
            case 'chest':
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Chest(this, 0.95, 0.5, 4, 9);
                break;
            case 'furnace':
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Furnace(this, 0.6, 0.3);
                break;
        }

        this.Menu_ComponentUI_1.minSlotIndex = this.inventory.rows * this.inventory.cols;

        this.canvas_menu.addEventListener('click', (event) => {
            if (!this.isOpen) return;
            let rect = this.canvas_menu.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            if (event.which === 1) { // Left mouse
                if (this.editingStack) {
                    this.editingStack = false;
                    this.selectedSlotIndex = undefined;
                } else if (this.selectedSlotIndex !== undefined) {
                    if (this.getSlotIndexByXY(x, y) !== undefined) {
                        const resultSlotIndex = this.getResultSlotIndex();
                        if (resultSlotIndex) {
                            if (this.getSlotIndexByXY(x, y) !== resultSlotIndex) {
                                if (this.selectedSlotIndex === resultSlotIndex && this.inventory_data[this.getSlotIndexByXY(x, y)].id != null && this.inventory_data[this.getSlotIndexByXY(x, y)].id !== this.inventory_data[resultSlotIndex].id) {
                                    if (this.inventory_data[this.getSlotIndexByXY(x, y)].id === this.inventory_data[resultSlotIndex].id) {

                                    }
                                } else {
                                    this.inventory.swapItem(this.selectedSlotIndex, this.getSlotIndexByXY(x, y));
                                }
                            }
                        } else {
                            this.inventory.swapItem(this.selectedSlotIndex, this.getSlotIndexByXY(x, y));
                        }

                    }
                    
                    this.selectedSlotIndex = undefined;
                } else {
                    this.selectedSlotIndex = this.getSlotIndexByXY(x, y);
                }
            }


            this.refresh();
        });

        this.canvas_menu.addEventListener('contextmenu', (event) => {
            if (!this.isOpen) return;
            event.preventDefault();


            let rect = this.canvas_menu.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            if (this.selectedSlotIndex !== undefined) {
                if (this.getSlotIndexByXY(x, y) !== undefined) {
                    const resultSlotIndex = this.getResultSlotIndex();
                    //if (!resultSlotIndex) return;
                    //if (getSlotIndexByXY(x, y) === resultSlotIndex) return; // commented out bc. the code broke something else, but not sure if it might be important

                    if (this.getSlotIndexByXY(x, y) !== resultSlotIndex && this.selectedSlotIndex !== resultSlotIndex) {
                        this.inventory.addItemFrom(this.selectedSlotIndex, this.getSlotIndexByXY(x, y));
                        this.editingStack = true;
                    }                    
                }

                //If stack runs out
                if (this.inventory_data[this.selectedSlotIndex].quantity === null) {
                    this.editingStack = false;
                    this.selectedSlotIndex = undefined;
                }
            }

            this.refresh();
        });
    }

    getResultSlotIndex() {
        for (let i = 0; i < this.inventory.rows * this.inventory.cols + this.additionalSlots; i++) {
            if (this.slotPosition[i].isResult) {
                return i;
            }
        }
        return null;
    }

    getSlotIndexByXY(x, y) {
        for (let i = 0; i < this.inventory.rows * this.inventory.cols + this.additionalSlots; i++) {
            if (!this.slotPosition[i]) continue;
            const slot_x_min = this.slotPosition[i].slot_x;
            const slot_y_min = this.slotPosition[i].slot_y;

            const slot_x_max = slot_x_min + this.slot_width;
            const slot_y_max = slot_y_min + this.slot_height;

            if (
                x < slot_x_max && x > slot_x_min && y < slot_y_max && y > slot_y_min
            ) {
                return i;
            }
        }
    }

    refresh() {
        this.close_basic();
        this.open_basic();
    }

    update() {
        if (this.Menu_ComponentUI_1.update) {
            this.Menu_ComponentUI_1.update();
        }
    }

    updateInventory() {
        if (this.Menu_ComponentUI_1.updateInventory) {
            this.Menu_ComponentUI_1.updateInventory();
        }
    }

    close() {
        this.close_basic();
        this.slotPosition = [];
        this.selectedSlotIndex = undefined;

        this.Menu_ComponentUI_1.close();
    }

    close_basic() {
        super.close();

        this.update();
    }

    open() {
        this.open_basic();
        this.Menu_ComponentUI_1.open();
    }

    open_basic() {
        super.open();

        const drawBG = () => {
            this.ctx.beginPath();
            this.ctx.fillStyle = "grey";
            this.ctx.fillRect(this.x, this.y, this.real_width, this.real_height);
            this.ctx.stroke();
        };

        const drawInventory = () => {
            const margin = 10;
            const inv_real_height = this.real_height * 0.45;
            const inv_real_width = this.real_width - 2 * margin;

            const inv_x = this.x + margin;
            const inv_y = this.y + this.real_height - inv_real_height - margin;

            // Inventory background
            this.ctx.fillStyle = "grey";
            this.ctx.fillRect(inv_x, inv_y, inv_real_width, inv_real_height);
            this.ctx.strokeStyle = "black";

            // Slot code
            const cols = this.inventory.cols;
            const rows = this.inventory.rows;
            const slot_margin = 5;
            const slot_width = (inv_real_width - slot_margin * (cols - 1)) / cols;
            const slot_height = (inv_real_height - slot_margin * (rows - 1)) / rows;

            this.slot_width = slot_width;
            this.slot_height = slot_height;

            // Draw inventory slots (Aligned perfectly)
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const index = i * this.inventory.cols + j;

                    const slot_x = inv_x + j * (slot_width + slot_margin);
                    const slot_y = inv_y + inv_real_height - (i + 1) * (slot_height + slot_margin);

                    this.slotPosition.push({
                        slot_x: slot_x,
                        slot_y: slot_y,
                        isResult: false
                    });

                    this.ctx.fillStyle = 'lightgrey'; // slot BG
                    this.ctx.fillRect(slot_x, slot_y, slot_width, slot_height);

                    this.ctx.strokeStyle = "black"; // Slot border
                    this.ctx.lineWidth = index === this.selectedSlotIndex ? 4: 1;
                    this.ctx.strokeRect(slot_x, slot_y, slot_width, slot_height);
                }
            }

            this.Menu_ComponentUI_1.open();

            this.additionalSlots = this.Menu_ComponentUI_1.getAllSlotPositions().length;
            this.slotPosition = this.slotPosition.concat(this.Menu_ComponentUI_1.getAllSlotPositions());
        };


        const loadItems = () => {
            for (let i = 0; i < this.inventory.rows * this.inventory.cols + this.additionalSlots; i++) {
                const index = i;
                const item = this.inventory_data[index];

                const slot_x = this.slotPosition[index].slot_x;
                const slot_y = this.slotPosition[index].slot_y;

                const left = slot_x + this.slotPadding;
                const top = slot_y + this.slotPadding;
                const imageWidth = this.slot_width - this.slotPadding * 2;
                const imageHeight = this.slot_height - this.slotPadding * 2;

                const texture_location = this.item_directory.getTextureLocationByID(item.id);
                const itemQuantity = item.quantity;
                const itemDurability = item.durability;

                const spriteSheetX = this.item_directory.getProperty(item.id, 'spriteSheetX');

                if (texture_location) {
                    let image;
                    if (!this.textureCache[texture_location]) {
                        image = new Image();
                        image.src = texture_location;
            
                        this.textureCache[texture_location] = image;
                    } else {
                        image = this.textureCache[texture_location];
                    }
                    
                    this.ctx.drawImage(image, spriteSheetX, 0, 16, 16, left, top, imageWidth, imageHeight);

                } else if (item.id != null) {
                    this.ctx.fillStyle = 'purple';
                    this.ctx.fillRect(left, top, imageWidth, imageHeight);
                }

                if (itemQuantity > 1) {
                    this.ctx.font = "bold 16px Arial";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(itemQuantity, slot_x + this.slotPadding, slot_y + this.slot_height - this.slotPadding);
                }

                if (itemDurability) {
                    this.ctx.font = "bold 12px Arial";
                    this.ctx.fillStyle = "blue";
                    this.ctx.fillText(itemDurability, slot_x + this.slotPadding, slot_y + this.slot_height - this.slotPadding);
                }
            }
        };

        drawBG();
        drawInventory();
        loadItems();
    }
}

class Menu_ComponentUI_Crafting {
    constructor(main, width, height, rows, cols, recipies) {
        this.main = main;
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.cols = cols;
        this.minSlotIndex = null;

        this.canvas_menu = main.canvas_menu;
        this.canvas_width = this.canvas_menu.width;
        this.canvas_height = this.canvas_menu.height;

        this.ctx = main.ctx;

        this.margin = 10;

        this.real_width = main.real_width * this.width;
        this.real_height = main.real_height * this.height;
        this.x = main.x + main.real_width - this.real_width;
        this.y = main.y + this.margin;
        
        this.slotPosition = []; // Required for integration with main menu

        this.recipies = recipies;
        this.item_directory = new Item_Directory();

        this.button_crafting = {

        };
        // Add event listener for crafting button
        this.canvas_menu.addEventListener('click', (event) => {
            if (!this.main.isOpen) return;
            let rect = this.canvas_menu.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            
            if (x >= this.button_crafting.button_x && x <= this.button_crafting.button_x + this.button_crafting.buttonWidth && y >= this.button_crafting.button_y && y <= this.button_crafting.button_y + this.button_crafting.buttonHeight) {
                this.craftItem();
            }
        });
    }

    craftItem() {
        if (this.checkCraftingGrid() === null) return;

        const result = this.checkCraftingGrid().resultID;
        const addQuantity = this.checkCraftingGrid().quantity;
        const durability = this.item_directory.getProperty(result, 'durability');

        const maxStackSize = this.item_directory.getProperty(result, 'maxStackSize');
        if (result !== this.main.inventory_data[this.main.getResultSlotIndex()].id && this.main.inventory_data[this.main.getResultSlotIndex()].id !== null || this.main.inventory_data[this.main.getResultSlotIndex()].quantity >= maxStackSize) return;

        this.main.inventory_data[this.main.getResultSlotIndex()].id = result;
        this.main.inventory_data[this.main.getResultSlotIndex()].quantity += addQuantity;
        this.main.inventory_data[this.main.getResultSlotIndex()].durability = durability;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.main.inventory.subtract(this.minSlotIndex + i * this.cols + j);
            }
        }

        this.main.refresh();
    }

    open() {
        // Draw slots (Aligned perfectly)
        this.slotPosition = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const index = i * this.cols + j + this.minSlotIndex;

                const slot_margin = 5;
                const slot_width = this.main.slot_width;
                const slot_height = this.main.slot_height;

                const slot_x = this.x + j * (slot_width + slot_margin);
                const slot_y = this.y + i * (slot_height + slot_margin);

                this.slotPosition.push({
                    slot_x: slot_x,
                    slot_y: slot_y,
                    isResult: false
                });

                this.ctx.fillStyle = 'lightgrey'; // slot BG
                this.ctx.fillRect(slot_x, slot_y, slot_width, slot_height);

                this.ctx.strokeStyle = "black"; // Slot border
                this.ctx.lineWidth = index === this.main.selectedSlotIndex ? 4: 1;
                this.ctx.strokeRect(slot_x, slot_y, slot_width, slot_height);
            }
        }


        //RESULT TILE
        const result_margin = 15; // Extra space between crafting grid & result
        const result_x = this.x + (this.cols * (this.main.slot_width + 5)) + result_margin;
        const result_y = this.y + ((this.rows - 1) / 2) * (this.main.slot_height + 5); // Centered vertically

        this.slotPosition.push({ slot_x: result_x, slot_y: result_y, isResult: true });

        // Draw crafting result slot
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(result_x, result_y, this.main.slot_width, this.main.slot_height);

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.getAllSlotPositions().length - 1 + this.minSlotIndex === this.main.selectedSlotIndex ? 4: 1;
        this.ctx.strokeRect(result_x, result_y, this.main.slot_width, this.main.slot_height);


        // Draw craft button
        const buttonWidth = 50;
        const buttonHeight = 20;
        const button_x = result_x + (this.main.slot_width - buttonWidth) / 2;
        const button_y = result_y + this.main.slot_height + 10;

        this.button_crafting.buttonWidth = buttonWidth;
        this.button_crafting.buttonHeight = buttonHeight;
        this.button_crafting.button_x = button_x;
        this.button_crafting.button_y = button_y;

        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(button_x, button_y, buttonWidth, buttonHeight);
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(button_x, button_y, buttonWidth, buttonHeight);

        this.ctx.fillStyle = "white";
        this.ctx.font = "12px Arial";
        this.ctx.fillText("Craft", button_x + 10, button_y + 14);
    }

    close() {
        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.rows * this.cols + 1; i++) { //+1 for result slot
            const item = this.main.inventory_data[i];
            if (item) {
                const itemQuant = item.quantity;
                for (let j = 0; j < itemQuant; j++) {
                    this.main.game.entity_handler.newEntity_Item(this.main.game.player.x, this.main.game.player.y, item.id, 2, 5, item.durability);
                    this.main.inventory.subtract(i);
                }
            }

        }
    }

    getAllSlotPositions() {
        return this.slotPosition;
    }

    checkCraftingGrid() {
        let craftingGrid = [];
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(this.main.inventory_data[this.minSlotIndex + i * this.cols + j].id);
            }
            craftingGrid.push(row);
        }

        for (let r = 0; r < this.recipies.length; r++) {
            const currentRecipie = this.recipies[r];
            for (let a = 0; a < currentRecipie.recipie.length; a++) {
                const currentRecipieVariation = currentRecipie.recipie[a];
                const recipieRows = currentRecipieVariation.length;
                const recipieCols = currentRecipieVariation[0].length;

                //Compare recipie
                let matches = true;
                for (let i = 0; i < recipieRows; i++) {
                    for (let j = 0; j < recipieCols; j++) {
                        let currentGridSlot;
                        if (i >= this.rows || j >= this.cols) { // if i or j are outside the bounds of the crafting grid
                            currentGridSlot = null;
                        } else {
                            currentGridSlot = craftingGrid[i][j];
                        }

                        if (currentRecipieVariation[i][j] != currentGridSlot) {
                            matches = false;
                            break;
                        }
                    }
                    if (!matches) break;
                }
                if (matches) return { resultID: currentRecipie.result, quantity: currentRecipie.quantity };
            }
        }

        return null;
    }
}

class Menu_ComponentUI_Furnace {
    constructor(main, width, height) {
        this.main = main;
        this.width = width;
        this.height = height;
        this.minSlotIndex = null;

        this.canvas_menu = main.canvas_menu;
        this.canvas_width = this.canvas_menu.width;
        this.canvas_height = this.canvas_menu.height;

        this.ctx = main.ctx;

        this.margin = 10;

        this.real_width = main.real_width * this.width;
        this.real_height = main.real_height * this.height;
        this.x = main.x + main.real_width - this.real_width - this.margin;
        this.y = main.y + this.margin;
        
        this.slotPosition = []; // Required for integration with main menu

        this.item_directory = new Item_Directory();

        this.furnace_slots = 3; //totals slots in a furnace
    }

    open() {
        //Set player's inventory to include furnace data
        const selectedX = this.main.game.player.selectedBlock.x;
        const selectedY = this.main.game.player.selectedBlock.y;
        
        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.furnace_slots; i++) {
            this.main.game.player.inventory.data[i] = this.main.game.calculator.getBlockData(selectedX, selectedY).inventory.data[i - this.minSlotIndex];
        }

        // Draw slots (Aligned perfectly)
        this.slotPosition = [];

        const slot_width = this.main.slot_width;
        const slot_height = this.main.slot_height;

        //Input
        const input_x = this.x;
        const input_y = this.y + this.margin;

        this.slotPosition.push({
            slot_x: input_x,
            slot_y: input_y,
            isResult: false
        });


        //Fuel
        const fuel_x = input_x;
        const fuel_y = input_y + this.margin * 2 + slot_height * 2;
        
        this.slotPosition.push({
            slot_x: fuel_x,
            slot_y: fuel_y,
            isResult: false
        });


        const midY = input_y + (fuel_y - input_y) / 2; //Middle of input and fuel slots

        //Result
        const result_x = input_x + slot_width * 3 + this.margin * 2;
        const result_y = midY;
        
        this.slotPosition.push({
            slot_x: result_x,
            slot_y: result_y,
            isResult: false
        });
        

        const furnaceData = this.main.game.calculator.getBlockData(selectedX, selectedY);

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;

        //Fuel Indicator
        const fuelPoints = furnaceData.fuelPoints;
        const og_fuelPoints = furnaceData.og_fuelPoints;

        const fiWidth = slot_width / 2;
        const fiHeight = slot_width;

        const fi_x = input_x + fiWidth / 2;
        const fi_y = input_y + slot_width + this.margin;

        this.ctx.strokeRect(fi_x, fi_y, fiWidth, fiHeight);

        const fuelLevel = Math.ceil(fuelPoints / og_fuelPoints * 10); // Out of 10
        this.ctx.fillStyle = 'orange';
        this.ctx.fillRect(fi_x, fi_y + fiHeight * (1 - fuelLevel / 10), fiWidth, fiHeight * fuelLevel / 10);

        //Progress Indicator
        const processPoints = furnaceData.processPoints;
        const efficiency = furnaceData.efficiency;

        const prWidth = slot_width * 2;
        const prHeight = slot_width / 2;

        const pr_x = input_x + slot_width + this.margin;
        const pr_y = midY + prHeight / 2;

        this.ctx.strokeRect(pr_x, pr_y, prWidth, prHeight);

        const processLevel = Math.ceil(processPoints / efficiency * 10); // Out of 10
        this.ctx.fillStyle = 'orange';
        this.ctx.fillRect(pr_x, pr_y, prWidth * processLevel / 10, prHeight);

        //Render furnace menu
        for (let i = 0; i < this.slotPosition.length; i++) {
            const slot_x = this.slotPosition[i].slot_x;
            const slot_y = this.slotPosition[i].slot_y;

            const index = i + this.minSlotIndex;

            this.ctx.fillStyle = 'lightgrey'; // slot BG
            this.ctx.fillRect(slot_x, slot_y, slot_width, slot_height);

            this.ctx.strokeStyle = "black"; // Slot border
            this.ctx.lineWidth = index === this.main.selectedSlotIndex ? 4: 1;
            this.ctx.strokeRect(slot_x, slot_y, slot_width, slot_height);
        }

        
    }

    close() {
        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.furnace_slots; i++) {        
            const item = this.main.inventory_data[i];
            const itemQuant = item.quantity;
            for (let j = 0; j < itemQuant; j++) {
                this.main.inventory.subtract(i);
            }
        }
    }

    updateInventory() { //update after furnace processes
        const blockData = this.main.game.calculator.getBlockData(this.main.game.player.selectedBlock.x, this.main.game.player.selectedBlock.y);
        if (!blockData.inventory) return;

        //Update player inventory data to furnace
        let furnace_inventory_data = this.main.game.calculator.deepCloneObj(blockData.inventory.data);

        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.furnace_slots; i++) {
            const equivalentFurnaceInventoryIndex = i - this.minSlotIndex;
            this.main.inventory_data[i] = this.main.game.calculator.deepCloneObj(furnace_inventory_data[equivalentFurnaceInventoryIndex]);
        }

        // const chunkID = this.main.game.calculator.getChunkID(this.main.game.player.selectedBlock.x);
        // const relativeX = this.main.game.calculator.getRelativeX(this.main.game.player.selectedBlock.x);
        // this.main.game.level.data[chunkID].block_data[relativeX][this.main.game.player.selectedBlock.y].inventory.data = this.main.game.calculator.deepCloneObj(furnace_inventory_data);
    }

    update() {
        //Set funace data
        if (!this.main.game.player.selectedBlock.x || !this.main.game.player.selectedBlock.y) return;

        const blockData = this.main.game.calculator.getBlockData(this.main.game.player.selectedBlock.x, this.main.game.player.selectedBlock.y);
        if (!blockData.inventory) return;

        //Update furnace inventory data
        let furnace_inventory_data = this.main.game.calculator.deepCloneObj(blockData.inventory.data);

        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.furnace_slots; i++) {
            const equivalentFurnaceInventoryIndex = i - this.minSlotIndex;
            furnace_inventory_data[equivalentFurnaceInventoryIndex] = this.main.game.calculator.deepCloneObj(this.main.inventory_data[i]);
        }

        const chunkID = this.main.game.calculator.getChunkID(this.main.game.player.selectedBlock.x);
        const relativeX = this.main.game.calculator.getRelativeX(this.main.game.player.selectedBlock.x);
        this.main.game.level.data[chunkID].block_data[relativeX][this.main.game.player.selectedBlock.y].inventory.data = this.main.game.calculator.deepCloneObj(furnace_inventory_data);
    }

    getAllSlotPositions() {
        return this.slotPosition;
    }
}

class Menu_ComponentUI_Chest {
    constructor(main, width, height, rows, cols) {
        this.main = main;
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.cols = cols;
        this.minSlotIndex = null;

        this.canvas_menu = main.canvas_menu;
        this.canvas_width = this.canvas_menu.width;
        this.canvas_height = this.canvas_menu.height;

        this.ctx = main.ctx;

        this.margin = 10;

        this.real_width = main.real_width * this.width;
        this.real_height = main.real_height * this.height;
        this.x = main.x + main.real_width - this.real_width - this.margin;
        this.y = main.y + this.margin;
        
        this.slotPosition = []; // Required for integration with main menu

        this.item_directory = new Item_Directory();
    }

    open() {
        //Set player's inventory to include chest data
        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.rows * this.cols; i++) {
            this.main.game.player.inventory.data[i] = this.main.game.calculator.getBlockData(this.main.game.player.selectedBlock.x, this.main.game.player.selectedBlock.y).inventory.data[i - this.rows * this.cols];
        }

        // Draw slots (Aligned perfectly)
        this.slotPosition = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const index = i * this.cols + j + this.minSlotIndex;

                const slot_margin = 5;
                const slot_width = this.main.slot_width;
                const slot_height = this.main.slot_height;

                const slot_x = this.x + j * (slot_width + slot_margin);
                const slot_y = this.y + i * (slot_height + slot_margin);

                this.slotPosition.push({
                    slot_x: slot_x,
                    slot_y: slot_y,
                    isResult: false
                });

                this.ctx.fillStyle = 'lightgrey'; // slot BG
                this.ctx.fillRect(slot_x, slot_y, slot_width, slot_height);

                this.ctx.strokeStyle = "black"; // Slot border
                this.ctx.lineWidth = index === this.main.selectedSlotIndex ? 4: 1;
                this.ctx.strokeRect(slot_x, slot_y, slot_width, slot_height);
            }
        }
    }

    close() {
        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.rows * this.cols; i++) {        
            const item = this.main.inventory_data[i];
            const itemQuant = item.quantity;
            for (let j = 0; j < itemQuant; j++) {
                this.main.inventory.subtract(i);
            }
        }
    }

    update() { //Updates chest data
        if (!this.main.game.player.selectedBlock.x || !this.main.game.player.selectedBlock.y) return;

        const blockData = this.main.game.calculator.getBlockData(this.main.game.player.selectedBlock.x, this.main.game.player.selectedBlock.y);
        if (!blockData.inventory) return;

        //Update chest inventory data
        let chest_inventory_data = this.main.game.calculator.deepCloneObj(blockData.inventory.data);

        for (let i = this.minSlotIndex; i < this.minSlotIndex + this.rows * this.cols; i++) {
            const equivalentChestInventoryIndex = i - this.rows * this.cols;
            chest_inventory_data[equivalentChestInventoryIndex] = this.main.game.calculator.deepCloneObj(this.main.inventory_data[i]);
        }

        const chunkID = this.main.game.calculator.getChunkID(this.main.game.player.selectedBlock.x);
        const relativeX = this.main.game.calculator.getRelativeX(this.main.game.player.selectedBlock.x);
        this.main.game.level.data[chunkID].block_data[relativeX][this.main.game.player.selectedBlock.y].inventory.data = this.main.game.calculator.deepCloneObj(chest_inventory_data);
    }

    getAllSlotPositions() {
        return this.slotPosition;
    }
}

class Menu_Hotbar extends Menu {
    constructor(canvas_menu, ctx, inventory) {
        super(canvas_menu, ctx, 0.6, 0.1);

        this.textureCache = {};

        this.margin = 20;
        this.y = this.canvas_height - this.real_height - this.margin;

        this.inventory_data = inventory.data;
        this.inventory = inventory;
        this.slotSize = this.real_width / this.inventory.cols;

        this.slot_margin = 5;
        this.slotPadding = 5;
    }

    open() {
        super.open();
        this.canvas_menu.style.pointerEvents = 'none'; //Override pointer events code in super
        // Draw item slots
        for (let i = 0; i < this.inventory.cols; i++) {
            const item = this.inventory_data[i];

            let slot_x = this.x + i * (this.slotSize + this.slot_margin);
            let slot_y = this.y;

            // Draw background
            this.ctx.fillStyle = "lightgrey";
            this.ctx.fillRect(slot_x, slot_y, this.slotSize, this.slotSize);

            //Outline slots
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = i === this.inventory.selectedSlot ? 4: 1;
            this.ctx.strokeRect(slot_x, slot_y, this.slotSize, this.slotSize);

            // Render item in the slot
            if (this.inventory_data[i]) {

                    const left = slot_x + this.slotPadding;
                    const top = slot_y + this.slotPadding;
                    const imageWidth = this.slotSize - this.slotPadding * 2;
                    const imageHeight = this.slotSize - this.slotPadding * 2;

                    const texture_location = this.item_directory.getTextureLocationByID(item.id);
                    const itemQuantity = item.quantity;
                    const itemDurability = item.durability;

                    const spriteSheetX = this.item_directory.getProperty(item.id, 'spriteSheetX');

                    if (texture_location) {
                        let image;
                        if (!this.textureCache[texture_location]) {
                            image = new Image();
                            image.src = texture_location;
                
                            this.textureCache[texture_location] = image;
                        } else {
                            image = this.textureCache[texture_location];
                        }
                        
                        this.ctx.drawImage(image, spriteSheetX, 0, 16, 16, left, top, imageWidth, imageHeight);

                    } else if (item.id != null) {
                        this.ctx.fillStyle = 'purple';
                        this.ctx.fillRect(left, top, imageWidth, imageHeight);
                    }

                if (itemQuantity > 1) {
                    this.ctx.font = "bold 16px Arial";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(itemQuantity, slot_x + this.slotPadding, slot_y + this.slotSize - this.slotPadding);
                }

                if (itemDurability) {
                    this.ctx.font = "bold 12px Arial";
                    this.ctx.fillStyle = "blue";
                    this.ctx.fillText(itemDurability, slot_x + this.slotPadding, slot_y + this.slotSize - this.slotPadding);
                }
            }
        }
    }

    setSlot(index) {
        if (index >= 0 && index < this.inventory.cols) {
            this.inventory.selectedSlot = index;
        }
    }
}

class Menu_Healthbar extends Menu {
    constructor(canvas_menu, ctx, player) {
        super(canvas_menu, ctx, 0.4, 0.1);

        this.textureCache = {};

        this.margin = 20;
        this.y = this.canvas_height - this.real_height - this.margin;

        this.player = player;
        this.heartSize = this.real_width / 10;
    }

    open() {
        super.open();
        this.canvas_menu.style.pointerEvents = 'none'; //Override pointer events code in super

        const health = this.player.health;
        const maxHearts = this.player.maxHealth / 2;
        
        const hearts_full = Math.floor(health / 2);
        const hearts_half = health % 2;
        const hearts_empty = maxHearts - hearts_full - hearts_half;

        const drawHeart = (x, y, type) => {

            const getHeartLocation = (type) => {
                switch (type) {
                    case 'full':
                        return './assets/ui/heart_full.png';
                    case 'half':
                        return './assets/ui/heart_half.png';
                    case 'empty':
                        return './assets/ui/heart_empty.png';
                }
            };
            
            const heartImage_location = getHeartLocation(type);

            let heartImage;
            if (heartImage_location) {
                if (!this.textureCache[heartImage_location]) {
                    heartImage = new Image();
                    heartImage.src = heartImage_location;
        
                    this.textureCache[heartImage_location] = heartImage;
                } else {
                    heartImage = this.textureCache[heartImage_location];
                }
                
                if (heartImage) {
                    this.ctx.drawImage(heartImage, x, y, this.heartSize, this.heartSize);
                } else {
                    this.ctx.fillRect(x, y, this.heartSize, this.heartSize);
                }
            }
        }

        let count_hearts_full = 0;
        let count_hearts_half = 0;
        let count_hearts_empty = 0;

        for (let i = 0; i < maxHearts; i++) {
            const heartSpacing = 5;
            const startX = this.x - this.margin / 2;
            const startY = this.y -40;

            let type;
            if (count_hearts_full < hearts_full) {
                count_hearts_full++;
                type = 'full';
            } else if (count_hearts_half < hearts_half) {
                count_hearts_half++;
                type = 'half';
            } else if (count_hearts_empty < hearts_empty) {
                count_hearts_empty++;
                type = 'empty';
            }


            const heartX = startX + i * (this.heartSize + heartSpacing);
            drawHeart(heartX, startY, type);
        }
    }
}


class MenuHandler {
    constructor(game) {
        this.game = game;

        this.canvas_menu = this.game.canvas_menu;
        this.ctx_menu = this.game.ctx_menu;

        this.mouseDown_right = false;
        this.mouseDown_left = false;

        this.keyHold = {
            e: false,
            c: false,
            q: false
        };
    }

    init() {
        this.menus = {
            inventory: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'inventory', this.game),
            crafting: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'crafting', this.game),
            chest: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'chest', this.game),
            furnace: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'furnace', this.game)
        }

        console.log(this.menus)

        this.closeAllMenus();

        this.hotbar = new Menu_Hotbar(this.canvas_menu, this.ctx_menu, this.game.player.inventory);
        this.healthbar = new Menu_Healthbar(this.canvas_menu, this.ctx_menu, this.game.player);

        setTimeout(() => {
            this.hotbar.open();
            this.healthbar.open();
        }, 100);
    }

    aMenuIsOpen() {
        return Object.values(this.menus).some(menu => menu.isOpen);
    }

    closeAllMenus() {
        Object.values(this.menus).forEach((menu) => {
            if (menu.isOpen) {
                menu.close();
            }
        });

        this.game.input.mouseDown_right = false;
        this.game.input.mouseDown_left = false;
    }

    update(input) {
        this.mouseDown_right = this.game.input.mouseDown_right;
        this.mouseDown_left = this.game.input.mouseDown_left;

        if (this.mouseDown_right) {
            const blockData = this.game.calculator.getBlockData(this.game.player.selectedBlock.x, this.game.player.selectedBlock.y);
            if (blockData.id === 9 && !this.aMenuIsOpen()) { //chest
                this.hotbar.close();
                this.healthbar.close();
                this.menus.chest.open(blockData.inventory); //param doesn't do anything yet
            }

            if (blockData.id === 10 && !this.aMenuIsOpen()) { //crafting table
                this.hotbar.close();
                this.healthbar.close();
                this.menus.crafting.open();
            }

            if (blockData.id === 11 && !this.aMenuIsOpen()) { //furnace
                this.hotbar.close();
                this.healthbar.close();
                this.menus.furnace.open(blockData.inventory);
            }
        }


        if (this.healthbar.isOpen || this.hotbar.isOpen) {
            this.healthbar.close();
            this.hotbar.close();

            // Refreshes healthbar
            this.healthbar.open();

            // Refreshes hotbar
            this.hotbar.open();
        }


        if (input.includes('e')) {
            if (this.keyHold.e) {
                return;
            }
            if (!this.aMenuIsOpen()) {
                this.hotbar.close();
                this.healthbar.close();
                this.menus.inventory.open();
            } else {
                this.closeAllMenus();
                this.hotbar.open();
                this.healthbar.open();
            }
            this.keyHold.e = true;
        } else {
            this.keyHold.e = false;
        }

        //Update chest menu
        if (this.menus.chest.isOpen) {
            this.menus.chest.updateInventory();
            this.menus.chest.refresh();
        }

        //Update furnace menu
        if (this.menus.furnace.isOpen) {
            this.menus.furnace.updateInventory();
            this.menus.furnace.refresh();
        }

        //Update inventory menu
        if (this.menus.inventory.isOpen) {
            this.menus.inventory.updateInventory();
            this.menus.inventory.refresh();
        }

        //Update crafting menu
        if (this.menus.crafting.isOpen) {
            this.menus.crafting.updateInventory();
            this.menus.crafting.refresh();
        }


        if (input.includes('1')) {
            this.hotbar.setSlot(0);
        }
        if (input.includes('2')) {
            this.hotbar.setSlot(1);
        }
        if (input.includes('3')) {
            this.hotbar.setSlot(2);
        }
        if (input.includes('4')) {
            this.hotbar.setSlot(3);
        }
        if (input.includes('5')) {
            this.hotbar.setSlot(4);
        }
        if (input.includes('6')) {
            this.hotbar.setSlot(5);
        }
        if (input.includes('7')) {
            this.hotbar.setSlot(6);
        }
        if (input.includes('8')) {
            this.hotbar.setSlot(7);
        }
        if (input.includes('9')) {
            this.hotbar.setSlot(8);
        }


        if (input.includes('q')) {
            if (this.keyHold.q) {
                return;
            }
            if (!this.aMenuIsOpen()) {
                const inventory_slot = this.game.player.inventory.selectedSlot;
                this.game.player.throwItem(inventory_slot);
            }
            this.keyHold.q = true;
        } else {
            this.keyHold.q = false;
        }
    }
    
}

export { MenuHandler };