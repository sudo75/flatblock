import { getTextureLocationByID } from '../generation/blocks.js';

const recipies = [
    { // 4 dirt => 1 grass
        result: 2,
        quantity: 1,
        recipie: [
            [
                [1, 1, null],
                [1, 1, null],
                [null, null, null]
            ],
            [
                [null, 1, 1],
                [null, 1, 1],
                [null, null, null]
            ]
        ]
    },
    { //4 stone => 2 dirt
        result: 1,
        quantity: 2,
        recipie: [
            [
                [3, 3, null],
                [3, 3, null],
                [null, null, null]
            ],
            [
                [null, 3, 3],
                [null, 3, 3],
                [null, null, null]
            ]
        ]
    }
];

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
    constructor(canvas_menu, ctx, inventory, type) {
        super(canvas_menu, ctx, 0.8, 0.7);
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
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Crafting(this, 0.4, 0.3, 2, 2, recipies);
                break;
            case 'crafting':
                this.Menu_ComponentUI_1 = new Menu_ComponentUI_Crafting(this, 0.4, 0.3, 3, 3, recipies);
                this.Menu_ComponentUI_1.x = this.x + (this.real_width - this.Menu_ComponentUI_1.real_width) / 2;
                break;
        }

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


            this.close();
            this.open();
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
                    if (!resultSlotIndex) return;

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

            this.close();
            this.open();
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

    close() {
        super.close();
        this.slotPosition = [];

        //Move items from other menus back to inventory
        for (let i = this.Menu_ComponentUI_1.minSlotIndex; i < this.Menu_ComponentUI_1.minSlotIndex + this.additionalSlots; i++) {

        }
    }

    open() {
        super.open();

        const drawBG = () => {
            this.ctx.beginPath();
            this.ctx.fillStyle = "grey";
            this.ctx.fillRect(this.x, this.y, this.real_width, this.real_height);
            this.ctx.stroke();
        };

        const drawInventory = () => {
            const margin = 10;
            const inv_real_height = this.real_height * 0.5;
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

            this.Menu_ComponentUI_1.minSlotIndex = rows * cols;
            this.additionalSlots = this.Menu_ComponentUI_1.getAllSlotPositions().length;
            this.slotPosition = this.slotPosition.concat(this.Menu_ComponentUI_1.getAllSlotPositions());
        };


        const loadItems = () => {
            for (let i = 0; i < this.inventory.rows * this.inventory.cols + this.additionalSlots; i++) {
                const index = i;
                const item = this.inventory_data[index];

                const slot_x = this.slotPosition[index].slot_x;
                const slot_y = this.slotPosition[index].slot_y;

                const texture_location = getTextureLocationByID(item.id);
                const itemQuantity = item.quantity;

                if (texture_location) {
                    let image;
                    if (!this.textureCache[texture_location]) {
                        image = new Image();
                        image.src = texture_location;
            
                        this.textureCache[texture_location] = image;
                    } else {
                        image = this.textureCache[texture_location];
                    }
                    
                    this.ctx.drawImage(image, slot_x + this.slotPadding, slot_y + this.slotPadding, this.slot_width - this.slotPadding * 2, this.slot_height - this.slotPadding * 2);
                } else if (item.id != null) {
                    this.ctx.fillStyle = 'purple';
                    this.ctx.fillRect(slot_x + this.slotPadding, slot_y + this.slotPadding, this.slot_width - this.slotPadding * 2, this.slot_height - this.slotPadding * 2);
                }

                if (itemQuantity > 1) {
                    this.ctx.font = "bold 16px Arial";
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(itemQuantity, slot_x + this.slotPadding, slot_y + this.slot_height - this.slotPadding);
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

        if (result !== this.main.inventory_data[this.main.getResultSlotIndex()].id && this.main.inventory_data[this.main.getResultSlotIndex()].id !== null) return;

        this.main.inventory_data[this.main.getResultSlotIndex()].id = result;
        this.main.inventory_data[this.main.getResultSlotIndex()].quantity += addQuantity;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.main.inventory.subtract(this.minSlotIndex + i * this.cols + j);
            }
        }

        this.main.close();
        this.main.open();
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
                //Compare recipie
                let matches = true;
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        if (currentRecipieVariation[i][j] !== craftingGrid[i][j]) {
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

class MenuHandler {
    constructor(game) {
        this.game = game;

        this.canvas_menu = this.game.canvas_menu;
        this.ctx_menu = this.game.ctx_menu;
        
        this.menus = {
            inventory: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'inventory'),
            crafting: new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory, 'crafting')
        }
        
        this.closeAllMenus();

        this.keyHold = {
            e: false,
            c: false
        };
    }

    aMenuIsOpen() {
        return Object.values(this.menus).some(menu => menu.isOpen);
    }

    closeAllMenus() {
        Object.values(this.menus).forEach(menu => menu.close());
    }

    update(input) {
        if (input.includes('e')) {
            if (this.keyHold.e) {
                return;
            }
            if (!this.aMenuIsOpen()) {
                this.menus.inventory.open();
            } else {
                this.closeAllMenus();
            }
            this.keyHold.e = true;
        } else {
            this.keyHold.e = false;
        }
        
        if (input.includes('c')) {
            if (this.keyHold.c) {
                return;
            }
            if (!this.aMenuIsOpen()) {
                this.menus.crafting.open();
            } else {
                this.closeAllMenus();
            }
            this.keyHold.c = true;
        } else {
            this.keyHold.c = false;
        }
    }
    
}

export { MenuHandler };