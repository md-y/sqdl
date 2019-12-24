#!/usr/bin/env node

const Util = require("../src/util");

const integration = require("./cli-integration");
const PARAMETERS = integration.PARAMETERS;

// Unmute if muted
if (global.muteSQDL) global.muteSQDL = false;

// Parsed Args
var commands = [];
var flags = [];
var parameters = {};

// Parse Args
let args = process.argv.slice(2);
if (args.length == 0) Util.newLine("Type 'sqdl help' for help.");

for (let i = 0; i < args.length; i++) {
    if (args[i][0] === "-") {
        // -flag
        if (args[i][1] !== "-") flags.push(args[i].slice(1, 2)); 
        // --parameter
        else {
            // Retrieves parameter key
            let key = args[i].slice(2);
            if (!(key in PARAMETERS)) {
                Util.newLine("Unknown parameter:", key);
                continue;
            }
            let suffixCount = PARAMETERS[key].suffixCount;

            // If suffixcount is -1, then search for values until the next parameter
            if (suffixCount === -1) {
                suffixCount = 1;
                while (i + suffixCount < args.length && args[i + suffixCount][0] !== "-") suffixCount += 1;
                suffixCount -= 1; // Remove extra count
            }

            // Get and remove values used by parameter
            let suffixes = args.splice(i + 1, suffixCount);
            if (suffixes.length < suffixCount) Util.printQuit("Not enough values for parameter(s)");

            // Check and execute parameter method
            if (suffixes.some(e => e[0] === "-")) Util.printQuit("Overlapping parameters"); // Fail if a parameter contains another
            parameters[key] = PARAMETERS[key].getValue(suffixes, parameters, flags);
        }
    } else {
        // command
        commands.push(args[i].toLowerCase()); 
    }
}

// Execute 
integration.run(commands, parameters, flags);