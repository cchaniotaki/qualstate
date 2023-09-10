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
        "ids_compare": [
          "pIdTd"
        ],
        "ids_events": ["btnSubmit", "btnId", "aHref", "idTd1", "idTd2"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 4);
  });
});