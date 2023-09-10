const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('ignoreCompare', function () {
  it('Test Ignore Compare', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "waitTime": 2000,
      "ignore": {
        "ids_compare": [
          "z-index: 3;"
        ],
        "ids_events": ["btnReq", "hoverTest", "btnId", "aHref", "idTd1", "idTd2"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 1);
  });
});