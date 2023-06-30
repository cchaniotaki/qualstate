const utilsM = require("../utils/utils.js");
const logger = require("../logger/logger.js");

async function performeAction(page, event, selector) {
    let valid = true;
    switch (event) {
        case 'click':
            await Promise.allSettled([
                page.waitForNetworkIdle(),
                page.click(selector)
            ]).then((results) => {
                results.forEach((result) => {
                    if (result.status == "rejected") {
                        valid = false;
                    }
                });
            });
            return valid;
        default:
            valid = false;
            return valid;
    }
}

async function performBeforeAction(page, actions, session, xpath) {
    for await (const action of actions) {
        await xpath.createSelectorOnPage(session);
        if (action.user == "auto") {
            //  click
            // await Promise.allSettled([
            //     page.waitForNetworkIdle(),
            //     page.click(action.selector)
            // ]);
            if (!await performeAction(page, action.eventType, action.selector)) {
                logger.logDetails("error", { 
                    msg: "Não foi possivel realizar a ação manual",
                    action: action,
                    actions: actions
                 });
                 break;
            };
        } else if (action.user == "manual") {
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
                    }
                    if (action.wait != null) {
                        await new Promise(resolve => setTimeout(resolve, action.wait));
                    }
                }
            }
            if (action.endAction != null) {
                await xpath.createSelectorOnPage(session);
                if (action.wait != null) {
                    await new Promise(resolve => setTimeout(resolve, action.wait));
                }
                if (await utilsM.pageEvaluateId(page, action.endAction["id"])) {
                    if (!await performeAction(page, action.endAction["eventType"], "#" + action.endAction["id"])) {
                        logger.logDetails("error", { 
                            msg: "Não foi possivel realizar a ação manual",
                            action: action,
                            actions: actions
                         });
                         break;
                    };
                }
            }

        }
    }

    logger.logDetails("info", { 
        msg: "Ação realizada",
        actions: actions
     });
}

module.exports = { performBeforeAction };