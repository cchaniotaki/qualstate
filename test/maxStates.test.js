const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('maxStates', function () {
  it('Test Max States', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "maxStates": 3,
      "ignore": {
        "ids_events": ["btnId", "hoverTest", "btnId", "aHref"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 3);
  });
});