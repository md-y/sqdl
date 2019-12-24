const Requester = require("../requester");
const Util = require("../util");
const [Image, ImageArray] = require("../image");
const tag = require("../enum/tag");
const metabooru = require("../enum/metabooru");

class Booru extends Requester {
    static requestCount(amount, options, allowFailures=false) {
        super.requestCount(amount, options, allowFailures); 

        return new Promise((resolve, reject) => {
            // Retrieve Booru Metadata
            let boorusite = options.boorusite;
            if (boorusite.endsWith("/")) boorusite.splice(-1);
            let booruOptions = Booru.getBooruOptions(boorusite);
            if (boorusite.includes(":")) reject("Boorusite should not contain protocol, only specify domain.");
            if (boorusite === "default") reject("Default is not an actual host.");

            let url = "https://" + boorusite;
            try {
                url = new URL(url + booruOptions.postURL);
            } catch (err) {
                reject("Invalid Booru URL (" + options.booruSite + "). " + err);
            }

            if ("maxGroupSize" in booruOptions && options.groupSize > booruOptions.maxGroupSize) {
                Util.warn(`The group size is above the recommended (${options.groupSize} > ${booruOptions.maxGroupSize}).`,
                    "You may be blocked by the host.");
            }

            // Request 25% more listings than needed, then parse them
            // unless failures are going to be counted.
            if (amount > booruOptions.maxPosts) {
                Util.warn(`Too many image requests: ${amount} > ${booruOptions.maxPosts}. Responding with ${booruOptions.maxPosts}`);
                amount = booruOptions.maxPosts;
            }
            url.searchParams.append("limit", allowFailures ? amount : Math.round(amount * 1.25));
            
            // Add parameter for randomness
            url.searchParams.append("random", options.random);

            // Parse Tags
            if (options.tags) {
                for (let i in options.tags) {
                    let tagstring = options.tags[i];
                    if (tagstring === "rating:e") options.tags[i] = "rating:explicit";
                    else if (tagstring === "rating:s") options.tags[i] = "rating:safe";
                    else options.tags[i] = tagstring.replace(" ", "_");
                }
                url.searchParams.append("tags", options.tags.join("+"));
                url.search = url.search.replace(/%2B/g, "+"); // Decode "+"
            }

            Util.getJSON(url).then((res) => {
                if ("success" in res && !res.success) reject(res.message);
                if (!(res instanceof Array)) reject("Failed response from", boorusite);

                if (res.length == 0) Util.warn(boorusite, "returned no images.");
                else if (res.length < amount) Util.warn(`${boorusite} returned less images than requested. ${res.length} < ${amount}`);

                let skippedImages = 0;
                let images = new ImageArray(options.groupSize);
                for (let img of res) {
                    // Get URLs
                    let urls = [];
                    for (let i in booruOptions.fileObject) {
                        // Remove banned file versions
                        if (options.bannedTypes.includes(tag[i])) continue;
                        // Parse through version keys
                        for (let key of booruOptions.fileObject[i]) {
                            if (key in img) {
                                if (booruOptions.liberalVersioning && img.id) urls.push("sample_" + img[key] + "?" + img.id); 
                                urls.push(img[key]);
                            }
                        }
                    }

                    if (urls.length === 0) {
                        skippedImages++;
                        continue;
                    } 

                    // Attempt to fix URLs 
                    urls = urls.map(e => { // jshint ignore:line
                        if (!e.includes("http") && booruOptions.directoryHost && "directory" in img) {
                            if (!img.directory.endsWith("/")) img.directory += "/";
                            e = booruOptions.directoryHost + img.directory + "/" + e;
                        }
                        return e;
                    });
                    
                    urls.forEach(e => { // jshint ignore:line
                        if (!booruOptions.liberalVersioning) return;
                        // Liberal Versioning
                        if (booruOptions.directoryHost) urls.push(e.replace("/images/", "/samples/"));
                        if (e.includes("jpg")) urls.push(e.replace("jpg", "jpeg"));
                        else if (e.includes("jpeg")) urls.push(e.replace("jpeg", "jpg"));
                    });

                    // Create image object
                    let metadata = {};
                    for (let i in booruOptions.imageObject) {
                        // Parse through image keys
                        for (let key of booruOptions.imageObject[i]) {
                            if (key in img) {
                                metadata[i] = img[key];
                                continue;
                            }
                        }
                    }
                    images.push(new Image(urls, metadata));

                    // Break of enough images have been aquired
                    if (images.length >= amount) break;
                }

                if (amount > images.length - skippedImages) Util.warn(skippedImages, "images could not be downloaded.");

                resolve(images);
            }).catch(reject);
        });
    }

    static requestMax(options) {
        if (!options.boorusite) throw("No boorusite specified.");
        let max = Booru.getBooruOptions(options.boorusite).maxPosts;
        return Booru.requestCount(max, options, true);
    }

    static getBooruOptions(boorusite) {
        if(!boorusite) return metabooru.default;
        if (!(boorusite in metabooru)) {
            Util.warn("Using default booru settings for", boorusite);
            return metabooru.default;
        }
        return {...metabooru.default, ...metabooru[boorusite]};
    }
}

module.exports = Booru;