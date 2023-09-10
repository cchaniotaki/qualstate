const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('ignoreEvents', function () {
  it('Test Ignore Events', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "log": {
        "file": false,
        "console": false
      },
      "ignore": {
        "ids_events": ["z-index", "btnId", "btnReq", "hoverTest", "aHref", "idTd1", "idTd2"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 2);
  });
});