const qualState = require("./qualState.js");
const {MitmproxyManager} = require("./mitmproxy");
// let path = "./user_input/INPUT.json";

require('dotenv').config();

// Access environment variables
const url = process.env.QUALSTATE_URL;
const headless = process.env.QUALSTATE_HEADLESS.toLowerCase() === 'true';
const proxy = process.env.QUALSTATE_PROXY.toLowerCase() === 'true';
const browser = process.env.QUALSTATE_BROWSER;
let browserPath = '';
if (browser === "chrome") {
    browserPath = process.env.QUALSTATE_CHROME_PATH;
} else { // edge
    browserPath = process.env.QUALSTATE_EDGE_PATH;
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


(async () => {

    if (proxy) {
        qualStateLocalhost.proxy = {
            host: process.env.QUALSTATE_PROXY_HOST,
            port: Number(process.env.QUALSTATE_PROXY_PORT)
        };
        await qualState.crawl(qualStateLocalhost);
        console.log("finished");
        // mitmproxyManager.stop()
    } else {
        await qualState.crawl(qualStateLocalhost);
        console.log("finished");
    }


})();

