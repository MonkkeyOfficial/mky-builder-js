"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var fs = require("fs-extra");
var path = require("path");
var read = require("read");
var URL = require("url");
var GlobalConfig_1 = require("./modules/GlobalConfig");
var userManager = require("./modules/User");
var builder = require("./modules/Builder");
var pusher = require("./modules/Pusher");
var Zip_1 = require("./modules/Zip");
function execute() {
    exports.commandLine(process.argv);
}
exports.execute = execute;
function publish(url, filePath, options) {
    if (!options)
        options = {};
    if (options.constructor === Function) {
        var callback_1 = options;
        options = {
            start: function (o) { return callback_1(o, null); },
            error: function (o, e) { return callback_1(o, e); },
            success: function (o) { return callback_1(o, null); }
        };
    }
    var callbacks = options;
    filePath = path.resolve(filePath);
    fs.exists(filePath, function (exists) {
        if (!exists) {
            if (callbacks.error)
                callbacks.error(null, 'The file \'' + filePath + '\' doesn\'t exist.');
            return;
        }
        pusher.push({
            config: {
                url: url
            },
            dest: filePath
        }, options);
    });
}
exports.publish = publish;
function compile(folders, options) {
    if (folders === void 0) { folders = null; }
    if (options === void 0) { options = null; }
    if (folders && folders.constructor === Object) {
        options = folders;
        folders = null;
    }
    if (!folders)
        folders = [process.cwd()];
    if (!options)
        options = {};
    if (options.constructor === Function) {
        var callback = options;
        options = {
            start: function (o) { return callback(o, null); },
            error: function (o, e) { return callback(o, e); },
            success: function (o) { return callback(o, null); }
        };
    }
    folders.forEach(function (folder) {
        fs.readJson(path.join(folder, GlobalConfig_1.default.configFileName), function (e, config) {
            while (config.url && config.url.length > 0 && config.url.indexOf('/') === config.url.length - 1) {
                config.url = config.url.substring(0, config.url.length - 1);
                console.log(config.url);
            }
            if (!e && (!config.url || config.url.length === 0))
                e = 'The property \'url\' is not found or empty in the configuration file.';
            if (e) {
                if (options.error)
                    options.error(e, {
                        folder: folder
                    });
                return;
            }
            var hashedUrl = crypto.createHash('md5').update(config.url).digest('hex');
            var dest = path.join(GlobalConfig_1.default.tmpFolder, 'f_' + hashedUrl);
            var destZip = path.join(GlobalConfig_1.default.tmpFolder, '_' + hashedUrl);
            var callbackArguments = {
                folder: folder,
                configuration: config,
                temporaryFolder: dest,
                destination: destZip
            };
            if (options.compressionStarted)
                options.start(callbackArguments);
            builder.createTempFolder(config, folder, dest, function () {
                Zip_1.default(dest, destZip, function (src, dest) {
                    if (options.success)
                        options.success(callbackArguments);
                }, function (e, src, dest) {
                    if (options.error)
                        options.error(e, callbackArguments);
                });
            });
        });
    });
}
exports.compile = compile;
function update(options) {
    if (options === void 0) { options = null; }
    if (!options)
        options = {};
    if (!options.push)
        options.push = {};
    if (options.constructor === Function) {
        var callback = options;
        options = {
            compressionErrors: function (es) { return callback(null, es); },
            push: {
                start: function (o) { return callback(o, null); },
                error: function (o, e) { return callback(o, e); },
                success: function (o) { return callback(o, null); }
            }
        };
    }
    if (options.push.constructor === Function) {
        var callback = options.push;
        options.push = {
            start: function (o) { return callback(o, null); },
            error: function (o, e) { return callback(o, e); },
            success: function (o) { return callback(o, null); }
        };
    }
    builder.execute(GlobalConfig_1.default.tmpFolder, function (ss) {
        ss.forEach(function (o) {
            pusher.push(o, options.push);
        });
    }, function (ss, es) {
        if (options.errors)
            options.compressionErrors(es);
    }, function (e) {
        if (options.errors)
            options.compressionErrors([e]);
    });
}
exports.update = update;
function getUser(url, session, callback) {
    userManager.getUser(url, session, {
        error: function (e) {
            callback(e, null);
        },
        success: function (_, user) {
            callback(null, user);
        }
    });
}
exports.getUser = getUser;
function disconnect(url, session, callback) {
    userManager.disconnect(url, session, {
        error: function (e) {
            callback(e, null);
        },
        success: function (_, user) {
            callback(null, user);
        }
    });
}
exports.disconnect = disconnect;
function create(username, password, email, url, callback) {
    userManager.create(username, password, email, url, {
        error: function (e) {
            callback(e, null, null);
        },
        success: function (session, user) {
            callback(null, session, user);
        }
    });
}
exports.create = create;
function connect(username, password, url, callback) {
    userManager.connect(username, password, url, {
        error: function (e) {
            callback(e, null, null);
        },
        success: function (session, user) {
            callback(null, session, user);
        }
    });
}
exports.connect = connect;
function getGlobalUrl() {
    var url = GlobalConfig_1.default.url;
    if (!url) {
        console.error(' [!] No url specified.');
        return undefined;
    }
    url = URL.parse(url);
    url = url.protocol + '//' + url.hostname + ':' + url.port;
    return url;
}
function commandLine(argv) {
    var cmd = argv[2];
    switch (cmd) {
        case 'connect':
            var url = getGlobalUrl();
            if (!url)
                break;
            var username = argv[3];
            read({
                prompt: 'Password: ',
                silent: true
            }, function (e, password) {
                userManager.connect(username, password, url, {
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
            var url = getGlobalUrl();
            if (!url)
                break;
            userManager.disconnect(url, '', {
                error: function (e) {
                    console.log(e.toString());
                },
                success: function () {
                    console.log(' [o] Disconnected');
                }
            });
            break;
        case 'adduser':
            var url = getGlobalUrl();
            if (!url)
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
                        userManager.create(username, password, email, url, {
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
            console.log(' [ ] Compressing...');
            exports.update({
                compressionErrors: function (es) {
                    console.error(' [!] ' + es.length + ' error(s) :');
                    es.forEach(function (o) {
                        console.error('     @' + o.source + ' : ' + o.error);
                    });
                },
                push: {
                    start: function (o) { return console.log(' [ ] ' + o.config.url + ' - updating...'); },
                    success: function (o) { return console.log(' [o] ' + o.config.url + ' - updated.'); },
                    error: function (o, e) { return console.error(' [!] ' + o.config.url + ' - error : ' + e); },
                }
            });
            break;
        case 'publish':
            if (argv.length < 5) {
                console.error(' [!] Not enough arguments for this command.');
                console.error('     Check the usage with \'' + GlobalConfig_1.default.exeName + ' help\'.');
                break;
            }
            exports.publish(argv[3], argv[4], {
                start: function (o) { return console.log(' [ ] ' + o.config.url + ' - updating...'); },
                success: function (o) { return console.log(' [o] ' + o.config.url + ' - updated.'); },
                error: function (o, e) { return console.error(' [!] ' + o.config.url + ' - error : ' + e); },
            });
            break;
        case 'compile':
            var options = {
                start: function (info) { return console.log(' [ ] ' + info.folder + ' : Compressing...'); },
                success: function (info) {
                    console.log(' [o] ' + info.folder + ' : Files compressed at :');
                    console.log('     ' + info.destination);
                },
                error: function (e, info) { return console.error(' [!] ' + info.folder + ' : An error occured : ' + e); }
            };
            if (argv.length < 4)
                exports.compile(options);
            else
                exports.compile(argv.slice(3), options);
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
