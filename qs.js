const qualState = require("./qualState.js");
// let path = "./user_input/INPUT.json";

let qualStateLocalhost = {
    "url": "https://plant22.co/",
    "headless": false,
    "maxStates": 3,
    "log": {
        "file": false,
        "console": false
      }
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
    await qualState.crawl(qualStateLocalhost);
})();
