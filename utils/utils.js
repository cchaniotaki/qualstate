const crypto = require("crypto-js");

async function pageEvaluateId(page, id) {
  return await page.evaluate((id) => {
    if (document.getElementById(id) != null) {
      return true;
    }
    if (document.querySelector(id) != null) {
      return true;
    }
    return false;
  }, id);
}

async function isSelector(page, id) {
  return await page.evaluate((id) => {
    return document.getElementById(id) == null ? true : false;
  }, id);
}

async function pageQuerySelector(page, selector) {
  return await page.evaluate((selector) => {
    return document.querySelector(selector) == null ? false : true;
  }, selector);
}

async function pageNodeName(page, id) {
  return await page.evaluate((id) => {
    let nodeName = document.getElementById(id) == null ? document.querySelector(id).nodeName : document.getElementById(id).nodeName;
    if (nodeName == "INPUT") {
      return document.getElementById(id) == null ? document.querySelector(id).type : document.getElementById(id).type;
    }
    return nodeName;
  }, id);
}

async function pageInsertValue(page, id, value) { 
  await page.evaluate((id, value) => {
    let node = document.getElementById(id);
    if (node == null) {
      node = document.querySelector(id);
    }
    node.value = value;
    node.dispatchEvent(new Event('input', { 'bubbles': true }));
  }, id, value);
}

async function pageInsertCheckbox(page, id, value) {
  await page.evaluate((id, value) => {
    let node = document.getElementById(id);
    if (value == "indeterminate") {
      if (node == null) {
        document.querySelector(id).indeterminate = true;
      } else {
        document.getElementById(id).indeterminate = true;
      }
    } else {
      if (node == null) {
        document.querySelector(`${id}`).checked = (value === 'true');
      } else {
        document.getElementById(`${id}`).checked = (value === 'true');
      }
    }
  }, id, value);
}

async function getContent(page) {
  return await page.content();
}

function bodyToHash(page) {
  return crypto.SHA256(page).toString();
}

async function addState(session, page, STATES_SPA_COMPARE, IDS_IGNORE_SPA_COMPARE, STATES_SPA_EVALUATION, selector, xpathM, loggerM) {
  await xpathM.removeSelectorOnPage(session);
  let bodyEvaluation = await getContent(page);
  let bodyEvaluationHash = bodyToHash(bodyEvaluation);

  if(IDS_IGNORE_SPA_COMPARE != null && IDS_IGNORE_SPA_COMPARE.length != 0 ){
    await xpathM.createSelectorOnPage(session);
    await removeNodes(IDS_IGNORE_SPA_COMPARE, session, page);
    await xpathM.removeSelectorOnPage(session);
  }

  let bodyCompare = await getContent(page);
  let bodyCompareHash = bodyToHash(bodyCompare);


  if (STATES_SPA_COMPARE.has(bodyCompareHash)) {
    return false;
  } else {
    STATES_SPA_EVALUATION.add({ _body: bodyEvaluation, _selector: selector });
    STATES_SPA_COMPARE.add(bodyCompareHash);

    loggerM.logDetails("info", {
      msg: "Ação realizada",
      action: selector,
      bodyHash: bodyEvaluationHash
    }, {
      bodyHash: bodyEvaluationHash,
      body: bodyEvaluation
    });
    
    return true;
  }
}

async function removeNodes(idsToIgnore, session, page, selector = '*') {
  const objectGroup = 'dc24d2b3-f5ec-4273-a5c8-1459b5c78ca0';
  const { result: { objectId } } = await session.send('Runtime.evaluate', {
    expression: `document.querySelectorAll("${selector}")`,
    objectGroup
  });
  const { result } = await session.send('Runtime.getProperties', { objectId });
  const descriptors = result
    .filter(x => x.value !== undefined)
    .filter(x => x.value.objectId !== undefined)
    .filter(x => x.value.className !== 'Function');

  for (const descriptor of descriptors) {
    const objectId = descriptor.value.objectId;
    Object.assign(descriptor, await session.send('DOM.describeNode', { objectId }));

    if (idsToIgnore != null && idsToIgnore.length != 0) {
      if (idsToIgnore.has(descriptor.value.description.split("#").pop()) || checkElements(idsToIgnore, descriptor.node.attributes)) {
        removeNode(page, descriptor.value.description.split("#").pop(), descriptor.node.attributes[descriptor.node.attributes.indexOf('_selector') + 1]);
      }
    }
  }

  await session.send('Runtime.releaseObjectGroup', { objectGroup });
}

function checkElements(idsIgnore, attributes) {
  if (attributes != null) {
    for (const id of idsIgnore) {
      for(const attribute of attributes){
        let result = attribute.match(id);
        if ((result != null && result.length > 0)) {
          return true;
        }
      }
    }
  }
  return false;
}

async function removeNode(page, id, selector) {
  if (!removeNodeId(page, id)) {
    removeNodeQuerySelector(page, selector);
  }
}

async function removeNodeQuerySelector(page, selector) {
  return await page.evaluate((selector) => {
    if (document.querySelector(selector) != null) {
      document.querySelector(selector).remove();
      return true;
    }
    return false;
  }, selector);
}

async function removeNodeId(page, id) {
  return await page.evaluate((id) => {
    if (document.getElementById(id) != null) {
      document.getElementById(id).remove();
      return true;
    }
    return false;
  }, id);
}

module.exports = {
  pageEvaluateId, pageNodeName, pageInsertValue, getContent, addState, pageInsertCheckbox, pageQuerySelector, checkElements, isSelector
};