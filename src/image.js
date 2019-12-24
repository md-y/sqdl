const Util = require("./util");
const fs = require('fs');

const METADATA_TEMPLATE = {
    title: "Untitled",
    artist: "Unknown",
    source: "Unknown"
};

class Image {
    constructor(versions, metadata={}) {
        if (!(versions instanceof Array)) versions = [versions];
        this.versions = versions;

        for (let i in METADATA_TEMPLATE) if (!(i in metadata)) metadata[i] = METADATA_TEMPLATE[i];

        this.metadata = metadata;

        this.data = null;
        this.filetype = null;
    }

    /**
     * Downloads the image data using the 'versions' array
     */
    async download() {
        let err;
        if (this.versions.length === 0) throw "No versions to download";
        for (let i of this.versions) {
            if (!i.includes(":")) i = "https://" + i;

            try {
                let res;
                if (i.startsWith("data:")) { // data:
                    if (i.includes("base64")) {
                        let encoded = i.split(";")[1].split(",")[1];
                        res = Buffer.from(encoded, "base64");
                    }
                } else { // https:
                    res = await Util.getHTTPS(i);
                }
                if (!res || typeof(res) === "string") {
                    err = "Host returned invalid response.";
                    continue;
                }
                this.data = res;
                this.filetype = this.getVersionFileType(i);
                return this;
            } catch (e) {
                if (err !== undefined) continue;
                else if (typeof(err) === "string") err = e;
                else if (e) err = e.toString();
            }
        }
        if (!err) err = "Unknown Error.";
        throw err;
    }

    getVersionFileType(ver) {
        if (typeof(ver) === "number") ver = this.versions[ver];
        let lastSlash = ver.lastIndexOf("/");
        let lastDot = ver.lastIndexOf(".");
        if (lastDot > lastSlash) {
            // Get section after dot and remove any URL parts
            return ver.slice(lastDot + 1).replace(/[\#\?].*/gmi, "");
        }
        return "bmp";
    }
}

class ImageArray extends Array {
    constructor(groupSize=20) {
        super();
        this.groupSize = groupSize;
    }

    /**
     * Downloads every image in this array. 
     * @param {String} location Folder to save these images to (optional).
     * @param {Function} onEachCallback Called after every download. Args: img, array, amount of remaining images
     */
    downloadAll(location, onEachCallback) {
        return new Promise((resolve, reject) => {
            let currentGroupSize = this.groupSize;
            let queue = new Array(...this);
            let inProgress = currentGroupSize; // This is the max amount at a time

            // Parse Saving
            if (typeof(location) === "string") {
                // Parse Location Path and make Location Folder
                location = location.replace("/", "\\");
                if (location[location.length - 1] !== "\\") location += "\\";
                fs.mkdirSync(location, { recursive: true });
            } else if (typeof(location) === "function") {
                // If location is onEachCallback, switch
                onEachCallback = location;
                location = undefined;
            } else if (location) throw "Invalid arguments";

            // Main callback for images
            let arr = this;
            let failedImages = 0;
            let getNextImage = function(res) {
                // Save image (async)
                if (location && res) {
                    if (!(res instanceof Image)) {
                        if (typeof(res) === "string") Util.warn("Could not download image:", res);
                        failedImages++;
                    } else if (!res.data) Util.warn("No data for " + res.metadata.title);
                    else {
                        let file = location + res.metadata.title;
                        let ext = "." + res.filetype;
                        let path = file + ext;
                        if (fs.existsSync(path)) for (let i = 1; fs.existsSync(path); i++) path = file + " (" + i + ")" + ext;
                        fs.writeFile(path, res.data, (err) => {
                            if (err) Util.warn("Error while saving image " + res.metadata.title + ":", err);
                        });
                    }
                }

                if (queue.length > 0) queue.pop().download().then(getNextImage, getNextImage);
                else if (inProgress > 1) inProgress--; // If there are others besides this one
                else {
                    if (failedImages > 0) Util.warn(failedImages, "images could not be downloaded.");
                    resolve(arr); // If last one, resolve entire promise
                }

                // Callback
                if (onEachCallback) onEachCallback(res, arr, queue.length + inProgress - 1); 
            };

            //Call 1st group
            for (let i = 0; i < currentGroupSize; i++) getNextImage();
        });
    }
}

module.exports = [ Image, ImageArray ];