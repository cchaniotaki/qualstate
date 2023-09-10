async function getInputs(page, INPUTS, events, utilsM) {
    for await (const input of INPUTS) {
        if (input.value) {
            let ids = Object.keys(input.value);
            let exist = true;
            for await (const id of ids) {
                if (!await utilsM.pageEvaluateId(page, id)) {
                    exist = false;
                    return;
                }
            }
            if (exist) {
                filterInputs(input, events);
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
    events.push(inputObj);

    return events;
}

module.exports = { getInputs };