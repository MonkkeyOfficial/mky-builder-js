var fs = require('fs-extra'),
    path = require('path'),
    builder = require('./builder.js'),
    globalConfig = require('./globalConfig.js'),
    tester = require('./configTester.js'),
    zip = require('./zip.js'),
    pusher = require('./pusher.js'),
    crypto = require('crypto'),
    userManager = require('./user.js');

exports.execute = function()
{
    exports.commandLine(process.argv);
}

/**
 * @param {String} url
 * @param {String} filePath
 * @param {(Object|Function)} options
 * @param {Function} options.start
 * @param {Function} options.success
 * @param {Function} options.error
 */
exports.publish = function(url, filePath, options = null)
{
    if(!options)
        options = {};
    if(options.constructor === Function)
    {
        var callback = options;
        options = {
            start: (o) => callback(o, null),
            error: (o, e) => callback(o, e),
            success: (o) => callback(o, null)
        }
    }

    filePath = path.resolve(filePath);
    fs.exists(filePath, exists => {
        if(!exists)
        {
            if(options.error)
                options.error(null, 'The file \'' + filePath + '\' doesn\'t exist.');
            return;
        }

        pusher.push({
            config: {
                url: url
            },
            dest: filePath
        }, options)
    })
}

/**
 * @param {(String|String[])} folders
 * @param {(Object|Function)} options
 * @param {Function} options.error
 * @param {Function} options.success
 * @param {Function} options.start
 */
exports.compile = function(folders = null, options = null)
{
    if(folders && folders.constructor === Object)
    {
        options = folders;
        folders = null;
    }
    if(!folders)
        folders = [ process.cwd() ];
    if(!options)
        options = {};
    if(options.constructor === Function)
    {
        var callback = options;
        options = {
            start: (o) => callback(o, null),
            error: (o, e) => callback(o, e),
            success: (o) => callback(o, null)
        }
    }

    folders.forEach(function(folder) {
        fs.readJson(path.join(folder, globalConfig.configFileName), (e, config) => {
            while(config.url && config.url.length > 0 && config.url.indexOf('/') === config.url.length - 1)
            {
                config.url = config.url.substring(0, config.url.length - 1);
                console.log(config.url);
            }
            if(!e && (!config.url || config.url.length === 0))
                e = 'The property \'url\' is not found or empty in the configuration file.';
            if(e)
            {
                if(options.error)
                    options.error(e, {
                        folder: folder
                    });
                return;
            }

            var hashedUrl = crypto.createHash('md5').update(config.url).digest('hex');

            var dest = path.join(globalConfig.tmpFolder, 'f_' + hashedUrl);
            var destZip = path.join(globalConfig.tmpFolder, '_' + hashedUrl);

            var callbackArguments = {
                folder: folder,
                configuration: config,
                temporaryFolder: dest,
                destination: destZip
            };

            if(options.compressionStarted)
                options.start(callbackArguments);
            builder.createTempFolder(config, folder, dest, () => {
                zip.zip(dest, destZip, (src, dest) => {
                    if(options.success)
                        options.success(callbackArguments);
                }, (e, src, dest) => {
                    if(options.error)
                        options.error(e, callbackArguments);
                });
            })
        })
    })
}

/**
 * @param {(Object|Function)} options
 * @param {Function} options.compressionErrors
 * @param {(Object|Function)} options.push
 * @param {Function} options.push.start
 * @param {Function} options.push.success
 * @param {Function} options.push.error
 */
exports.update = function(options = null)
{
    if(!options)
        options = {};
    if(!options.push)
        options.push = {};
    if(options.constructor === Function)
    {
        var callback = options;
        options = {
            compressionErrors: (es) => callback(null, es),
            push: {
                start: (o) => callback(o, null),
                error: (o, e) => callback(o, e),
                success: (o) => callback(o, null)
            }
        }
    }
    if(options.push.constructor === Function)
    {
        var callback = options.push;
        options.push = {
            start: (o) => callback(o, null),
            error: (o, e) => callback(o, e),
            success: (o) => callback(o, null)
        }
    }
    
    builder.execute(globalConfig.tmpFolder, ss => {
        ss.forEach(function(o) {
            pusher.push(o, options.push)
        });
    }, (ss, es) => {
        if(options.errors)
            options.compressionErrors(es);
    }, e => {
        if(options.errors)
            options.compressionErrors([e]);
    });
}

exports.getUser = function(url, session, callback)
{
    userManager.getUser(url, session, {
        error: e => {
            callback(e, null);
        },
        success: (_, user) => {
            callback(null, user)
        }
    });
}
exports.disconnect = function(url, session, callback)
{
    userManager.disconnect(url, session, {
        error: e => {
            callback(e, null);
        },
        success: (_, user) => {
            callback(null, user)
        }
    });
}
exports.create = function(username, password, email, url, callback)
{
    userManager.create(username, password, email, url, {
        error: e => {
            callback(e, null, null);
        },
        success: (session, user) => {
            callback(null, session, user)
        }
    });
}
exports.connect = function(username, password, url, callback)
{
    userManager.connect(username, password, url, {
        error: e => {
            callback(e, null, null);
        },
        success: (session, user) => {
            callback(null, session, user)
        }
    });
}

function getGlobalUrl()
{
    var url = globalConfig.url;
    if(!url)
    {
        console.error(' [!] No url specified.');
        return undefined;
    }
    var URL = require('url');
    url = URL.parse(url);
    url = url.protocol + '//' + url.hostname + ':' + url.port;

    return url;
}

exports.commandLine = function(argv)
{
    var cmd = argv[2];
    switch(cmd)
    {
        case 'connect':
            var url = getGlobalUrl();
            if(!url)
                break;

            var read = require("read");
            var username = argv[3];

            read({
                prompt: 'Password: ',
                silent: true
            }, (e, password) => {
                userManager.connect(username, password, url, {
                    error: e => {
                        console.log(e.toString());
                    },
                    success: (session, user) => {
                        console.log(' [o] Connected as ' + user.username);
                        console.log('     ' + session);
                    }
                });
            });
            break;
            
        case 'disconnect':
            var url = getGlobalUrl();
            if(!url)
                break;

            userManager.disconnect(url, {
                error: e => {
                    console.log(e.toString());
                },
                success: () => {
                    console.log(' [o] Disconnected');
                }
            });
            break;

        case 'adduser':
            var url = getGlobalUrl();
            if(!url)
                break;

            var read = require("read");
        
            read({
                prompt: 'Username: '
            }, (e, username) => {
                read({
                    prompt: 'Password: ',
                    silent: true
                }, (e, password) => {
                    read({
                        prompt: 'EMail (ENTER to skip): ',
                        default: ''
                    }, (e, email) => {
                        if(email !== null && email.trim().length === 0)
                            email = null;
                        
                        userManager.create(username, password, email, url, {
                            error: e => {
                                console.error(e.toString());
                            },
                            success: (session, user) => {
                                console.log(session);
                            }
                        });
                    })
                })
            })
            break;

        case 'check':
            break;

        case 'update':
            console.log(' [ ] Compressing...');
            exports.update({
                compressionErrors: (es) => {
                    console.error(' [!] ' + es.length + ' error(s) :');
                    es.forEach(function(o) {
                        console.error('     @' + o.source + ' : ' + o.error);
                    });
                },
                push: {
                    start: o => console.log(' [ ] ' + o.config.url + ' - updating...'),
                    success: o => console.log(' [o] ' + o.config.url + ' - updated.'),
                    error: (o, e) => console.error(' [!] ' + o.config.url + ' - error : ' + e),
                }
            });
            break;

        case 'publish':
            if(argv.length < 5)
            {
                console.error(' [!] Not enough arguments for this command.');
                console.error('     Check the usage with \'' + globalConfig.exeName + ' help\'.');
                break;
            }
            exports.publish(argv[3], argv[4], {
                start: o => console.log(' [ ] ' + o.config.url + ' - updating...'),
                success: o => console.log(' [o] ' + o.config.url + ' - updated.'),
                error: (o, e) => console.error(' [!] ' + o.config.url + ' - error : ' + e),
            });
            break;

        case 'compile':
            var options = {
                start: (info) => console.log(' [ ] ' + info.folder + ' : Compressing...'),
                success: (info) => {
                    console.log(' [o] ' + info.folder + ' : Files compressed at :');
                    console.log('     ' + info.destination);
                },
                error: (e, info) => console.error(' [!] ' + info.folder + ' : An error occured : ' + e)
            };

            if(argv.length < 4)
                exports.compile(options);
            else
                exports.compile(argv.slice(3), options);
            break;
        
        case '-h':
        case '--help':
        case 'help':
        default:
            console.log('Usage: ' + globalConfig.exeName + ' <command> [<options>]');
            console.log();
            console.log('Commands :');
            console.log('  help / --help / -h   | Display this help');
            console.log('  update               | Compile and push the result to the server');
            //console.log('  check                | Check if the files are valid');
            //console.log('  run <name>           | Run a macro stored in the local configuration file');
            console.log('  publish <url> <file> | Publish the specified tar+gzip file to the url');
            console.log('  compile [<folders>]  | Compile the the current directory or the specified folders into tar+gzip files');
            break;
    }
}