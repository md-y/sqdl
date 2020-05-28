module.exports = {
    /**
     * All available requesters
     * @enum {Requester}
     */
    hosts: {
        /** @extends {Requester} */
        url: require("./hosts/url"),
        /** @extends {Requester} */
        booru: require("./hosts/booru"),
        /** @extends {Requester} */
        reddit: require("./hosts/reddit"),
        /** @extends {Requester} */
        mangadex: require("./hosts/mangadex")
    },
    tag: require("./enum/tag"),
};