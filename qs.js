const qualState = require("./qualState.js");
// let path = "./user_input/INPUT.json";

let qualStateLocalhost = {
    "url": "http://localhost:4000/",
    "headless": true,
    "maxStates": 2,
    "log": {
        "file": true,
        "console": true
      }
};

(async () => {
    await qualState.crawl(qualStateLocalhost);
})();

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