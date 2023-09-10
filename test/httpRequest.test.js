const qualState = require('../qualState');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('httpRequest', function () {
  it('Test Http Request', async function () {
    this.timeout(0);

    localServer.runServerSPA();
    localServer.runServerAPI();

    let qualStateOptions = {
      "url": "http://localhost:3000/",
      "ignore": {
        "ids_events": ["btnSubmit", "btnId", "aHref", "idTd1", "idTd2"]
      }
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();
    localServer.stopServerAPI();

    assert.equal(value.size, 4);
  });
});