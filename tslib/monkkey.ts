import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as read from 'read'
import * as URL from 'url'

import globalConfig from './modules/GlobalConfig'
import * as userManager from './modules/User'
import zip from './modules/Zip'

import { Exercice } from './entities/Exercice'
import { Project } from './entities/Project'

// Spread classes
export { User } from './modules/User';
export { Exercice } from './entities/Exercice';
export { Project } from './entities/Project';

export function commandLine(argv? : Array<string>)
{
    if(!argv)
        argv = process.argv;

    var cmd = argv[2];
    switch(cmd)
    {
        case 'connect':
            if(!globalConfig.baseUrl)
                break;
            
            var username = argv[3];

            read({
                prompt: 'Password: ',
                silent: true
            }, (e, password) => {
                let user = new userManager.User(username, password);
                user.connect(globalConfig.baseUrl, {
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
            if(!globalConfig.baseUrl)
                break;

            userManager.User.fromSession('').disconnect(globalConfig.baseUrl, {
                error: e => {
                    console.log(e.toString());
                },
                success: () => {
                    console.log(' [o] Disconnected');
                }
            });
            break;

        case 'adduser':
            if(!globalConfig.baseUrl)
                break;
        
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
                        
                        let user = new userManager.User(username, password, email);
                        user.create(globalConfig.baseUrl, {
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
            Project.fromFolderPath('.').update((es, ss) => {
                if(es.length > 0)
                {
                    console.error(' [!] ' + es.length + ' error(s) :');
                    es.forEach(o => console.error('     @' + o.exercice.sourceFolder.path + ' : ' + o.error));
                }
                else
                {
                    ss.forEach(o => console.log(' [o] ' + o.sourceFolder.path + ' - updated.'))
                }
            })
            break;

        case 'publish':
            if(argv.length < 5)
            {
                console.error(' [!] Not enough arguments for this command.');
                console.error('     Check the usage with \'' + globalConfig.exeName + ' help\'.');
                break;
            }

            let url = argv[3]
            let file = argv[4]

            Exercice.push(url, file, (e, r) => {
                if(e)
                    console.log(' [!] ' + e);
                else
                    console.log(' [o] ' + url + ' - updated.')
            })
            break;

        case 'compile':
            let files = argv.length < 4 ? ['.'] : argv.slice(3)
            
            files.forEach(path => {
                let exercice = Exercice.fromFolderPath('.bin', path)
                console.log(' [ ] Compiling \'' + path + '\'...');
                exercice.compile(e => {
                    if(e)
                        console.error(' [!] ' + path + ' : An error occured : ' + e)
                    else
                    {
                        console.log(' [o] ' + path + ' : Files compressed at :');
                        console.log(exercice.zippedFilePath);
                    }
                })
            })
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
