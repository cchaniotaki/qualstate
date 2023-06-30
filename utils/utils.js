const crypto = require("crypto-js");

async function pageEvaluateId(page, id) {
  return await page.evaluate((id) => {
    return document.getElementById(id) == null ? false : true;
  }, id);
}

async function pageNodeName(page, id) {
  return await page.evaluate((id) => {
    let nodeName = document.getElementById(id).nodeName
    if (nodeName == "INPUT") {
      return document.getElementById(id).type;
    }
    return nodeName;
  }, id);
}

async function pageInsertValue(page, id, value) {
  await page.evaluate((id, value) => {
    document.getElementById(id).value = value
  }, id, value);
}

async function pageInsertCheckbox(page, id, value) {
  await page.evaluate((id, value) => {
    if (value == "indeterminate ") {
      document.getElementById(id).indeterminate = true;
    } else {
      document.getElementById(`${id}`).checked = (value === 'true'); // rever 
    }
  }, id, value);
}

async function getContent(page) {
  return await page.content();
}

function checkState(body, STATES_SPA) {
  for (const entry of STATES_SPA) {
    if (entry._body == body) {
      return true;
    }
  }
  return false;
}

async function addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, selector, xpathM) {
  await xpathM.removeSelectorOnPage(session);
  let bodyEvaluation = await getContent(page);
  await removeIdsCompare(page, IDS_IGNORE_SPA_COMPARE);

  // let bodyCompare = await getContent(page);
  // for await (const entry of STATES_SPA_COMPARE) {
  //   if (entry == bodyCompare) {
  //     return false;
  //   }
  // }

  let bodyCompare = crypto.SHA256(await getContent(page)).toString();
  if (STATES_SPA_COMPARE.has(bodyCompare)) {
    return false;
  }

  STATES_SPA_COMPARE.add(bodyCompare);
  STATES_SPA_EVALUATION.add({ _body: bodyEvaluation, _selector: selector });
  return true;
}

async function removeIdsCompare(page, IDS_IGNORE_SPA_COMPARE) {
  if (IDS_IGNORE_SPA_COMPARE != null && IDS_IGNORE_SPA_COMPARE.length != 0) {
    for (const id of IDS_IGNORE_SPA_COMPARE) {
      if (await pageEvaluateId(page, id)) {
        await removeNode(page, id);
      }
    }
  }
}

async function removeNode(page, id) {
  await page.evaluate((id) => {
    document.getElementById(id).remove();
  }, id);
}

module.exports = { pageEvaluateId, pageNodeName, pageInsertValue, getContent, checkState, addState, removeIdsCompare, pageInsertCheckbox };