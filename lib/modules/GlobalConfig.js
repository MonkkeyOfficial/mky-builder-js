"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var URL = require("url");
var fs = require("fs");
var globalConfig;
try {
    globalConfig = JSON.parse(fs.readFileSync('monkkey.json').toString());
    globalConfig.found = true;
}
catch (ex) {
    globalConfig = {
        found: false
    };
}
var GlobalConfiguration = (function () {
    function GlobalConfiguration() {
    }
    return GlobalConfiguration;
}());
exports.GlobalConfiguration = GlobalConfiguration;
if (globalConfig.found) {
    var url = globalConfig.url;
    url = URL.parse(url);
    url = url.protocol + '//' + url.hostname + ':' + url.port;
    globalConfig.baseUrl = url;
}
globalConfig.configFileName = 'monkkey.json';
globalConfig.repositoryUrl = 'http://192.168.0.36:9000';
globalConfig.tmpFolder = '.bin';
globalConfig.exeName = 'monkkey';
exports.default = globalConfig;
