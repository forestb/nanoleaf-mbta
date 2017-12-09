#!/usr/bin/env node
'use strict';

var sleep = require('sleep');
var fs = require('file-system');
const url = require('url');  // https://nodejs.org/api/url.html#url_url

var Client = require('node-rest-client').Client;

// globals
// configure fiddler proxy 
var options_proxy = {
    proxy: {
        host: "127.0.0.1",
        port: 8888,
        tunnel: false
    }
};

function getFileContents(filename){
    return fs.readFileSync(`./nanoleaf-mbta-secrets/${filename}`, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });
}

var auroraPanels = [
    {position: 1, auroraPanel: new AuroraPanel(171)},
    {position: 2, auroraPanel: new AuroraPanel(226)},
    {position: 3, auroraPanel: new AuroraPanel(158)},
    {position: 4, auroraPanel: new AuroraPanel(122)},
    {position: 5, auroraPanel: new AuroraPanel(36)},

    {position: 6, auroraPanel: new AuroraPanel(141)},
    {position: 7, auroraPanel: new AuroraPanel(176)},
    {position: 8, auroraPanel: new AuroraPanel(151)},
    {position: 9, auroraPanel: new AuroraPanel(47)},
    {position: 10, auroraPanel: new AuroraPanel(162)},

    {position: 11, auroraPanel: new AuroraPanel(144)},
    {position: 12, auroraPanel: new AuroraPanel(50)}
];

// classes
function AuroraPanel(id) {
    this.id = id;
    this.frameCount = 1;
    this.r = 255;
    this.g = 255;
    this.b = 255;
    this.w = 0;
    this.t = 0;
};

AuroraPanel.prototype.formatForRequest = function() {
    return `${this.id} ${this.frameCount} ${this.r} ${this.g} ${this.b} ${this.w} ${this.t} `;
};

// nanoleaf aurora
var auroraApiKey = getFileContents("api_key_nanoleaf.secret");
var auroraIpAddress = "192.168.31.118";
var auroraPort = 16021;
const auroraUrl_Effects = url.parse(`http://${auroraIpAddress}:${auroraPort}/api/v1/${auroraApiKey}/effects`);

// nanoleaf functions
function auroraSetEffects(){
    var animDataValue = `${auroraPanels.length} `;

    auroraPanels.forEach(panel => {
        animDataValue += panel.auroraPanel.formatForRequest();
    });
    
    var args = {
        headers: { "Content-Type": "application/json" },
        data: { 
            write: { 
                command : "display", 
                animType : "static", 
                animData : animDataValue } }
    };

    new Client(options_proxy).put(auroraUrl_Effects.href, args, function (data, response) {
        auroraSetEffectsCallback(data, response);
    });
}

function auroraSetEffectsCallback(data, response){
}

// mbta
var mbtaApiKey = getFileContents("api_key_mbta.secret");
var mbtaRouteId = "Green-E";
const mbtaUrl_PredictionsByRoute = url.parse(`http://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=${mbtaApiKey}&route=${mbtaRouteId}&format=json`);

// mbta functions
function getPredictionsByRoute(){
    console.log("Checking route predictions...");
    new Client(options_proxy).get(mbtaUrl_PredictionsByRoute.href,  function (data, response) {
        predictionsByRouteRetrieved(data, response);
    });
}

function predictionsByRouteRetrieved(data, response){
    var arrivalTimes = [];

    var trips = data.direction[0].trip;
    
    trips.forEach(trip => {
        var stops = trip.stop;

        if(stops.length > 1){
            stops.forEach(stop =>{
                if(stop.stop_name == "Back of the Hill - Outbound"){
                    arrivalTimes.push(stop.pre_away);
                }
            });
        }
    });

    arrivalTimesRetrieved(arrivalTimes);
}

function arrivalTimesRetrieved(arrivalTimes){
    console.log("Predictions retrieved...");

    var panelsToPaint = [];

    arrivalTimes.forEach(arrivalTime =>{
        // since each panel represents one minute from the analyzed stop, we want to 
        // know how may minutes (panels) away each arrival time is
        var panelToPaint = Math.floor(arrivalTime / 60);
        panelsToPaint.push(panelToPaint);
        console.log(`Arriving in ${arrivalTime} seconds/${Math.floor(arrivalTime/60)} minutes and ${arrivalTime % 60} seconds; panel to paint: ${panelToPaint}.`);
    });

    auroraPanels.forEach(panel => {
        if(panelsToPaint.indexOf(panel.position) > -1){
            panel.auroraPanel.r = 0;
            panel.auroraPanel.g = 255;
            panel.auroraPanel.b = 0;
        }
        else{
            panel.auroraPanel.r = 255;
            panel.auroraPanel.g = 255;
            panel.auroraPanel.b = 255;
        }
    })

    auroraSetEffects();
}

// main
auroraSetEffects();
sleep.sleep(3);
getPredictionsByRoute();

// main loop
function intervalFunc() {
    getPredictionsByRoute();
}

setInterval(intervalFunc, 30000);