class Inventory {
    constructor() {
        this.data = [];
        this.selectedSlot = 0; // 0 - 35

        this.rows = 4;
        this.cols = 9;
        this.init();

        this.maxStackSize = 16; // 1 - 1024
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
            if (this.data[index_new].quantity + this.data[index_old].quantity > this.maxStackSize) {
                for (let i = 0; i < 1024; i++) {
                    this.addItemFrom(index_old, index_new);
                }
                return;
            }

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
            if (this.data[index_new].quantity + 1 > this.maxStackSize) return;
            this.data[index_new].quantity++;
            this.data[index_source].quantity--;
        }

        //If source runs out
        if (this.data[index_source].quantity <= 0) {
            this.setSlot(null, index_source, null);
        }
    }

    canAddItem(itemID) {
        for (let i = 0; i < this.rows * this.cols - 1; i++) {
            if (this.data[i].id === itemID && this.data[i].quantity < this.maxStackSize) {
                return true;
            }
            if (this.data[i].id === null) {
                return true;
            }
        }

        return false;
    }

    addItems(itemID) {
        for (let i = 0; i < this.rows * this.cols - 1; i++) {
            if (this.data[i].id === itemID && this.data[i].quantity < this.maxStackSize) {
                this.add(i);
                return;
            }
            if (this.data[i].id === null) {
                this.setSlot(itemID, i, 1);
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
            this.setSlot(null, index, null);
        }
    }
}

export { Inventory };