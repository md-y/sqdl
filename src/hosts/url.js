const Requester = require("../requester");
const option = require("../enum/option");
const tag = require("../enum/tag");
const Util = require("../util");
const [Image, ImageArray] = require("../image");

class Url extends Requester {
    static requestCount(amount, options, allowFailures=false) {
        super.requestCount(amount, options, allowFailures); 

        return new Promise((resovle, reject) => {
            // Resolve if useless
            if (options.url === "about:blank") resovle(new ImageArray(options.groupSize));

            // Request
            let url = new URL(options.url);
            Util.getHTTPS(url).then((res) => {
                let images = new ImageArray(options.groupSize);
                for (let i of res.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gmi)) {
                    let img = i[1];
                    if (!i[1].includes(":")) img = url.host + img;
                    let filename = img.search(/([^\/]+)\.[^.]*$/gmi);
                    if (!filename || filename < 0 || filename === "") filename = "Unknown";
                    images.push(new Image([img], {
                        title: filename,
                        artist: url.host,
                        source: "url"
                    }));
                    if (images.length >= amount) break;
                }
                resovle(images);
            }).catch(reject);
        });
    }

    static requestMax(options) {
        return Url.requestCount(100000, options, true);
    }
}

module.exports = Url;