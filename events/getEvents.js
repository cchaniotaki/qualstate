const puppeteer = require('puppeteer');
module.exports = { describe };

async function describe(session, idsToIgnore, selector = '*') {
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
            if (!idsToIgnore.has(descriptor.value.description.split("#").pop())) { // pode ser melhor utilizar o id do array de atributos
                elements.push(descriptor);
            }
        }
    }

    await session.send('Runtime.releaseObjectGroup', { objectGroup });
    return filterEvents(elements);
}

function checkOtherTags(element) {
    switch (element.node.nodeName) {
        case 'A':
            return true;
        case 'INPUT':
            return element.node.attributes.forEach((nd, i) => {
                if (nd == "type") {
                    if (element.node.attributes[i + 1] == "submit") {
                        return true;
                    };
                }
            });
        default:
            return false;
    }
}

async function filterEvents(elements) {
    let events = [];
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
                        id: el.value.description,
                        className: el.value.className,
                        eventType: e.type,
                        selector: selector
                    });
                }
            });
        } else {
            switch (el.node.nodeName) {
                case 'A':
                    events.push({
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
                                    id: el.value.description,
                                    className: el.value.className,
                                    eventType: "click",
                                    selector: selector
                                });
                            };
                        }
                    });
            }
        }
    });
    return events;
}

// function filterEvent(element, elements) {
//     let event = {};
//     event.id = element.value.description;
//     event.className = element.value.className;
//     element.node.attributes.forEach((nd, i) => {
//         if (nd == "_selector") {   // TODO - se não existir _selector
//             event.selector = element.node.attributes[i + 1];
//         }
//     });
//     if (!checkOtherTags(element, event)) { //passar elemets
//         // for (let i = 0; i < element.listeners.length; i++) {
//         //     event.eventType = element.listeners[i].type;
//         //     console.log(element.listeners[i].type);
//         //     console.log(event.eventType);
//         //     elements.push(event);
//         // }
//         element.listeners.forEach(e => {
//             elements.push(eventL);
//             console.log(elements);
//             // let eventL = event;
//             // eventL.type = e.type;
//             // console.log(eventL);
//             // elements.push(eventL);
//             // console.log(elements);
//         });
//     }
// }
