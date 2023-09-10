const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('inputs', function () {
  it('Test Input', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_events": ["btnSubmit", "btnReq", "hoverTest", "btnId", "aHref", "idTd1", "idTd2"]
      },
      "interaction": {
        "inputs": [
          {
            "value": {
              "onChangeInput": "inputOnChange"
            },
            "info": {
              "wait": 2000
            }
          }
        ]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 2);
  });
});