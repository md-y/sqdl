const https = require("https");
const Stream = require("stream").Transform;

module.exports = {
    getHTTPS: function(url) {
        if (typeof url === "string") url = new URL(url);
        return new Promise((resolve, reject) => {
            if (url.protocol !== "https:") reject("Invalid protocol (http instead of https?)");
            
            https.request(url, {
                method: "GET",
                timeout: 60000,
                headers: {
                    "User-Agent": "sqdl"
                }
            }, (res) => { 
                let payload = new Stream();
                
                res.on("data", (data) => {
                    payload.push(data);
                });

                res.on("end", () => {
                    let data = payload.read();

                    if (res.statusCode > 400) reject(new Error("Server returned " + res.statusCode));
                    else if (!data || data === null) reject(new Error("Bad response from " + url.href));
                    else if (data) {
                        if (res.headers["content-type"].includes("text")) data = data.toString();
                        resolve(data);
                    } else reject(new Error("Unknown error."));
                });
            }).on("error", reject).end();
        });
    },
    getJSON: function(url) {
        return new Promise(async (resolve, reject) => {
            try {
                let payload = await module.exports.getHTTPS(url);
                let json = JSON.parse(payload.toString());
                resolve(json);
            } catch (err) {
                reject("Cannot parse JSON: " + err);
            }
        });
    },
    warn: function(...text) {
        if (!global.muteSQDL) process.emitWarning(text.join(" "));
    },
    newLine: function(...text) {
        if (global.muteSQDL) return;
        if (text.length == 1 && text[0] instanceof Array) text[0] = text[0].join("\n");
        process.stdout.write("\n" + text.join(" "));
    },
    updateLine: function(...text) {
        if (global.muteSQDL) return;
        process.stdout.write("\r" + text.join(" ").padEnd(64));
    },
    quit: function(code) {
        if (code) process.exit(code);
        else process.exit();
    },
    printQuit: function(...text) {
        module.exports.newLine(...text);
        module.exports.quit();
    },
    choose: function(...vars) {
        for (let i of vars) if (i) return i;
    }
};