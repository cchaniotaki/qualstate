// events
const eventsM = require("./events/events.js");
const actionsM = require("./events/action.js");

// html
const xpathM = require("./html/xpath.js");

// interections
const directionsM = require("./interections/directions.js");
const formsM = require("./interections/forms.js");
const inputsM = require("./interections/inputs.js");

// utils
const utilsM = require("./utils/utils.js");

// jsonSchema
const schema = require("./schema/schema.js");

// logger
const logger = require("./logger/logger.js");

// npm
const puppeteer = require('puppeteer');
const fs = require('fs');
const asyncQ = require('async');

const STATES_SPA_EVALUATION = new Set();
const STATES_SPA_COMPARE = new Set();

let IDS_IGNORE_SPA_EVENTS;
let IDS_IGNORE_SPA_COMPARE;
let FORMS;
let INPUTS;
let DIRECTIONS;

let url;
let numberOfProcess = 1;
let events = [];
let directionEvents = [];

let queue;

const localhost = "http://localhost:5173/"
// const localhost = "http://qualweb.di.fc.ul.pt/placm/assertions/continent";

async function readFile() {
  try {
    const data = fs.readFileSync('user_input/INPUT.json', 'utf8');
    
    let dataParse = JSON.parse(data);
    if (!schema.validateSchema(dataParse)) {
      return;
    }

    if (data && dataParse.qualstate != null) {
      url = dataParse.qualstate.url;

      if (dataParse.qualstate.process != null) {
        numberOfProcess = dataParse.qualstate.process;
      }

      if (dataParse.qualstate.ignore != null) {
        if (dataParse.qualstate.ignore.ids_compare != null) {
          IDS_IGNORE_SPA_COMPARE = new Set(dataParse.qualstate.ignore.ids_compare);
        }

        if (dataParse.qualstate.ignore.ids_events != null) {
          IDS_IGNORE_SPA_EVENTS = new Set(dataParse.qualstate.ignore.ids_events);
        }
      }
      if (dataParse.qualstate.interaction != null) {
        if (dataParse.qualstate.interaction.forms != null) {
          FORMS = new Set(dataParse.qualstate.interaction.forms);
        }

        if (dataParse.qualstate.interaction.inputs != null) {
          INPUTS = new Set(dataParse.qualstate.interaction.inputs);
        }

        if (dataParse.qualstate.interaction.directions != null) {
          DIRECTIONS = new Set(dataParse.qualstate.interaction.directions);

        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  // fs.readFile('user_input/INPUT.json', 'utf8', (err, data) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }

  //   let dataParse = JSON.parse(data);
  //   if (!schema.validateSchema(dataParse)) {
  //     return;
  //   }

  //   if (data && dataParse.qualstate != null) {
  //     url = dataParse.qualstate.url;

  //     if (dataParse.qualstate.process != null) {
  //       numberOfProcess = dataParse.qualstate.process;
  //     }

  //     if (dataParse.qualstate.ignore != null) {
  //       if (dataParse.qualstate.ignore.ids_compare != null) {
  //         IDS_IGNORE_SPA_COMPARE = new Set(dataParse.qualstate.ignore.ids_compare);
  //       }

  //       if (dataParse.qualstate.ignore.ids_events != null) {
  //         IDS_IGNORE_SPA_EVENTS = new Set(dataParse.qualstate.ignore.ids_events);
  //       }
  //     }
  //     if (dataParse.qualstate.interaction != null) {
  //       if (dataParse.qualstate.interaction.forms != null) {
  //         FORMS = new Set(dataParse.qualstate.interaction.forms);
  //       }

  //       if (dataParse.qualstate.interaction.inputs != null) {
  //         INPUTS = new Set(dataParse.qualstate.interaction.inputs);
  //       }

  //       if (dataParse.qualstate.interaction.directions != null) {
  //         DIRECTIONS = new Set(dataParse.qualstate.interaction.directions);

  //       }
  //     }
  //   }

  // run();
  // });
}

async function setup() {
  if (fs.existsSync('user_input/INPUT.json')) {
    await readFile();
  } else {
    logger.logDetails("error", {
      msg: "Não existe ficheiro de input"
    });
    return;
  }

  const browser = await puppeteer.launch({ headless: false });
  var [page] = await browser.pages();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const session = await page.target().createCDPSession();
  await utilsM.addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, "original", xpathM);

  // browser.on('targetdestroyed', async function () { // debug
  //   if ((await browser.pages()).length == 0) {
  //     endDebug();
  //   }
  // });

  if (DIRECTIONS != null && DIRECTIONS.length != 0) {
    await checkForDirections(browser);
  };
  await getEventAndInteraction(page, events);

  await crawl(browser);
  await queue.drain();
};

async function checkForDirections(browser) {
  let directionQueue = asyncQ.queue(directionsM.executeDirection, '1');
  DIRECTIONS.forEach(async direction => {
    let page = await buildPage(browser);
    directionQueue.push({
      page: page,
      direction: direction,
      directionEvents: directionEvents,
      STATES_SPA_EVALUATION: STATES_SPA_EVALUATION,
      STATES_SPA_COMPARE: STATES_SPA_COMPARE,
      IDS_IGNORE_SPA_COMPARE: IDS_IGNORE_SPA_COMPARE,
      actionsM: actionsM,
      utilsM: utilsM,
      xpathM: xpathM,
      getEventAndInteraction: getEventAndInteraction
    });
  });
  return directionQueue.drain();
}

async function getEventAndInteraction(page, events) {
  const session = await page.target().createCDPSession();
  await getEvents(session, events);
  await getInteraction(page, events);
}

async function getEvents(session, events) {
  await xpathM.createSelectorOnPage(session);
  await eventsM.getEvents(session, IDS_IGNORE_SPA_EVENTS, events);
}

async function getInteraction(page, events) {
  if (FORMS != null) {
    await formsM.getForms(page, FORMS, events);
  }
  if (INPUTS != null) {
    await inputsM.getInputs(page, INPUTS, events, utilsM);
  }
}

async function buildPage(browser) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.isNavigationRequest() == true && request.resourceType() != "xhr") {
      page.close();
    } else {
      request.continue();
    }
  });
  return page;
}

async function crawl(browser) {
  if (events.length != 0 || directionEvents.length != 0) {
    queue = asyncQ.queue(explore, numberOfProcess);
    queue.drain(() => {
      end(browser);
    });
    
    // events.forEach(async event => {
    //   directionEvents.push([event]);
    // });

    directionEvents.forEach(async direction => {
      queue.push({
        browser: browser,
        actionbefore: direction
      });
    });

    events.forEach(async event => {
      queue.push({
        browser: browser,
        actionbefore: [event]
      });
    });
  } else {
    end(browser);
  }
}

async function addQueue(events, browser, actionbefore) {
  events.forEach(async event => {
    let action = actionbefore.slice(0);
    action.push(event);
    queue.push({
      browser: browser,
      actionbefore: action
    });
  });
}

async function explore(data) {
  let page = await buildPage(data.browser);
  const session = await page.target().createCDPSession();
  await actionsM.performBeforeAction(page, data.actionbefore, session, xpathM);
  if (!page.isClosed()) {
    if (await utilsM.addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, data.actionbefore, xpathM)) {
      await xpathM.createSelectorOnPage(session);
      const events = [];
      await getEventAndInteraction(page, events);
      await addQueue(events, data.browser, data.actionbefore)
    }
    page.close();
  }
}

async function end(browser) {
  await browser.close();
  result();
}

async function endDebug() {
  result();
}

function result() {
  console.log("--------------------------------\n"
    + "STATES_SPA_EVALUATION Size: " + STATES_SPA_EVALUATION.size
    + "\n--------------------------------");
}

async function run(){
  await setup();
  return STATES_SPA_EVALUATION.size;
}

module.exports = { run };

// run();

// console.log(run().then((value) => {
//   return value;
// }));


async function s(){
  let i = await run();
  console.log(i);
  // return STATES_SPA_EVALUATION.size;
}

s();

//    ../../QualState/qualstate/package.json
//    C:\Users\Filipe\Desktop\QualState\qualstate
//    C:\Users\Filipe        \QualState\qualstate\package.json'



// 1:38:13 15 estados - 1
// 1:34:52 15 estados - 2

// 1:22:70 15 estados - 4
// 1:18:42 15 estados - 5
// 1:09:60 15 estados - 6