const tag = require("./tag");

module.exports = {
    booru: {
        /** Domain name of the booru 
         *  @type {String} */
        boorusite: "danbooru.donmai.us",
        /**  @type {Array<String>} */
        tags: [ "rating:safe" ],
        /** Not available for all boorus 
         * @type {Boolean} */
        random: false,
        /** Banned Images Formats
         *  @type {Array<Tag>} */
        bannedTypes: [ tag.BOORU_PREVIEW_FORMAT, tag.BOORU_SOURCE_FORMAT ],
        /** How many images will be downloaded concurrently
         * @type {Number} */
        groupSize: 30
    },
    reddit: {
        /** Subreddit or user
         * @type {String} */
        subreddit: "/r/all",
        /** Sort by hot, top, new, etc.
         * @type {String} */
        sort: "hot",
        /** Era of all, year, day, etc. 
         * @type {String} */
        era: "day",
        /** Banned post types 
         * @type {String} */
        bannedTypes: [ tag.REDDIT_QUARANTINE, tag.REDDIT_REMOVED, tag.REDDIT_THUMBNAIL_FORMAT ],
        /** How many images will be downloaded concurrently
         * @type {Number} */
        groupSize: 50
    },
    url: {
        /** Website to scan images for 
         * @type {string} */
        url: "about:blank",
        /** How many images will be downloaded concurrently
         * @type {Number} */
        groupSize: 50
    }
};