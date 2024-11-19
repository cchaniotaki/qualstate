const qualState = require("./qualState.js");
const {MitmproxyManager} = require("./mitmproxy");
// let path = "./user_input/INPUT.json";

require('dotenv').config();

// Access environment variables
const url = process.env.URL;
const headless = process.env.HEADLESS.toLowerCase() === 'true';
const proxy = process.env.PROXY.toLowerCase() === 'true';
const browser = process.env.BROWSER;
let browserPath = '';
if (browser === "chrome") {
    browserPath = process.env.CHROME_PATH;
} else { // edge
    browserPath = process.env.EDGE_PATH;
}

console.log("Headless: " + headless)
console.log("browser: " + browser)

let qualStateLocalhost = {
    "url": url,
    "headless": headless,
    "executablePath": browserPath,
    "log": {
        "file": true, "console": true
    },
    "browser": browser
};


// (async () => {
//     const args = Array.from(process.argv).slice(2);
//     try {
//         if (args.length === 0) {
//             await qualState.crawl(qualStateLocalhost);
//         } else {
//             await qualState.crawl(args[0]);
//         }
//     } catch (err) {
//         console.error(err);
//     }
// })();


(async () => {

    if (proxy) {
        const mitmproxyPath = process.env.MITMPROXY_PATH + "mitmdump";
        const proxyPort = process.env.PROXY_PORT;
        const cachePath = process.env.CACHE_PATH_WITH_NAME;
        console.log("cachePath");
        console.log(cachePath);
        // Example usage
        const mitmproxyManager = new MitmproxyManager(mitmproxyPath, proxyPort, cachePath);
        await mitmproxyManager.start();
        qualStateLocalhost.proxy = {
            host: process.env.PROXY_HOST,
            port: Number(process.env.PROXY_PORT)
        };
        await qualState.crawl(qualStateLocalhost);
        console.log("finished");
        mitmproxyManager.stop()
    } else {
        await qualState.crawl(qualStateLocalhost);
        console.log("finished");
    }


})();

