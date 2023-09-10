const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('viewport', function () {
  it('Test Viewport', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "maxStates": 3,
      "viewport": {
        "mobile": true,
        "landscape": false,
        "resolution": {
          "width": 500,
          "height": 10000
        }
      },
      "ignore": {
        "ids_events": ["btnSubmit", "btnReq", "hoverTest", "aHref", "idTd1", "idTd2"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 3);
  });
});