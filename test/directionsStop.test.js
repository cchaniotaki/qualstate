const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('directionsStop', function () {
  it('Test Directions Stop', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_events": ["btnSubmit", "btnReq", "hoverTest", "btnId", "aHref", "idTd1", "idTd2"]
      },
      "interaction": {
        "directions": [
          {
            "actions": [
              {
                "values": {
                  "#idForm > input[type=text]:nth-child(4)": "filipe"
                },
                "action": {
                  "id": "btnSubmit",
                  "eventType": "click"
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
              "crawl": "stop",
              "save": true
            }
          }
        ]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 3);
  });
});