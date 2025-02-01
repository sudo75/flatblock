import { getTextureLocationByID } from '../generation/blocks.js';

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
    constructor(canvas_menu, ctx, inventory) {
        super(canvas_menu, ctx, 0.8, 0.6);
        this.inventory_data = inventory.data;
        this.inventory = inventory;
        this.textureCache = {};

        this.slotPosition = [];
        this.selectedSlotIndex = undefined;
        this.editingStack = false; // If using right click to move items from one stack to another

        this.slot_width = null;
        this.slot_height = null;
        this.slotPadding = 5;

        this.canvas_menu.addEventListener('click', (event) => {
            let rect = this.canvas_menu.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            if (event.which === 1) { // Left mouse
                if (this.editingStack) {
                    this.editingStack = false;
                    this.selectedSlotIndex = undefined;
                } else if (this.selectedSlotIndex !== undefined) {
                    if (this.getSlotIndexByXY(x, y) !== undefined) {
                        this.inventory.swapItem(this.selectedSlotIndex, this.getSlotIndexByXY(x, y));
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
            event.preventDefault();

            let rect = this.canvas_menu.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            if (this.selectedSlotIndex !== undefined) {
                if (this.getSlotIndexByXY(x, y) !== undefined) {
                    this.inventory.addItemFrom(this.selectedSlotIndex, this.getSlotIndexByXY(x, y));
                    this.editingStack = true;
                }

                console.log(this.inventory_data[this.selectedSlotIndex])
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

    getSlotIndexByXY(x, y) {
        for (let i = 0; i < this.inventory.rows; i++) {
            for (let j = 0; j < this.inventory.cols; j++) {
                const index = i * this.inventory.cols + j;

                const slot_x_min = this.slotPosition[index].slot_x;
                const slot_y_min = this.slotPosition[index].slot_y;

                const slot_x_max = slot_x_min + this.slot_width;
                const slot_y_max = slot_y_min + this.slot_height;

                if (
                    x < slot_x_max && x > slot_x_min && y < slot_y_max && y > slot_y_min
                ) {
                    return index;
                }
            }
        }
    }

    close() {
        super.close();
        this.slotPosition = [];
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
            const inv_real_height = this.real_height * 0.6;
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
                        slot_y: slot_y
                    });

                    this.ctx.fillStyle = 'lightgrey'; // slot BG
                    this.ctx.fillRect(slot_x, slot_y, slot_width, slot_height);

                    this.ctx.strokeStyle = "black"; // Slot border
                    this.ctx.lineWidth = index === this.selectedSlotIndex ? 4: 1;
                    this.ctx.strokeRect(slot_x, slot_y, slot_width, slot_height);
                }
            }
        };


        const loadItems = () => {
            for (let i = 0; i < this.inventory.rows; i++) {
                for (let j = 0; j < this.inventory.cols; j++) {
                    const index = i * this.inventory.cols + j;
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
            }
        };

        drawBG();
        drawInventory();
        loadItems();
    }
}

class MenuHandler {
    constructor(game) {
        this.game = game;

        this.canvas_menu = this.game.canvas_menu;
        this.ctx_menu = this.game.ctx_menu;
        
        this.inventory = new Menu_Inventory(this.canvas_menu, this.ctx_menu, this.game.player.inventory);


        this.keyHold = false;

        console.log(this.game.player.inventory);
    }

    update(input) {
        if (input.includes('e')) {
            if (this.keyHold) {
                return;
            }
            if (!this.inventory.isOpen) {
                this.inventory.open();
            } else {
                this.inventory.close();
            }
            this.keyHold = true;
        } else {
            this.keyHold = false;
        }
    }
    
}

export { MenuHandler }