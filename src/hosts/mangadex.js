const Requester = require("../requester");
const [Image, ImageArray] = require("../image");
const MFA = require("mangadex-full-api");

class Mangadex extends Requester {
    static requestCount(amount, options, allowFailures=false) {
        super.requestCount(amount, options, allowFailures); 

        return new Promise(async (resovle, reject) => {
            let chapterQueue = [];

            if (options.url.includes("/chapter/")) { // If Chapter
                let urlID = (/\/chapter\/(\d+)/gmi).exec(options.url)[1];
                let urlChapter = await new MFA.Chapter(urlID, false);
                chapterQueue.push(urlChapter);
            } else if (options.url.includes("/title/")) { // If Manga
                let urlID = (/\/title\/(\d+)/gmi).exec(options.url)[1];
                let urlManga = await new MFA.Manga(urlID, true);
                chapterQueue = urlManga.chapters;
            } else reject("Invalid URL.");

            let images = new ImageArray(options.groupSize);
            for (let chapter of chapterQueue) {
                await chapter.fill();

                for (let pageNum in chapter.pages) {
                    let urls = [chapter.pages[pageNum], chapter.saverPages[pageNum]];
                    if (options.datasaver) urls = urls.reverse();
                    images.push(new Image(urls, {
                        // Get chapter hash from a URL using regex
                        title: (/\/([^\/]+)\/[^\/]+\.[^\/]+/gmi).exec(urls[0])[1] + "_" + pageNum,
                        artist: chapter.parentMangaID,
                        source: "Mangadex"
                    }));

                    if (images.length >= amount) break;
                }
            }
            
            resovle(images);
        });
    }

    static requestMax(options) {
        return Mangadex.requestCount(1000000, options, true);
    }
}

module.exports = Mangadex;