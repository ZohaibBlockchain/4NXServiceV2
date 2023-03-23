//Beta version 1.1 of W3API...

import express from "express";
const bodyParser = require("body-parser");
import { ExeTrade ,test} from "./db/db";
const mongoose = require("mongoose");
import { router } from "./routes/routes";
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
require("dotenv").config();
let counter = 0;
let Approvedclients = [];

//------
test();


//-------




Errorlogger('Init');
function WSSserver() {
  try {
    const server = https.createServer({
      cert: fs.readFileSync(__dirname + '/certificates/cert.pem'),
      key: fs.readFileSync(__dirname + '/certificates/key.pem')
    });
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws) => {
      console.log('Client connected');
      InitClient(ws);
    });
    server.listen(process.env.WSPORT, () => {
      console.log('Server started on port 9999');
    });
  } catch (error) {
    Errorlogger(error.message);
  }
}


const ip = require("ip");
const ipAddress = ip.address();

mongoose
  .connect(process.env.DBKEY, { useNewUrlParser: true })
  .then(() => {
    //-----------Express----------
    const envport = process.env.SERVERPORT;
    var app = express();

    app.use(router);
    app
      .listen(envport, function () {
        console.log(`The SERVER HAS STARTED ON PORT: ${envport}`);
        console.log(ipAddress);
        w3Engine();
      })
      .on("error", function (err) {
        console.log(err);
        process.once("SIGUSR2", function () {
          process.kill(process.pid, "SIGUSR2");
        });
        process.on("SIGINT", function () {
          // this is only called on ctrl+c, not restart
          process.kill(process.pid, "SIGINT");
        });
      });

    //-----------Express----------
  });

process.on('uncaughtException', function (err) {
  Errorlogger(err.message);
  console.log("...");
});

process.on('TypeError', function (err) {
  Errorlogger(err.message);
  console.log("...");

});


//-----------fuctions--------
const updateSpeed = 10000;
async function w3Engine() {
  let c = await ExeTrade();
  console.log(c);
  setTimeout(() => { w3Engine(); }, updateSpeed);
}
//---------fuctions--------
//---------ExecutionBlock------
//---------ExecutionBlock------
//




function msgHandler(msg, ws) {

  if (checkClient(ws)) {
    switch (msg.MessageType) {
      case 'AUTH': {
        console.log('I got the report');
        break;
      }
      case 'ExecutionReport': {
        console.log('I got the report');
        break;
      }
      case 'TokenInf': {
        console.log('Needs to send token Information');
        break;
      }
      case 'Order': {
        console.log('I got the order');
        break;
      }
      default:
        ws.send('Invalid Request!');
        break;
    }
  } else {
    switch (msg.MessageType) {
      case 'AUTH': {
        if (msg.MESSAGE == process.env.CTID) {
          Approvedclients.push(ws);
          return;
        } else {
          console.log('!Client Fired.');
          ws.send('Invalid Token ID!');
          ws.close();
        }
        break;
      }
      default:
        console.log('!Client Fired.');
        ws.send('unauthorized connection detected.!');
        ws.close();
        break;
    }
  }
}



function InitClient(ws) {
  ws.send('welcome! to the 4NX server v1.16.0.');
  ws.send('Please provide connection token in CTID field in order to use the service.');
  ws.on('message', (message) => {

    if (isJSON(message)) {
      let msg = JSON.parse(message);
      msgHandler(msg, ws);
    } else {
      ws.send('Please use Valid Format for interaction.');
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    removeClient(ws); //Remove from array...
  });
}



function checkClient(ws) {
  Approvedclients.forEach(id => {
    if (id == ws.id) {
      return true;
    }

  });
  return false;
}

function removeClient(ws) {
  for (let i = 0; i < Approvedclients.length; i++) {
    if (Approvedclients[i].id == ws.id) {
      Approvedclients.splice(i, 1);
    }
  }
}



function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function Errorlogger(error) {
  if (counter == 0) {
    fs.writeFile(__dirname + '/logs/logs.txt', 'Application Error Logs \n\n\n', function (err) {
      if (err) throw err;
      console.log('Logs cleaned.');
    });
  } else {
    fs.appendFile((__dirname + '/logs/logs.txt'), `${counter}: ` + error + '\n', function (err) {
      if (err) console.log('Unable to write error on file and the error is : ', err.message);
      console.log('Data appended to file.');
    });
  }
  counter++;
  console.log(error);
}