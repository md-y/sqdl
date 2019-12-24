const index = require("../src/index");
const Util = require("../src/util");
const options = require("../src/enum/option");
const tags = require("../src/enum/tag");
const metabooru = require("../src/enum/metabooru");
const pkg = require("../package.json");

// Arguments for executing commands and parameters
var commands = [];
var flags = [];
var parameters = {};

// Argument Functions
const COMMANDS = {
    help: {
        execute: function(args) {
            let midSize = 64;
            let helptext = [
                "SQDL - Sequence Downloader (v" + pkg.version + ") \n",
                "Request Usage: sqdl hostname {amount | MAX} [save location] [flags, parameters, ...] \n",
                "Commands:"
            ];

            for (let i in COMMANDS) helptext.push("\t" + Util.choose(COMMANDS[i].usage, i).padEnd(midSize) + COMMANDS[i].info);

            helptext.push("Parameters:");
            for (let i in PARAMETERS) helptext.push("\t" + Util.choose(PARAMETERS[i].usage, i).padEnd(midSize) + PARAMETERS[i].info);

            helptext.push("Flags:");
            for (let i in FLAGS) helptext.push("\t" + ("-" + i).padEnd(midSize) + FLAGS[i]);

            Util.printQuit(helptext);
        },
        info: "Prints this help text."
    },
    version: {
        execute: function(args) {
            Util.printQuit(pkg.version);
        },
        info: "Prints the installed version."
    },
    hosts: {
        execute: function(args) {
            Util.printQuit(Object.keys(options).map((e) => {
                return e[0].toUpperCase() + e.slice(1);
            }).sort());
        },
        info: "Lists all available hosts."
    },
    metabooru: {
        execute: function(args) {
            Util.newLine(Object.keys(metabooru));
        },
        info: "Lists all known working boorus from enum/metabooru.js."
    },

    // Command for hosts
    request: {
        execute: function(args) {
            if (args.length < 3) Util.printQuit("Invalid Arguments.");
            let host = index.hosts[args[0]]; // args[0] is known to be a host

            // Get options
            let hostOptions = host.getOptions();
            for (let i in parameters) if (i in hostOptions) hostOptions[i] = parameters[i];
            let allowFailures = flags.includes("a");
            Util.newLine("Using options: " + JSON.stringify(hostOptions) + "\n");

            // Request callback
            let saveImages = function(imgs) {
                Util.newLine("Downloading", imgs.length, "images. \n");
                imgs.downloadAll(args[2], (img, arr, remaining) => {
                    if (img) Util.updateLine("Writing image", arr.length - remaining, "of", arr.length); 
                });
            };
            
            // Request and Save Images
            if (!isNaN(args[1])) {
                host.requestCount(parseInt(args[1]), hostOptions, allowFailures).catch(Util.printQuit).then(saveImages);
            } else if (args[1].toLowerCase() === "max") {
                host.requestMax(hostOptions).catch(Util.printQuit).then(saveImages);
            } else Util.printQuit("Invalid Amount.");
        },
        info: "Requests images from a host",
        usage: "hostname {amount | MAX} (save location)"
    }
};

const PARAMETERS = {
    random: {
        getValue: function(args) {
            return true;
        },
        suffixCount: 0,
        usage: "--random",
        info: "Requests randomness from host"
    },
    tags: {
        getValue: function(args) {
            return args;
        },
        suffixCount: -1,
        usage: "--tags tag1 tag2 ... tag ",
        info: "Specifies tags for hosts"
    },
    bannedTypes: {
        getValue: function(args) {
            let arr = [];
            args.forEach((e) => {
                if (e in tags) arr.push(tags[e]);
            });
            return arr;
        },
        suffixCount: -1,
        usage: "--bannedTypes type1 type2 ... type ",
        info: "Bans formats and tags. Uses /enum/tag"
    },
    groupSize: {
        getValue: function(args) {
            let val = parseInt(args[0]);
            if (val < 1) val = 1;
            return val;
        },
        suffixCount: 1,
        usage: "--groupSize integer",
        info: "Specifies how many images will be downloaded concurrently"
    },
    boorusite: {
        getValue: function(args) {
            return args[0].replace("https://", "").replace("http://", "");
        },
        suffixCount: 1,
        usage: "--boorusite domianname",
        info: "Specifies the booru to use via its domain name"
    },
    subreddit: {
        getValue: function(args) {
            return args[0];
        },
        suffixCount: 1,
        usage: "--subreddit /r/name",
        info: "Specifies a Reddit subreddit or user."
    },
    sort: {
        getValue: function(args) {
            return args[0];
        },
        suffixCount: 1,
        usage: "--sort method",
        info: "Specifies the sorting parameter for hosts."
    },
    era: {
        getValue: function(args) {
            return args[0];
        },
        suffixCount: 1,
        usage: "--era time",
        info: "Specifies the time period parameter for hosts."
    },
    url: {
        getValue: function(args) {
            return args[0];
        },
        suffixCount: 1,
        usage: "--url link",
        info: "Specifies request URL."
    }
};

const FLAGS = {
    "a": "Allow failed images to count towards total image count"
};

// Main Function
function run(commandArgs, parametersArgs, flagsArgs) {
    commands = commandArgs ? commandArgs : [];
    parameters = parametersArgs ? parametersArgs : {};
    flags = flagsArgs ? flagsArgs : [];

    let cmd;
    if (commands[0] in COMMANDS) cmd = COMMANDS[commands[0]];
    // Exception for Hosts
    else if (commands[0] in index.hosts) cmd = COMMANDS.request;

    if (cmd) cmd.execute(commands.slice(0), parameters, flags);
    else Util.printQuit("Unknown Command");
}

module.exports = {
    COMMANDS: COMMANDS,
    PARAMETERS: PARAMETERS,
    FLAGS: FLAGS,
    run: run
};