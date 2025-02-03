class Inventory {
    constructor() {
        this.data = [];
        this.selectedSlot = 0; // 0 - 35

        this.rows = 4;
        this.cols = 9;
        this.init();

        this.maxStackSize = 16;
    }

    init() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data.push({id: null, quantity: null});
            }
        }
    }

    setSlot(itemID, index, quantity) {
        this.data[index].id = itemID;
        this.data[index].quantity = quantity;
    }

    swapItem(index_old, index_new) {
        if (index_old === index_new) {
            return;
        }
        if (this.data[index_new].id === this.data[index_old].id) { // If both slots have same item id
            this.data[index_new].quantity += this.data[index_old].quantity;
            this.setSlot(null, index_old, null);
        } else {
            const data_index_old = { ...this.data[index_old] };
            const data_index_new = { ...this.data[index_new] };
            this.data[index_new] = data_index_old;
            this.data[index_old] = data_index_new;
        }
        
    }

    addItemFrom(index_source, index_new) {
        if (this.data[index_source].quantity > 0 && this.data[index_new].id === null) { //If source has > 0 & new stack does not exist
            const data_index_source = { ...this.data[index_source] };
            this.data[index_new] = data_index_source;
            this.data[index_new].quantity = 1;

            this.data[index_source].quantity--;
        } else if (this.data[index_source].quantity > 0 && this.data[index_source].id === this.data[index_new].id) { //If source has > 0 & new stack exists
            this.data[index_new].quantity++;
            this.data[index_source].quantity--;
        }

        //If source runs out
        if (this.data[index_source].quantity <= 0) {
            this.setSlot(null, index_source, null);
        }
    }

    add(fromIndex) {
        this.data[fromIndex].quantity++;
    }

    subtract(fromIndex) {
        this.data[fromIndex].quantity--;
        if (this.data[fromIndex].quantity <= 0) {
            this.setSlot(null, fromIndex, null);
        }
    }
}

export { Inventory };