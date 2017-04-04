"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var crypto = require("crypto");
var fs = require("fs-extra");
var path = require("path");
var GlobalConfig_1 = require("./../modules/GlobalConfig");
var Folder_1 = require("./Folder");
var Zip_1 = require("../modules/Zip");
var Exercice = (function () {
    function Exercice(configuration, sourceFolder, gatherFolder, zippedFilePath) {
        this.zippedFilePath = zippedFilePath;
        this.configuration = configuration;
        this.sourceFolder = Folder_1.Folder.create(sourceFolder);
        this.gatherFolder = Folder_1.Folder.create(gatherFolder);
        this.destinationFiltersFolder = this.gatherFolder.subFolder('_d__filters__');
        this.destinationConfigurationFile = this.gatherFolder.subFile('_d__config__');
        this.destinationInstallFilePath = this.gatherFolder.subFile('_d__install__');
        if (configuration.install)
            this.sourceInstallFilePath = this.sourceFolder.subFile(configuration.install);
    }
    Exercice.fromFolderPath = function (temporaryFolder, folderPath) {
        var tmpFolder = Folder_1.Folder.create(temporaryFolder);
        var fpath = Folder_1.Folder.create(folderPath);
        var configuration = JSON.parse(fs.readFileSync(path.resolve(fpath.subFile(GlobalConfig_1.default.configFileName))).toString());
        var hashedUrl = crypto.createHash('md5').update(configuration.url).digest('hex');
        var tmpExoFolder = tmpFolder.subFile('f_' + hashedUrl);
        var zippedFilePath = tmpFolder.subFile('_' + hashedUrl);
        return new Exercice(configuration, fpath, tmpExoFolder, zippedFilePath);
    };
    Exercice.prototype.gather = function (callback) {
        var _this = this;
        this.gatherFolder.clear(function (e) {
            if (e) {
                callback(e);
                return;
            }
            _this.sourceFolder.copyTo(_this.gatherFolder, function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                if (_this.configuration.install)
                    fs.copySync(_this.sourceInstallFilePath, _this.destinationInstallFilePath);
                else
                    fs.writeFileSync(_this.destinationInstallFilePath, '');
                var destConfig = {
                    userFiles: _this.configuration.userFiles ? _this.configuration.userFiles : {},
                    "command": "node userScript.js"
                };
                _this.destinationFiltersFolder.make(function (e) {
                    for (var k in destConfig.userFiles) {
                        var filters = destConfig.userFiles[k].filters;
                        if (filters) {
                            var newFilters = [];
                            for (var k2 in filters) {
                                var filter = filters[k2];
                                newFilters.push(path.join('/root/bin/_d__filters__', filter).replace(/\\/img, '/'));
                                fs.copySync(filter, path.join(_this.destinationFiltersFolder.path, filter));
                            }
                            destConfig.userFiles[k].filters = newFilters;
                        }
                    }
                    fs.writeJson(_this.destinationConfigurationFile, destConfig, callback);
                });
            });
        });
    };
    Exercice.prototype.zip = function (callback) {
        Zip_1.default(this.gatherFolder.path, this.zippedFilePath, function () {
            callback(null);
        }, function (e) {
            callback(e);
        });
    };
    Exercice.prototype.compile = function (callback) {
        var _this = this;
        this.gather(function (e) {
            if (e)
                callback(e);
            else
                _this.zip(callback);
        });
    };
    Exercice.prototype.update = function (callback) {
        var _this = this;
        this.gather(function (e) {
            if (e)
                callback(e);
            else
                _this.zip(function (e) {
                    if (e)
                        callback(e);
                    else
                        _this.push(callback);
                });
        });
    };
    Exercice.push = function (url, filePath, callback) {
        while (url.length > 0 && url.indexOf('/') === url.length - 1)
            url = url.substring(0, url.length - 1);
        request.post({
            url: url + '/compile',
            headers: {
                Accept: 'application/json'
            },
            formData: {
                file: {
                    value: fs.createReadStream(filePath),
                    options: {
                        contentType: 'application/octet-stream'
                    }
                }
            }
        }, function (e, res, body) {
            if (e) {
                callback(e, null);
                return;
            }
            try {
                if (body.constructor === String)
                    body = JSON.parse(body);
            }
            catch (ex) {
                callback(ex, null);
                return;
            }
            if (!body.success) {
                callback(body.error ? body.error : 'Unkown error', null);
                return;
            }
            callback(null, body);
        });
    };
    Exercice.prototype.push = function (callback) {
        Exercice.push(this.configuration.url, this.zippedFilePath, callback);
    };
    return Exercice;
}());
exports.Exercice = Exercice;
