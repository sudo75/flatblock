import { Item_Directory } from '../generation/blocks.js';

class Inventory {
    constructor() {
        this.data = [];
        this.selectedSlot = 0; // 0 - 35 + 4 armour

        this.rows = 4;
        this.cols = 9;

        this.additional = 4;
        this.init();

        this.item_directory = new Item_Directory();

        this.maxStackSize = 16; // 1 - 1024
    }

    init() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data.push({id: null, quantity: null, durability: null});
            }
        }
    }

    setSlot(itemID, index, quantity, input_durability) {
        const durability = input_durability ? input_durability: this.item_directory.getProperty(itemID, 'durability');
                
        this.data[index].id = itemID;
        this.data[index].quantity = quantity;
        this.data[index].durability = durability ? durability: null;
    }

    swapItem(index_old, index_new) {
        if (index_old === index_new) {
            return;
        }
        if (this.data[index_new].id === this.data[index_old].id) { // If both slots have same item id

            const itemID = this.data[index_new].id;
            const maxStackSize = this.item_directory.getProperty(itemID, 'maxStackSize');

            if (this.data[index_new].quantity + this.data[index_old].quantity > maxStackSize) {
                for (let i = 0; i < 1024; i++) {
                    this.addItemFrom(index_old, index_new);
                }
                return;
            }

            this.data[index_new].quantity += this.data[index_old].quantity;
            this.setSlot(null, index_old, null, null);
        } else {
            const data_index_old = { ...this.data[index_old] };
            const data_index_new = { ...this.data[index_new] };
            this.data[index_new] = data_index_old;
            this.data[index_old] = data_index_new;
        }
        
    }

    addItemFrom(index_source, index_new) {
        const itemID = this.data[index_new].id;
        const maxStackSize = this.item_directory.getProperty(itemID, 'maxStackSize'); //Of new index
        
        if (this.data[index_source].quantity > 0 && this.data[index_new].id === null) { //If source has > 0 & new stack does not exist
            const data_index_source = { ...this.data[index_source] };
            this.data[index_new] = data_index_source;
            this.data[index_new].quantity = 1;

            this.data[index_source].quantity--;
        } else if (this.data[index_source].quantity > 0 && this.data[index_source].id === this.data[index_new].id) { //If source has > 0 & new stack exists
            if (this.data[index_new].quantity + 1 > maxStackSize) return;
            this.data[index_new].quantity++;
            this.data[index_source].quantity--;
        }

        //If source runs out
        if (this.data[index_source].quantity <= 0) {
            this.setSlot(null, index_source, null, null);
        }
    }

    canAddItem(itemID) {
        const maxStackSize = this.item_directory.getProperty(itemID, 'maxStackSize');
        for (let i = 0; i < this.rows * this.cols - 1; i++) {
            if (this.data[i].id === itemID && this.data[i].quantity < maxStackSize) {
                return true;
            }
            if (this.data[i].id === null) {
                return true;
            }
        }

        return false;
    }

    addItems(itemID, durability) {
        const maxStackSize = this.item_directory.getProperty(itemID, 'maxStackSize');
        for (let i = 0; i < this.rows * this.cols - 1; i++) {
            if (this.data[i].id === itemID && this.data[i].quantity < maxStackSize) { //If stack does not exist
                this.add(i);
                return;
            }
            if (this.data[i].id === null) { //create new stack for item
                this.setSlot(itemID, i, 1, durability); //durability for tools
                return;
            }
        }
    }

    add(index) {
        this.data[index].quantity++;
    }

    subtract(index) {
        this.data[index].quantity--;
        if (this.data[index].quantity <= 0) {
            this.setSlot(null, index, null, null);
        }
    }

    decrementDurability(index) {
        if (!this.data[index].durability) return; 
            
        this.data[index].durability--;

        if (this.data[index].durability <= 0) {
            this.subtract(index);
        }
    }
}

export { Inventory };