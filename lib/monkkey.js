"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var read = require("read");
var GlobalConfig_1 = require("./modules/GlobalConfig");
var userManager = require("./modules/User");
var Exercice_1 = require("./entities/Exercice");
var Project_1 = require("./entities/Project");
var User_1 = require("./modules/User");
exports.User = User_1.User;
var Exercice_2 = require("./entities/Exercice");
exports.Exercice = Exercice_2.Exercice;
var Project_2 = require("./entities/Project");
exports.Project = Project_2.Project;
function commandLine(argv) {
    if (!argv)
        argv = process.argv;
    var cmd = argv[2];
    switch (cmd) {
        case 'connect':
            if (!GlobalConfig_1.default.baseUrl)
                break;
            var username = argv[3];
            read({
                prompt: 'Password: ',
                silent: true
            }, function (e, password) {
                var user = new userManager.User(username, password);
                user.connect(GlobalConfig_1.default.baseUrl, {
                    error: function (e) {
                        console.log(e.toString());
                    },
                    success: function (session, user) {
                        console.log(' [o] Connected as ' + user.username);
                        console.log('     ' + session);
                    }
                });
            });
            break;
        case 'disconnect':
            if (!GlobalConfig_1.default.baseUrl)
                break;
            userManager.User.fromSession('').disconnect(GlobalConfig_1.default.baseUrl, {
                error: function (e) {
                    console.log(e.toString());
                },
                success: function () {
                    console.log(' [o] Disconnected');
                }
            });
            break;
        case 'adduser':
            if (!GlobalConfig_1.default.baseUrl)
                break;
            read({
                prompt: 'Username: '
            }, function (e, username) {
                read({
                    prompt: 'Password: ',
                    silent: true
                }, function (e, password) {
                    read({
                        prompt: 'EMail (ENTER to skip): ',
                        default: ''
                    }, function (e, email) {
                        if (email !== null && email.trim().length === 0)
                            email = null;
                        var user = new userManager.User(username, password, email);
                        user.create(GlobalConfig_1.default.baseUrl, {
                            error: function (e) {
                                console.error(e.toString());
                            },
                            success: function (session, user) {
                                console.log(session);
                            }
                        });
                    });
                });
            });
            break;
        case 'check':
            break;
        case 'update':
            Project_1.Project.fromFolderPath('.').update(function (es, ss) {
                if (es.length > 0) {
                    console.error(' [!] ' + es.length + ' error(s) :');
                    es.forEach(function (o) { return console.error('     @' + o.exercice.sourceFolder.path + ' : ' + o.error); });
                }
                else {
                    ss.forEach(function (o) { return console.log(' [o] ' + o.sourceFolder.path + ' - updated.'); });
                }
            });
            break;
        case 'publish':
            if (argv.length < 5) {
                console.error(' [!] Not enough arguments for this command.');
                console.error('     Check the usage with \'' + GlobalConfig_1.default.exeName + ' help\'.');
                break;
            }
            var url_1 = argv[3];
            var file = argv[4];
            Exercice_1.Exercice.push(url_1, file, function (e, r) {
                if (e)
                    console.log(' [!] ' + e);
                else
                    console.log(' [o] ' + url_1 + ' - updated.');
            });
            break;
        case 'compile':
            var files = argv.length < 4 ? ['.'] : argv.slice(3);
            files.forEach(function (path) {
                var exercice = Exercice_1.Exercice.fromFolderPath('.bin', path);
                console.log(' [ ] Compiling \'' + path + '\'...');
                exercice.compile(function (e) {
                    if (e)
                        console.error(' [!] ' + path + ' : An error occured : ' + e);
                    else {
                        console.log(' [o] ' + path + ' : Files compressed at :');
                        console.log(exercice.zippedFilePath);
                    }
                });
            });
            break;
        case '-h':
        case '--help':
        case 'help':
        default:
            console.log('Usage: ' + GlobalConfig_1.default.exeName + ' <command> [<options>]');
            console.log();
            console.log('Commands :');
            console.log('  help / --help / -h   | Display this help');
            console.log('  update               | Compile and push the result to the server');
            console.log('  publish <url> <file> | Publish the specified tar+gzip file to the url');
            console.log('  compile [<folders>]  | Compile the the current directory or the specified folders into tar+gzip files');
            break;
    }
}
exports.commandLine = commandLine;
