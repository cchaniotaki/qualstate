# QualWeb core

QualState is an automatic SPA(Single Page Application) crawler

## How to run

```javascript
const qualstate = require("qualstate");

let qualStateOptions = {
    "url": "http://localhost:4000/",
    "headless": true,
    "maxStates": 2
};

(async () => {
    await qualState.crawl(qualStateOptions);
})();
```

## Options

The available options fot the **crawl()** function are:

```jsonc
{
  "url": "http://localhost:3000/", // url to evaluate
  "headless": false, // value of headless to use on puppeteer. Default value = false 
  "waitTime": 2000, // time to wait between actions
  "maxStates": 2, // number of maximum states to be found
  "numberOfProcess": 3, // Number of concurrent processes. Default value = 1
  "log": {
    "file": true, // Logs errors to a file. Default value = false
    "console": false // Logs errors to the console. Default value = false
  },

  "cookies": {
        "waitBefore": 9000,  // time to wait before clicking in the btn
        "btn": "body > div:nth-child(27) > div > div > div > div.nq.nr.ns.nt.ge.gi.ah.nu.hx.nv > div > button", // XPaht or ID of btn
        "waitAfter": 5000  // time to wait after clicking in the btn
  },
  "login": [
        {
          "credentials": {// Credential
            "#identifierId": "", // key:value, where key is the ID of input and value the input - in this case could be email
          }
        },
        {
          "credentials": {// Credential
            "#password > div > div > div > input": "", // key:value, where key is the ID of input and value the input - in this case could be password
          }
        },
        {
          "action": {
            "id": "#login_button", // Id of button to execute login action in the page
            "event": "click"// type of event to be executed
          }
        },
        {
          "info": { 
            "wait": 6000  // time to wait for the login to be executed
          }
        }
      ],
  "viewport": {
    "mobile": false, // default value = false
    "landscape": true, // default value = viewPort.width > viewPort.height
    "resolution": {
      "width": 1920, // default value for desktop = 1366, default value for mobile = 1080
      "height": 1080 // default value for desktop = 768, default value for mobile = 1920
    }
  },
  "ignore": {
    "ids_compare": ["pErrorMessage"], // array of IDs or any identifying attribute of element that should be ignore when comparing states.
    "ids_events": ["btnReq", "hoverTest", "btnId", "aHref", "idTd1", "idTd2"] // array of IDs of element that have events and should be ignore.
  },
  "interaction": {
    "inputs": [ // array of inputs, that will be executed on the page if the inputs exist
      {
        "value": { // one or more key:value, where key is the ID of input and value the input value
          "onChangeInput": "inputOnChange"
        },
        "info": {
          "wait": 2000 // time to wait after executing the inputs
        }
      }
    ],
    "forms": [ // array of forms, that will be executed on the page if the forms exist
      {
        "input": [ // array inputs to be place on the form
          { // one or more key:value, where key is the ID of input and value the input value
            "fname": "filipe"
          }
        ],
        "action": { // action that submits the form
          "id": "btnSubmit", // ID of the element
          "event": "click" // type of event to be executed
        },
        "info": {
          "formId": "idForm" // ID of the form
        },
      }
    ],
    "directions": [ // array of directions, that will be executed at the beginning of the crawl process
      {
        "actions": [ // array of actions to be executed for each directions
          {
            "values": { // one or more key:value, where key is the ID of input and value the input value
              "fname": "Name"
            },
            "action": { // action that should be trigger
              "id": "btnSubmit", // ID of the element
              "eventType": "click" // type of event to be executed
            }
          },
          {
            "values": {
              "newFName": "Name"
            },
            "action": {
              "id": "btnSubmitNewForm",
              "eventType": "click"
            }
          }
        ],
        "info": {
          "crawl": "stop", // flag to know if the crawl process shoulf continue after the directions process. Value = "stop" || "continue"
          "save": true // save the states during the directions process
        }
      }
    ]
  }
}
```

## Report details

At the end of the process there is a report to the user. The report its divide in two different set of information. In case console was true, there's only one report.

Console:
```jsonc
info: 20:46:13
{
  "msg": "Ação realizada",
  "action": [
    {
      "user": "auto",
      "id": "input#btnSubmit",
      "className": "HTMLInputElement",
      "eventType": "click",
      "selector": "html > body:nth-child(2) > div:nth-child(1) > form:nth-child(1) > input:nth-child(10)"
    }
  ],
  "bodyHash": "1704e38477f0c68cc992b23b6390e77576a2e66121c80496deab4594752a1446"
}
```

In case the file was true there's two reports
File *logs.log*:
```jsonc
info: 20:46:13
{
  "msg": "Ação realizada",
  "action": [
    {
      "user": "auto",
      "id": "input#btnSubmit",
      "className": "HTMLInputElement",
      "eventType": "click",
      "selector": "html > body:nth-child(2) > div:nth-child(1) > form:nth-child(1) > input:nth-child(10)"
    }
  ],
  "bodyHash": "1704e38477f0c68cc992b23b6390e77576a2e66121c80496deab4594752a1446"
}
```

File *states.log*
```jsonc
info: 20:46:13
{
  "bodyHash": "1704e38477f0c68cc992b23b6390e77576a2e66121c80496deab4594752a1446",
  "body": "<!DOCTYPE html><html>......n</body></html>"
}
```


gia na mporeso na trekso to firefox eprepe na kano auto:

PUPPETEER_PRODUCT=firefox npm install
npx puppeteer browsers install firefox
I have created a .env file for the var variables that i need.
In order to run all the browsers together i have the start.sh


prospathisa na to trekso alla to ergaleio xrisimopoiei to tool tou  chrome ara den mporo na to trekso gia kati allo ektos apo chromioun.

opote as doume pso trexeiem proxy
