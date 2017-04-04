"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var GlobalConfig_1 = require("../modules/GlobalConfig");
var Exercice_1 = require("./Exercice");
var Folder_1 = require("./Folder");
var ErrorExerciceEntry = (function () {
    function ErrorExerciceEntry() {
    }
    return ErrorExerciceEntry;
}());
exports.ErrorExerciceEntry = ErrorExerciceEntry;
var CountOutCallback = (function () {
    function CountOutCallback(number, callback) {
        this.errors = [];
        this.successes = [];
        this.number = number;
        this.callback = callback;
    }
    CountOutCallback.prototype.iterate = function (exercice, error) {
        if (error)
            this.errors.push({ error: error, exercice: exercice });
        else
            this.successes.push(exercice);
        if (--this.number <= 0)
            this.callback(this.errors, this.successes);
    };
    CountOutCallback.prototype.asCallable = function (exercice) {
        var _this = this;
        return function (e) {
            _this.iterate(exercice, e);
        };
    };
    return CountOutCallback;
}());
var Project = (function () {
    function Project(configuration, temporaryFolder) {
        var _this = this;
        this.configuration = configuration;
        this.temporaryFolder = Folder_1.Folder.create(temporaryFolder);
        if (!configuration.exercices)
            this.exercices = [];
        else
            this.exercices = configuration.exercices.map(function (v) { return Exercice_1.Exercice.fromFolderPath(_this.temporaryFolder, v); });
    }
    Project.fromFolderPath = function (folder) {
        var fold = Folder_1.Folder.create(folder);
        var configuration = fs.readJsonSync(fold.subFile(GlobalConfig_1.default.configFileName));
        return new Project(configuration, fold.subFolder(GlobalConfig_1.default.tmpFolder));
    };
    Project.prototype.update = function (callback) {
        var countOut = new CountOutCallback(this.exercices.length, callback);
        this.exercices.forEach(function (exercice) { return exercice.update(countOut.asCallable(exercice)); });
    };
    return Project;
}());
exports.Project = Project;
