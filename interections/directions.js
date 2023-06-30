const utilsM = require("../utils/utils.js");

async function executeDirection(data) {
  let beforeAction = [];
  const session = await data.page.target().createCDPSession();
  for await (const action of data.direction.actions) {
    let actionToExecute = {
      user: "manual"
    };
    if (action.info != null) {
      if (action.info.wait != null) {
        actionToExecute.wait = action.info.wait;
      }
    }
    
    if (action.values != null) {
      actionToExecute.beforeAction = action.values
    }
    if (action.action != null) {
      actionToExecute.endAction = action.action
    }
    
    if (data.direction.info.save == true) {
      await data.utilsM.addState(session, data.page, data.STATES_SPA_COMPARE, data.IDS_IGNORE_SPA_COMPARE, data.STATES_SPA_EVALUATION, "direction-path", data.xpathM);
    }

    await data.actionsM.performBeforeAction(data.page, [actionToExecute], session, data.xpathM);
    beforeAction.push(actionToExecute);
  }
  await data.utilsM.addState(session, data.page, data.STATES_SPA_COMPARE, data.IDS_IGNORE_SPA_COMPARE, data.STATES_SPA_EVALUATION, "direction-end", data.xpathM);
  if (data.direction.info.crawl != "continue") {
    data.page.close();
    return;
  }

  let events = [];
  await data.getEventAndInteraction(data.page, events);
  data.page.close();
  events.forEach(event => {
    let action = beforeAction.slice(0);
    action.push(event);
    data.directionEvents.push(action);
  });
}

module.exports = { executeDirection };