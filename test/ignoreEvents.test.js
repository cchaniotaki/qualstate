const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('ignoreEvents', function () {
  it('Test Ignore Events', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "maxStates": 3,
      "url": "http://localhost:3000/",
      "waitTime": 2000,
      "numberOfProcess": 8,
      "ignore": {
        "ids_events": ["/contact/", "_blank", "target"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 2);
  });
});