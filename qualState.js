// events
const eventsM = require("./events/events.js");
const actionsM = require("./actions/action.js");

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

// loggerM
const loggerM = require("./logger/logger.js");

// npm
const puppeteer = require('puppeteer');
const fs = require('fs');
const {proxyRequest} = require('puppeteer-proxy');
const asyncQ = require('async');

const STATES_SPA_EVALUATION = new Set();
const STATES_SPA_COMPARE = new Set();

let numberOfProcess = 1;
let headlessOption = true;
let executablePath = null;
let browserType = null;
let IDS_IGNORE_SPA_EVENTS;
let IDS_IGNORE_SPA_COMPARE;
let FORMS;
let INPUTS;
let DIRECTIONS;
let url;
let maxStates;
let waitTime;
let queue;
let userAgent;
let events = [];
let directionEvents = [];
// let viewport = {};
let cookies = {};
let proxy = {};
let login = [];

async function validateOptions(options) {
    let values;
    if (fs.existsSync(options)) {
        values = await readFile(options);
    } else {
        values = await schema.validateSchema(options, loggerM);
    }

    if (values.url != null) {
        url = values.url;
    }

    if (values.headless != null) {
        headlessOption = values.headless;
    }
    if (values.browser != null) {
        browserType = values.browser;
    }

    if (values.executablePath != null) {
        executablePath = values.executablePath;
    }

    if (values.proxy != null) {
        proxy = values.proxy;
    }

    // if (values.viewport != null) {
    //     viewport.mobile = values.viewport.mobile != null ? values.viewport.mobile : false;
    //     viewport.landscape = values.viewport.landscape != null ? values.viewport.landscape : true;
    //     if (values.viewport.userAgent != null) {
    //         userAgent = values.viewport.userAgent;
    //     }
    //     viewport.width = values.viewport.resolution?.width != null ? values.viewport.resolution.width : 0;
    //     viewport.height = values.viewport.resolution?.height != null ? values.viewport.resolution.height : 0;
    // }

    if (values.log != null) {
        if (values.log.file != null) {
            loggerM.setFileLog(values.log.file);
        }
        if (values.log.console != null) {
            loggerM.setConsoleLog(values.log.console);
        }
    }

    if (values.waitTime != null) {
        waitTime = values.waitTime;
    }

    if (values.numberOfProcess != null) {
        numberOfProcess = values.numberOfProcess;
    }

    if (values.maxStates != null) {
        maxStates = values.maxStates;
    }

    if (values.cookies != null) {
        cookies = values.cookies;
    }

    if (values.login != null) {
        login = values.login;
    }

    if (values.ignore != null) {
        if (values.ignore.ids_compare != null) {
            IDS_IGNORE_SPA_COMPARE = new Set(values.ignore.ids_compare);
        }
        if (values.ignore.ids_events != null) {
            IDS_IGNORE_SPA_EVENTS = new Set(values.ignore.ids_events);
        }
    }

    if (values.interaction != null) {
        if (values.interaction.forms != null) {
            FORMS = new Set(values.interaction.forms);
        }
        if (values.interaction.inputs != null) {
            INPUTS = new Set(values.interaction.inputs);
        }
        if (values.interaction.directions != null) {
            DIRECTIONS = new Set(values.interaction.directions);
        }
    }
    return true;
}

async function readFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        throw new Error("Error: " + err);
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function run(puppeteerQW) {
    try {
        let browser;
        if (puppeteerQW == null) {
            // browser = await puppeteer.launch({ headless: true, args: ['--ignore-certificate-errors', '--no-sandbox'] });
            let options = {
                headless: headlessOption,
                defaultViewport: {
                    width: 1280,    // Set the viewport width
                    height: 720,
                },
                args: ['--no-sandbox', '--ignore-certificate-errors', '--disable-blink-features=AutomationControlled'],
            }
            if (executablePath) {
                options.executablePath = executablePath;
            }
            if (Object.values(proxy).length !== 0) {
                options.args.push(`--proxy-server=http://${proxy.host}:${proxy.port}`)
            }
            console.log(options)
            browser = await puppeteer.launch(options);
        } else {
            browser = puppeteerQW;
        }

        const context = browser.defaultBrowserContext();
        // context.clearPermissionOverrides();
        await context.overridePermissions(url, ['notifications']);

        var [page] = await browser.pages();
        if (userAgent != null) {
            await page.setUserAgent(userAgent);
        }
        // if (Object.keys(viewport).length > 0) {
        //     await page.setViewport(viewport);
        // }

        await page.goto(url, {waitUntil: 'networkidle2'});
        await delay(30000); // waits for 3 seconds
        //cookies & login
        // if (cookies != null) {
        //     await cookiesHandler(cookies, page);
        // }

        // if (login != null && login.length > 0) {
        //     await loginHandler(login, page);
        // }

        page.setRequestInterception(true);
        page.on('dialog', async dialog => {
            await dialog.dismiss();
        });
        page.on('popup', async popup => {
            await popup.close();
        });
        page.on('request', (request) => {
            if (request.isNavigationRequest() == true && request.resourceType() != "xhr") {
                request.abort();
            } else {
                request.continue();
            }
        });

        const session = await page.target().createCDPSession();
        if (DIRECTIONS != null && DIRECTIONS.length != 0) {
            await checkForDirections(browser);
        }

        await getEventAndInteraction(page, events);
        await utilsM.addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, "original", xpathM, loggerM);
        await populateQueue(browser);

        if (events.length == 0 && directionEvents.length == 0) {
            end(browser);
        } else {
            await queue.drain();
        }
    } catch (error) {
        console.error(error);
        process.exit();
    }
}

async function cookiesHandler(cookies, page) {
    if (cookies.waitBefore != null) {
        await new Promise(resolve => setTimeout(resolve, cookies.waitBefore));
    }
    if (cookies.btn != null) {
        await actionsM.performEvent(page, 'click', cookies.btn, 0)
    }
    if (cookies.waitAfter != null) {
        await new Promise(resolve => setTimeout(resolve, cookies.waitAfter));
    }
}

// async function loginHandler(login, page) {
//     for await (const value of login) {
//         if (value.info != null) {
//             if (value.info.wait != null) {
//                 await new Promise(resolve => setTimeout(resolve, value.info.wait));
//             }
//         }
//         if (value.credentials != null) {
//             let keys = Object.keys(value.credentials);
//             if (keys.length != 0) {
//                 for await (const key of keys) {
//                     await utilsM.pageInsertValue(page, key, value.credentials[key]);
//                 }
//             }
//         }
//         if (value.action != null) {
//             if (value.action.id != null && value.action.event != null) {
//                 await actionsM.performEvent(page, value.action.event, value.action.id, 2000);
//             }
//         }
//     }
// }

async function checkForDirections(browser) {
    let directionQueue = asyncQ.queue(directionsM.executeDirection, '1'); // METER O NUMERO DE PROCESSO AQUI
    DIRECTIONS.forEach(async direction => {
        let page = await buildPage(browser);
        if (userAgent != null) {
            await page.setUserAgent(userAgent);
        }
        // if (Object.keys(viewport).length > 0) {
        //     await page.setViewport(viewport);
        // }
        directionQueue.push({
            page: page,
            direction: direction,
            directionEvents: directionEvents,
            STATES_SPA_EVALUATION: STATES_SPA_EVALUATION,
            STATES_SPA_COMPARE: STATES_SPA_COMPARE,
            IDS_IGNORE_SPA_COMPARE: IDS_IGNORE_SPA_COMPARE,
            actionsM: actionsM,
            loggerM: loggerM,
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
    if (userAgent != null) {
        await page.setUserAgent(userAgent);
    }
    // if (Object.keys(viewport).length > 0) {
    //     await page.setViewport(viewport);
    // }
    await page.goto(url, {waitUntil: 'networkidle2'});

    page.setRequestInterception(true);
    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });
    page.on('popup', async popup => {
        await popup.close();
    });

    page.on('request', (request) => {
        if (request.isNavigationRequest() == true && request.resourceType() != "xhr") {
            page.close();
        } else {
            request.continue();
        }
    });

    return page;
}

async function populateQueue(browser) {
    if (events.length != 0 || directionEvents.length != 0) {
        queue = asyncQ.queue(explore, numberOfProcess);
        queue.drain(async () => {
            end(browser);
        });
        if (directionEvents.length != 0) {
            directionEvents.forEach(async direction => {
                queue.push({
                    browser: browser, actionbefore: direction
                });
            });
        }
        if (events.length != 0) {
            events.forEach(async event => {
                queue.push({
                    browser: browser, actionbefore: [event]
                });
            });
        }
    } else {
        end(browser);
    }
}

async function addQueue(events, browser, actionbefore) {
    events.forEach(async event => {
        let action = actionbefore.slice(0);
        action.push(event);
        queue.push({
            browser: browser, actionbefore: action
        });
    });
}

async function explore(data) {
    if (data.browser == null) {
        return;
    }
    let page = await buildPage(data.browser);
    const session = await page.target().createCDPSession();

    await actionsM.performAction(page, data.actionbefore, session, xpathM, loggerM, waitTime);
    if (!page.isClosed()) {
        await xpathM.createSelectorOnPage(session);
        const events = [];
        await getEventAndInteraction(page, events);

        if (await utilsM.addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, data.actionbefore, xpathM, loggerM)) {
            if (maxStates != null && STATES_SPA_COMPARE.size >= maxStates) {
                await queue.remove(explore);
                await data.browser.close();

                return;
            }

            await addQueue(events, data.browser, data.actionbefore)
        }
        page.close();
    }
}

async function end(browser) {
    if (browser != null) {
        await browser.close();
    }
    if (queue != null && await queue.length() > 0) {
        await queue.kill();
    }
}

async function crawl(qualstateOptions, puppeteer) {
    let start = Date.now();
    if (!(await validateOptions(qualstateOptions))) {
        return;
    }
    await run();
    let end = Date.now();
    loggerM.logDetails("info", {
        states: "STATES_SPA_EVALUATION Size: " + STATES_SPA_EVALUATION.size,
        duration: `Execution time: ${end - start} ms`
    });

    console.log("-                                                                     -");
    console.log("Process Completed.");
    console.log("-                                                                     -");
    console.log("States Found - " + STATES_SPA_EVALUATION.size);
    console.log("-                                                                     -");
    console.log("Execution Time: - " + (end - start) + "ms");

    return STATES_SPA_EVALUATION;
}

module.exports = {crawl};
