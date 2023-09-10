const detect = require('detect-port');

// SPA
const express = require("express");
const appSPA = express();
let portSPA = 3000;
let serverSPA;

// rest API
const appAPI = express();
const cors = require('cors');
let portAPI = 3001;
let serverAPI;


function runServerSPA() {
  detect(portSPA)
    .then(_port => {
      if (portSPA == _port) {
        appSPA.use(express.static(__dirname));
        serverSPA = appSPA.listen(portSPA);
        appSPA.get("/", (req, res) => {
          res.sendFile(__dirname + "/page/index.html");
        });
      }
    })
    .catch(err => {
      throw new Error("Error creating server to test: " + err);
    });
}

function stopServerSPA() {
  serverSPA.close();
}

function runServerAPI() {
  detect(portAPI)
    .then(_port => {
      if (portAPI == _port) {
        appAPI.use(cors());
        serverAPI = appAPI.listen(portAPI);
        appAPI.get("/url", (req, res, next) => {
          res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
        });
      }
    })
    .catch(err => {
      throw new Error("Error creating server to test: " + err);
    });
}

function stopServerAPI() {
  serverAPI.close();
}

module.exports = { runServerSPA, stopServerSPA, runServerAPI, stopServerAPI };
