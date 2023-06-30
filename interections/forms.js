const utilsM = require("../utils/utils.js");

async function getForms(page, FORMS, events) {
    for await (const form of FORMS) {
        if (await utilsM.pageEvaluateId(page, form.info.formId)) {
            filterForms(form, events);
        }
    };
    return events;
}

function filterForms(data, events) {
    if (data.input != null && data.action != null) {
        data.input.forEach(input => {
            let form = {
                user: "manual",
                beforeAction: input,
                endAction: {
                    id: data.action.id,
                    eventType: data.action.event
                }
            };
            if (data.info.wait) {
                form.wait = data.info.wait;
            }
            events.push(form);
        });
    }

    if (data.input == null && data.action != null) {
        let form = {
            user: "manual",
            endAction: {
                id: data.action.id,
                eventType: data.action.event
            }
        };
        if (data.info.wait) {
            form.wait = data.info.wait;
        }
        events.push(form);
    }

    if (data.input != null && data.action == null) {
        data.input.forEach(input => {
            let form = {
                user: "manual",
                beforeAction: input
            };
            if (data.info.wait) {
                form.wait = data.info.wait;
            }
            events.push(form);
        });
    }
    return events;
}

module.exports = { getForms };