class Utils {
    constructor() {

    }

    randomBool(chance) {
        const rand = Math.ceil(Math.random() * 100);

        if (rand <= chance) {
            return true;
        }
        return false;
    }
}

export { Utils };