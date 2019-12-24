const option = require("./enum/option");

class Requester {
    static getOptions() {
        // Returns options using the class name as a key
        // Returns copied object
        return {...option[this.name.toLowerCase()]};
    }

    static requestCount(amount, options, allowFailures=false) {
        if (isNaN(amount)) throw "Invalid amount argument.";

        // Replace invalid options with default ones
        let def = this.getOptions();
        for (let i in def) if (!(i in options) || typeof(options[i]) !== typeof(def[i])) options[i] = def[i];
        for (let i in options) if (!(i in def)) delete options[i];
    }

    static requestMax(options) {
        return;
    }
}

module.exports = Requester;