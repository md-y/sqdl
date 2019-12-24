const Requester = require("../requester");
const option = require("../enum/option");
const tag = require("../enum/tag");
const Util = require("../util");
const [Image, ImageArray] = require("../image");

class Reddit extends Requester {
    static requestCount(amount, options, allowFailures=false) {
        super.requestCount(amount, options, allowFailures); 

        return new Promise((resovle, reject) => {
            let url = new URL("https://www.reddit.com");

            // Parse subreddit
            if (!(/^\/[ur]\//).test(options.subreddit)) { // Not /r/
                if ((/^[ur]\//).test(options.subreddit)) options.subreddit = "/" + options.subreddit; // Only r/
                else options.subreddit = "/r/" + options.subreddit.replace("/", "");
            }

            // Parse Sorting
            if (!["hot", "new", "controversial", "top", "rising"].includes(options.sort)) {
                Util.warn("Unknown Reddit Sorting:", options.sort + ". Defaulting to 'hot'");
                options.sort = "hot";
            }

            // Update base url
            url.pathname = options.subreddit + "/" + options.sort + ".json";

            // Parse era
            if (!["hour", "day", "week", "month", "year", "all"].includes(options.era)) {
                Util.warn("Unknown Reddit Era:", options.era + ". Defaulting to 'day'");
                options.sort = "day";
            }
            url.searchParams.append("t", options.era);

            // Parse amount
            // Request max listings, then parse them
            // unless failures are going to be counted.
            if (amount > 100) {
                Util.warn("Too many image requests:", amount, "> 100. Responding with 100");
                amount = 100;
            }
            url.searchParams.append("limit", allowFailures ? amount : 100);
            
            Util.getJSON(url).then(res => {
                if (!res.kind || res.kind !== "Listing") reject("Invalid response from Reddit.");
                if (!res.data || !res.data.children) reject("Reddit did not send any listing data.");

                let posts = res.data.children;
                if (posts.length < amount) Util.warn("Reddit returned less images than requested.", posts.length, "<", amount);

                let images = new ImageArray(options.groupSize);
                for (let i of posts) {
                    let p = i.data;
                    if ((p.quarantine && options.bannedTypes.includes(tag.REDDIT_QUARANTINE)) || (p.removed_by != null && options.bannedTypes.includes(tag.REDDIT_REMOVED))) continue;
                    
                    if (!p.post_hint || p.post_hint === "image") {
                        let urls = [];
                        if (!options.bannedTypes.includes(tag.REDDIT_SOURCE_FORMAT)) urls.push(p.url);
                        if (!options.bannedTypes.includes(tag.REDDIT_THUMBNAIL_FORMAT)) urls.push(p.thumbnail);

                        images.push(new Image(urls, {
                            title: p.id,
                            artist: p.author,
                            source: "Reddit"
                        }));
                    }

                    // Break of enough images have been aquired
                    if (images.length >= amount) break;
                }

                if (amount > images.length && res.length >= amount) Util.warn(res.length - images.length, "images could not be downloaded.");

                resovle(images);
            }).catch(reject);
        });
    }

    static requestMax(options) {
        return Reddit.requestCount(100, options, true);
    }
}

module.exports = Reddit;