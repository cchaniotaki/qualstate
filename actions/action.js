const utilsM = require("../utils/utils.js");

async function performEvent(page, event, selector, waitTime) {
    let valid = true;
    switch (event) {
        case 'click':
            await Promise.allSettled([
                page.waitForNetworkIdle(),
                page.click(selector),
                new Promise(resolve => setTimeout(resolve, waitTime))
            ]).then((results) => {
                results.forEach((result) => {
                    if (result.status == "rejected") {
                        valid = false;
                    }
                });
            });
            return valid;
        case 'houver':
            const element = await page.$(selector);
            if (element != null) {
                await element.hover();
                return valid;
            }
            valid = false;
            return valid;
        default:
            valid = false;
            return valid;
    }
}

async function performAction(page, actions, session, xpath, logger, waitTime) {
    for await (const action of actions) {
        await xpath.createSelectorOnPage(session);
        if (action.user == "auto") {
            if (!await performEvent(page, action.eventType, action.selector, waitTime)) {
                logger.logDetails("error", {
                    msg: "Unable to perform auto action",
                    action: action,
                    actions: actions
                });
                break;
            };
        }
        else if (action.user == "manual") {
            if (action.wait != null) {
                await new Promise(resolve => setTimeout(resolve, action.wait));
            }
            if (action.beforeAction != null) {
                let arrKeyBeforeActions = Object.keys(action.beforeAction);
                for await (const idElement of arrKeyBeforeActions) {
                    await xpath.createSelectorOnPage(session);
                    if (await utilsM.pageEvaluateId(page, idElement)) {
                        switch (await utilsM.pageNodeName(page, idElement)) {
                            case 'text' || 'date' || 'datetime-local' || 'email' || 'month' || 'number' || 'password' || 'range' || 'tel' || 'time' || 'url' || 'week':
                                await utilsM.pageInsertValue(page, idElement, action.beforeAction[idElement]);
                                break;
                            case 'checkbox' || 'radio':
                                await utilsM.pageInsertCheckbox(page, idElement, action.beforeAction[idElement]);
                                break;
                            default:
                                break;
                        }
                        if (action.wait != null) {
                            await new Promise(resolve => setTimeout(resolve, action.wait));
                        }
                    }
                }
            }
            if (action.endAction != null) {
                await xpath.createSelectorOnPage(session);
                if (await utilsM.pageEvaluateId(page, action.endAction["id"])) {
                    let isSelector = await utilsM.isSelector(page, action.endAction["id"])
                    let selector = isSelector ? action.endAction["id"] : "#" + action.endAction["id"];
                    if (!await performEvent(page, action.endAction["eventType"], selector)) {
                        logger.logDetails("error", {
                            msg: "Unable to perform manual action",
                            action: action,
                            actions: actions
                        });
                        break;
                    };
                    if (action.wait != null) {
                        await new Promise(resolve => setTimeout(resolve, action.wait));
                    }
                }
            }
        }
    }
}

module.exports = { performAction, performEvent };