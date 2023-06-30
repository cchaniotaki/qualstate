const winston = require('winston')

const logConfiguration = {
  transports: [
    new winston.transports.File({
      filename: 'output/logs.log',
      options: { flags: 'w' },
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
let logger = winston.createLogger(logConfiguration);

async function logDetails(type, details) {
  logFile(type, details);
  // logConsole(type, details);
}

async function logFile(type, details) {
  logger.log({
    level: type,
    details: details
  });
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

module.exports = { logDetails };