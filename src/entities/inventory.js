class Inventory {
    constructor() {
        this.data = [];
        this.selection_index = 0; // 0 - 35
    }

    setSlot(itemID, index, quantity) {
        this.data[index].id = itemID;
        this.data[index].quantity = quantity ? quantity: 1;
    }
}



export { Inventory };