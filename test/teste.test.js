const qualState = require('../qualState.js');
const localServer = require('./localhost/server.js');

const assert = require('assert');

describe('inputs', function () {
  it('Test Input', async function () {
    this.timeout(0);

    localServer.runServerSPA();

    let qualStateOptions = {
      "url": "https://medium.com/",

      // "ignore": {
      //   "ids_events": ["btnSubmit", "btnReq", "hoverTest", "aHref", "idTd1", "idTd2"]
      // },

      "headless": false,

      // "waitTime": 10000,

      "cookies": {
        "waitBefore": 9000,
        "btn": 'body > div:nth-child(27) > div > div > div > div.nq.nr.ns.nt.ge.gi.ah.nu.hx.nv > div > button',
        "waitAfter": 5000
      },

      "login": [
        {
          "info": {
            "wait": 1000
          }
        },
        {
          "action": {
            "id": "#root > div > div.ag.ah.ai > div.aj.ak.al.am.an.ao.ap.aq.ar > div > div > div > div.n.o.bc > span.ah.h.cc.bu.bv.bw > div",
            "event": "click"
          }
        },
        {
          "info": {
            "wait": 5000
          }
        },
        {
          "action": {
            "id": 'body > div:nth-child(27) > div > div > div > div > div > div > a',
            "event": "click"
          }
        },
        {
          "info": {
            "wait": 5000   
          }
        },
        {
          "credentials": {
            "#identifierId": "", //email
          }
        },
        {
          "action": {
            "id": '#identifierNext > div > button',
            "event": "click"
          }
        },
        {
          "info": {
            "wait": 5000   
          }
        },
        {
          "credentials": {
            "#password > div > div > div > input": "", //password
          }
        },
        {
          "action": {
            "id": '#passwordNext > div > button',
            "event": "click"
          }
        },
        {
          "info": {
            "wait": 6000
          }
        }
      ]
    };

    let value = await qualState.crawl(qualStateOptions);

    localServer.stopServerSPA();

    assert.equal(value.size, 2);
  });
});



