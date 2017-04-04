"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fstream = require("fstream");
var zlib = require("zlib");
var tar = require("tar");
var fs = require("fs");
var gzip = zlib.createGzip();
function zip(directoryPath, destinationPath, callback, errorCallback) {
    var dirDest = fs.createWriteStream(destinationPath);
    function onError(e) {
        if (errorCallback)
            errorCallback(e, directoryPath, destinationPath);
    }
    function onEnd() {
        if (callback)
            callback(directoryPath, destinationPath);
    }
    var packer = tar.Pack({})
        .on('error', onError);
    fstream.Reader({ path: directoryPath, type: "Directory" })
        .on('error', onError)
        .pipe(packer)
        .pipe(gzip)
        .on('end', onEnd)
        .pipe(dirDest);
}
exports.default = zip;
