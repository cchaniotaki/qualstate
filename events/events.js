const utilsM = require("../utils/utils.js");

async function getEvents(session, idsToIgnore, events, selector = '*') {
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

    const elements = [];
    for (const descriptor of descriptors) {
        const objectId = descriptor.value.objectId;

        Object.assign(descriptor, await session.send('DOMDebugger.getEventListeners', { objectId }));
        Object.assign(descriptor, await session.send('DOM.describeNode', { objectId }));

        if (descriptor.listeners.length != 0 || checkOtherTags(descriptor)) {
            if (idsToIgnore != null && idsToIgnore.length != 0) {
                if (!idsToIgnore.has(descriptor.value.description.split("#").pop()) && !utilsM.checkElements(idsToIgnore, descriptor.node.attributes)) {
                    elements.push(descriptor);
                }
            } else {
                elements.push(descriptor);
            }
        }
    }

    await session.send('Runtime.releaseObjectGroup', { objectGroup });
    await filterEvents(elements, events, idsToIgnore);
}

function checkOtherTags(element) {
    switch (element.node.nodeName) {
        case 'A':
            return true;
        case 'INPUT':
            for (let i = 0; i < element.node.attributes.length; i++) {
                if (element.node.attributes[i] == "type") {
                    if (element.node.attributes[i + 1] == "submit") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        default:
            return false;
    }
}

async function filterEvents(elements, events) {
    elements.forEach(el => {
        let selector;
        el.node.attributes.forEach((nd, i) => {
            if (nd == "_selector") {
                selector = el.node.attributes[i + 1];
            }
        });
        if (!checkOtherTags(el)) {
            el.listeners.forEach(e => {
                if (e.type == "click") {
                    events.push({
                        user: "auto",
                        id: el.value.description,
                        className: el.value.className,
                        eventType: e.type,
                        selector: selector
                    });
                }
                if (e.type == "mouseenter") {
                    events.push({
                        user: "auto",
                        id: el.value.description,
                        className: el.value.className,
                        eventType: "houver",
                        selector: selector
                    });
                }
            });
        } else {
            switch (el.node.nodeName) {
                case 'A':
                    events.push({
                        user: "auto",
                        id: el.value.description,
                        className: el.value.className,
                        eventType: "click",
                        selector: selector
                    });
                    break;
                case 'INPUT':
                    el.node.attributes.forEach((nd, i) => {
                        if (nd == "type") {
                            if (el.node.attributes[i + 1] == "submit") {
                                events.push({
                                    user: "auto",
                                    id: el.value.description,
                                    className: el.value.className,
                                    eventType: "click",
                                    selector: selector
                                });
                            };
                        }
                    });
                default:
                    break;
            }
        }
    });
}

module.exports = { getEvents };