const puppeteer = require('puppeteer');
const getEvents = require("./events/getEvents.js");
const xpath = require("./html/xpath.js");
const fs = require('fs');
const asyncQ = require('async');

const STATES_SPA = new Set();
let IDS_IGNORE_SPA_EVALUATION;
let queue;

const localhost = "http://localhost:5173/"
// const localhost = "http://qualweb.di.fc.ul.pt/placm/assertions/continent";

async function readFile() {
  fs.readFile('input/INPUT.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let dataParse = JSON.parse(data);
    IDS_IGNORE_SPA_EVALUATION = new Set(dataParse.qualstate.ignore.spa_evaluation);
  });
}

function init() {
  readFile();
}

async function run() {
  //____________________Init()_____________________________
  init();
  const browser = await puppeteer.launch({ headless: false });
  var [page] = await browser.pages();
  await page.goto(localhost, { waitUntil: 'networkidle2' });
  let body = await getContent(page);
  STATES_SPA.add({ _body: body, _selector: "original" });
  //____________________Check for events_____________________________
  const session = await page.target().createCDPSession();
  await xpath.createSelectorOnPage(session);
  const events = await getEvents.describe(session, IDS_IGNORE_SPA_EVALUATION);
  console.log(events);

  //____________________Crawl_________________________________________
  if (events.length != 0) {
    queue = asyncQ.queue(crawl, '2');
    events.forEach(async event => {
      queue.push({
        browser: browser,
        actionbefore: [event]
      });
    });
    queue.drain(() => {
      end(browser);
    });
  } else {
    end(browser);
  }
};

async function crawl(data) {
  let page = await buildPage(data.browser);
  const session = await page.target().createCDPSession();
  await performBeforeAction(page, data.actionbefore, session);
  if (!page.isClosed()) {
    await xpath.removeSelectorOnPage(session);
    let body = await getContent(page);
    await checkEventsNewPage(page, data.browser, body, session, data.actionbefore);
    page.close();
  }
}

async function buildPage(browser) {
  const page = await browser.newPage();
  await page.goto(localhost, { waitUntil: 'networkidle2' });
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

async function performBeforeAction(page, actions, session) {
  for await (const action of actions) {
    await xpath.createSelectorOnPage(session);
    await Promise.allSettled([
      page.waitForNetworkIdle(),
      page.click(action.selector)
    ]);
  }
}

async function getContent(page) {
  return await page.content();
}

async function checkEventsNewPage(page, browser, body, session, actionbefore) {
  if (!checkState(body)) {
    STATES_SPA.add({ _body: body, _selector: actionbefore });

    await xpath.createSelectorOnPage(session);
    const events = await getEvents.describe(session, IDS_IGNORE_SPA_EVALUATION); // qual o melhor id para utilizar

    events.forEach(async event => {
      let action = actionbefore.slice(0);
      action.push({
        eventType: event.eventType,
        selector: event.selector
      });
      queue.push({
        browser: browser,
        actionbefore: action
      });
    });
  }
}

function checkState(body) {
  for (const entry of STATES_SPA) {
    if (entry._body == body) {
      return true;
    }
  }
  return false;
}


async function end(browser) {
  await browser.close();
  console.log("--------------------------------");
  console.log("States_SPA Size: " + STATES_SPA.size);
  console.log("--------------------------------");
}

run();
