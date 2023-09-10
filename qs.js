const qualState = require("./qualState.js");

let path = "./user_input/testeSPA.json";
// cmd - nodeqs.js "path"

// let qualStateOptions = {
//     "qualstate": {
//         "url": "http://localhost:4000/",
//         "maxStates": 5,
//         "ignore": {
//             "ids_events": ["btnSubmit", "btnReq", "hoverTest", "aHref"]
//         }
//     }
// };

let qualStateOptions = {
    "url": "https://plant22.co/",
    "waitTime": 2000,
    "ignore": {
        "ids_events": ["/contact/", "_blank", "target"]
    }
};

(async () => {
    const args = Array.from(process.argv).slice(2);
    try {
        if (args.length === 0) {
            qualState.crawl(qualStateOptions);
        } else {
            qualState.crawl(args[0], true);
        }
    } catch (err) {
        console.error(err);
    }
})();


// let qualStateOptions = {
//   "qualstate": {
//     "url": "http://localhost:4000/",
//     "ignore": {
//       "ids_events": ["z-index: 3;", "btnSubmit", "hoverTest", "aHref"]
//     }
//   }
// };


// "ignore": {
//   "ids_compare": ["z-index: 3; position: absolute; height: 100%; width: 100%; padding: 0px; border-width: 0px; margin: 0px; left: 0px; top: 0px; touch-action: pan-x pan-y;"],
//   "ids_events": ["/contact/", "_blank", "target"]
// }

// let qualStateOptions = {
//   "qualstate": {
//     "url": "https://plant22.co/",
//     "ignore": {
//       "ids_events": ["btnSubmit", "hoverTest", "btnId", "aHref"]
//     },
//     "interaction": {
//       "directions": [
//         {
//           "actions": [
//             {
//               "action": {
//                 "id": "html > body:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > nav:nth-child(4) > a:nth-child(4)",
//                 "eventType": "click"
//               },
//               "info": {
//                 "wait": 1000
//               }
//             }
//           ],
//           "info": {
//             "crawl": "continue",
//             "save": true
//           }
//         }
//       ]
//     }
//   }
// };