// #!/usr/bin/env node
'use strict';

const url = require('url');  // https://nodejs.org/api/url.html#url_url
const Client = require('node-rest-client').Client;

const helpers = require('./helpers');

const auroraIpAddress = "192.168.31.119";
const auroraPort = 16021;
var auroraApiKey = helpers.getFileContents("nanoleaf-mbta-secrets/api_key_nanoleaf.secret");

const auroraUrl_State = url.parse(`http://${auroraIpAddress}:${auroraPort}/api/v1/${auroraApiKey}/state`);

function auroraTurnOn() {
  auroraSetState(true);
}

function auroraTurnOff() {
  auroraSetState(false);
}

function auroraSetState(lightsOn) {
  var args = {
      headers: { "Content-Type": "application/json" },
      data: {
          on: {
              value: lightsOn
          }
      }
  };

  new Client().put(auroraUrl_State.href, args, function (data, response) {
      auroraSetStateCallback(data, response);
  });
}

function auroraSetStateCallback(data, response) {
  console.log("SetState complete.")
}

auroraTurnOff();