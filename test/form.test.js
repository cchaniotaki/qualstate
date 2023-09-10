const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('form', function () {
  it('Test Form', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_events": ["btnReq", "hoverTest", "btnId", "aHref", "idTd1", "idTd2"]
      },
      "interaction": {
        "forms": [
          {
            "input": [
              {
                "fname": "filipe"
              }
            ],
            "action": {
              "id": "btnSubmit",
              "event": "click"
            },
            "info": {
              "formId": "idForm"
            },
          },
          {
            "input": [
              {
                "newFName": "filipe"
              }
            ],
            "action": {
              "id": "btnSubmitNewForm",
              "event": "click"
            },
            "info": {
              "formId": "newForm"
            }
          }
        ]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 5);
  });
});