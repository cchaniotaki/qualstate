async function getInputs(page, INPUTS, events, utilsM) {
    for await (const input of INPUTS) {
        if (input.value) {
            let ids = Object.keys(input.value);
            let exist = true;
            for (let i = 0; i < ids.length; i++) {
                if (!await utilsM.pageEvaluateId(page, ids[i])) {
                    exist = false;
                    return;
                }
            }
            if (exist) {
                if (input.info) {
                    if (input.info.wait != null) {
                        filterInputs(input, events);
                    }
                }
            }
        }
    };
    return events;
}

function filterInputs(input, events) {
    let inputObj = {
        user: "manual",
        beforeAction: input.value
    };
    if (input.info) {
        if (input.info.wait) {
            inputObj.wait = input.info.wait;
        }
    }
    events.push(input);

    return events;
}

module.exports = { getInputs };