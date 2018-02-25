// #!/usr/bin/env node
'use strict';

// library imports
// 3rd party
const sleep = require('sleep');
const url = require('url');  // https://nodejs.org/api/url.html#url_url
const Client = require('node-rest-client').Client;
var nodeCleanup = require('node-cleanup');

// local
const helpers = require('./helpers');

// models
var AuroraPanel = require("./models/AuroraPanel")

// mbta
var mbtaApiKey = helpers.getFileContents("nanoleaf-mbta-secrets/api_key_mbta.secret");
const mbtaRouteId = "Green-E";
const mbtaStopName = "Back of the Hill - Outbound"

const mbtaUrl_PredictionsByRoute = url.parse(`http://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=${mbtaApiKey}&route=${mbtaRouteId}&format=json`);

// nanoleaf aurora
const auroraIpAddress = "192.168.31.134";
const auroraPort = 16021;
var auroraApiKey = helpers.getFileContents("nanoleaf-mbta-secrets/api_key_nanoleaf.secret");

const auroraUrl_Effects = url.parse(`http://${auroraIpAddress}:${auroraPort}/api/v1/${auroraApiKey}/effects`);

// assigned the panels by their id relative to their position in physical space
var panels = [
    { position: 1, panel: new AuroraPanel(171) },
    { position: 2, panel: new AuroraPanel(226) },
    { position: 3, panel: new AuroraPanel(158) },
    { position: 4, panel: new AuroraPanel(122) },
    { position: 5, panel: new AuroraPanel(36) },

    { position: 6, panel: new AuroraPanel(141) },
    { position: 7, panel: new AuroraPanel(176) },
    { position: 8, panel: new AuroraPanel(151) },
    { position: 9, panel: new AuroraPanel(47) },
    { position: 10, panel: new AuroraPanel(162) },

    { position: 11, panel: new AuroraPanel(144) },
    { position: 12, panel: new AuroraPanel(50) }
];

// nanoleaf functions
function auroraSetEffects() {
    var animDataValue = `${panels.length} `;

    panels.forEach(panel => {
        animDataValue += panel.panel.formatForRequest();
    });

    var args = {
        headers: { "Content-Type": "application/json" },
        data: {
            write: {
                command: "display",
                animType: "static",
                animData: animDataValue
            }
        }
    };

    new Client().put(auroraUrl_Effects.href, args, function (data, response) {
        auroraSetEffectsCallback(data, response);
    });
}

function auroraSetEffectsCallback(data, response) {
}

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

// mbta functions
function getPredictionsByRoute() {
    console.log("Checking route predictions...");

    new Client().get(mbtaUrl_PredictionsByRoute.href, function (data, response) {
        predictionsByRouteRetrieved(data, response);
    });
}

function predictionsByRouteRetrieved(data, response) {
    var arrivalTimes = [];

    if (data.error) {
        console.log(data.error);
        return;
    }

    var trips = data.direction[0].trip;

    trips.forEach(trip => {
        var stops = trip.stop;

        if (stops.length > 1) {
            stops.forEach(stop => {
                if (stop.stop_name == mbtaStopName) {
                    arrivalTimes.push(stop.pre_away);
                }
            });
        }
    });

    arrivalTimesRetrieved(arrivalTimes);
}

function arrivalTimesRetrieved(arrivalTimes) {
    console.log("Predictions retrieved...");

    var panelsToPaint = [];

    arrivalTimes.forEach(arrivalTime => {
        // since each panel represents one minute from the analyzed stop, we want to 
        // know how may minutes (panels) away each arrival time is
        var panelToPaint = Math.floor(arrivalTime / 60);
        panelsToPaint.push(panelToPaint);
        console.log(`Arriving in ${arrivalTime} seconds/${Math.floor(arrivalTime / 60)} minutes and ${arrivalTime % 60} seconds; panel to paint: ${panelToPaint}.`);
    });

    panels.forEach(panel => {
        if (panelsToPaint.indexOf(panel.position) > -1) {
            panel.panel.r = 0;
            panel.panel.g = 255;
            panel.panel.b = 0;
        }
        else {
            panel.panel.r = 255;
            panel.panel.g = 255;
            panel.panel.b = 255;
        }
    })

    auroraSetEffects();
}

// main
auroraSetEffects();
sleep.sleep(1);
getPredictionsByRoute();

// main loop
function intervalFunc() {
    getPredictionsByRoute();
}

setInterval(intervalFunc, 30000);