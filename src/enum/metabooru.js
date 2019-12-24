/**
 * Info from: https://raw.githubusercontent.com/AtlasTheBot/booru/master/src/sites.json
 */

module.exports = {
    "default": {
        postURL: "/index.php?json=1&page=dapi&s=post&q=index",
        maxPosts: 1000,
        fileObject: {
            "BOORU_DEFAULT_FORMAT": ["image", "file_url"],
            "BOORU_LARGE_FORMAT": ["large_file_url"],
            "BOORU_SAMPLE_FORMAT": ["sample_url"],
            "BOORU_PREVIEW_FORMAT": ["preview_file_url","preview_url"],
            "BOORU_SOURCE_FORMAT": ["source"]
        },
        imageObject: {
            "title": ["hash", "md5"],
            "artist": ["tag_string_artist", "author", "poster", "owner"]
        }
    },
    "danbooru.donmai.us": {
        postURL: "/posts.json?utf8=%E2%9C%93",
        maxPosts: 200
    },
    "yande.re": {
        postURL: "/post.json",
        maxGroupSize: 5,
    },
    "safebooru.org": {
        directoryHost: "https://safebooru.org/images/"
    },
    "tbib.org": {
        directoryHost: "https://tbib.org/images/",
        liberalVersioning: true
    },
    "rule34.xxx": {
        directoryHost: "https://us.rule34.xxx/images/"
    },
    "e621.net": {
        postURL: "/post/index.json?"
    },
    "xbooru.com": {
        directoryHost: "https://img.xbooru.com/images/",
        liberalVersioning: true
    },
    "e926.net": {
        postURL: "/post/index.json?"
    },
    "konachan.com": {
        postURL: "/post.json?"
    },
    "konachan.net": {
        postURL: "/post.json?"
    },
    "derpibooru.org": {
        postURL: "/search.json?"
    },
    "hypnohub.net": {
        postURL: "/post/index.json?"
    },
    "realbooru.com": {
        directoryHost: "https://realbooru.com/images/"
    }
};

/*

postUrl: url suffix
maxPosts: limit for &limit 

maxGroupSize: recommended group size (optional)
directoryHost: (value/)directory #/image url (optional)
liberalVersioning: will guess 'sample' images and many filetypes

fileObject: {
    ENUM_KEY: array of response keys
}
imageObject: {
    image_metadata_key: array of response_keys
}

*/