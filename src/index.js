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
        reddit: require("./hosts/reddit")
    },
    tag: require("./enum/tag"),
};