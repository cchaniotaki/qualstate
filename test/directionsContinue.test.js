const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('directionsContinue', function () {
  it('Test Directions Continue', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_events": ["btnSubmit", "hoverTest", "aHref", "btnId", "btnReq", "idTd1", "idTd2"]
      },
      "interaction": {
        "directions": [
          {
            "actions": [
              {
                "values": {
                  "fname": "filipe",
                  "mname": "martins"
                },
                "action": {
                  "id": "btnSubmit",
                  "eventType": "click"
                },
                "info": {
                  "wait": 2000
                }
              },
              {
                "values": {
                  "newFName": "filipe"
                },
                "action": {
                  "id": "btnSubmitNewForm",
                  "eventType": "click"
                }
              }
            ],
            "info": {
              "crawl": "continue",
              "save": false
            }
          }
        ]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 1);
  });
});