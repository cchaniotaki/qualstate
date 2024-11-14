const winston = require('winston')
require('dotenv').config();

// Access environment variables
let outputPath;
const browser = process.env.BROWSER;
console.log("LOGGER: " + browser);
if (browser === "chrome") {
    outputPath = process.env.OUTPUT_CHROME;
} else {
    outputPath = process.env.OUTPUT_EDGE;
}


let consoleLog = false;
let fileLog = true;


function setConsoleLog(value) {
    consoleLog = value;
}

function setFileLog(value) {
    fileLog = value;
}

const logInfoConfiguration = {
    transports: [
        new winston.transports.File({
            filename: `${outputPath}/logs.log`,
            options: {flags: 'w'},
            json: true
        })],
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'HH:mm:ss'
        }),
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}\n${JSON.stringify(info.details, undefined, 2)}`)
    )
};

const logStatesConfiguration = {
    transports: [
        new winston.transports.File({
            filename: `${outputPath}/states.log`,
            options: {flags: 'w'},
            json: true
        })],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.printf(info => `${JSON.stringify(info.details, undefined, 2)}`)
    )
};

let logInfo = winston.createLogger(logInfoConfiguration);
let logStates = winston.createLogger(logStatesConfiguration);

async function logDetails(type, detailsInfo, detailState) {
    if (consoleLog) {
        logConsole(type, detailsInfo);
    }
    if (fileLog) {
        logFile(type, detailsInfo, detailState);
    }
}

async function logFile(type, detailsInfo, detailState) {
    logInfo.log({
        level: type,
        details: detailsInfo
    });
    if (detailState != null) {
        logStates.log({
            level: type,
            details: detailState
        });
    }
}

async function logConsole(type, details) {
    switch (type) {
        case 'info':
            console.info(type + ": " + new Date().toLocaleTimeString() + "\n" + `${JSON.stringify(details, undefined, 2)}`);
            break;
        case 'error':
            console.error(type + ": " + new Date().toLocaleTimeString() + "\n" + `${JSON.stringify(details, undefined, 2)}`);
            break;
        default:
            return;
    }
}

module.exports = {logDetails, setConsoleLog, setFileLog};