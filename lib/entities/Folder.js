"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var Folder = (function () {
    function Folder(folderPath) {
        this.path = path.resolve(folderPath);
    }
    Folder.create = function (folder) {
        if (folder instanceof Folder)
            return folder;
        else
            return new Folder(folder);
    };
    Folder.prototype.exists = function (callback) {
        fs.exists(this.path, callback);
    };
    Folder.prototype.delete = function (callback) {
        var _this = this;
        this.exists(function (exists) {
            if (exists)
                fs.remove(_this.path, callback);
            else
                callback(null);
        });
    };
    Folder.prototype.clear = function (callback) {
        var _this = this;
        fs.exists(this.path, function (exists) {
            if (!exists)
                fs.mkdir(_this.path, callback);
            else
                fs.emptyDir(_this.path, callback);
        });
    };
    Folder.prototype.make = function (callback) {
        fs.ensureDir(this.path, callback);
    };
    Folder.prototype.copyTo = function (destination, callback) {
        fs.copy(this.path, Folder.create(destination).path, callback);
    };
    Folder.prototype.subFile = function (name) {
        return path.join(this.path, name);
    };
    Folder.prototype.subFolder = function (name) {
        return Folder.create(path.join(this.path, name));
    };
    return Folder;
}());
exports.Folder = Folder;
