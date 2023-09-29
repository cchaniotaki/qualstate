const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('regex', function () {
  it('Test Regex', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_compare": [
          "pIdTd"
        ],
        "ids_events": ["btnSubmit", "btnReq", "btnId", "hoverTest", "aHref"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 1);
  });
});