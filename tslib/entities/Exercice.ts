import * as request from 'request'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'

import globalConfig from './../modules/GlobalConfig'
import { Folder } from './Folder'
import zip from '../modules/Zip'

export class Exercice
{
    configuration : any
    sourceFolder : Folder
    gatherFolder : Folder
    sourceInstallFilePath : string
    destinationInstallFilePath : string

    destinationFiltersFolder : Folder
    destinationConfigurationFile : string

    zippedFilePath : string

    constructor(configuration : any, sourceFolder : string | Folder, gatherFolder : string | Folder, zippedFilePath : string)
    {
        this.zippedFilePath = zippedFilePath;
        this.configuration = configuration;

        this.sourceFolder = Folder.create(sourceFolder);
        this.gatherFolder = Folder.create(gatherFolder);
        
        this.destinationFiltersFolder = this.gatherFolder.subFolder('_d__filters__')

        this.destinationConfigurationFile = this.gatherFolder.subFile('_d__config__')
        this.destinationInstallFilePath = this.gatherFolder.subFile('_d__install__')

        if(configuration.install)
            this.sourceInstallFilePath = this.sourceFolder.subFile(configuration.install)
    }

    /**
     * Create an exercice object for compilation and publishing.
     */
    static fromFolderPath(temporaryFolder : string | Folder, folderPath : string | Folder) : Exercice
    {
        let tmpFolder = Folder.create(temporaryFolder);
        let fpath = Folder.create(folderPath);
        
        var configuration = JSON.parse(fs.readFileSync(path.resolve(fpath.subFile(globalConfig.configFileName))).toString());

        var hashedUrl = crypto.createHash('md5').update(configuration.url).digest('hex');
        var tmpExoFolder = tmpFolder.subFile('f_' + hashedUrl);
        var zippedFilePath = tmpFolder.subFile('_' + hashedUrl);
        
        return new Exercice(configuration, fpath, tmpExoFolder, zippedFilePath);
    }

    /**
     * Gather the files for compilation into a compilation folder.
     */
    gather(callback : (error? : any) => void)
    {
        this.gatherFolder.clear(e =>
        {
            if(e)
            {
                callback(e);
                return;
            }
            
            this.sourceFolder.copyTo(this.gatherFolder, e =>
            {
                if(e)
                {
                    callback(e);
                    return;
                }

                if(this.configuration.install)
                    fs.copySync(this.sourceInstallFilePath, this.destinationInstallFilePath);
                else
                    fs.writeFileSync(this.destinationInstallFilePath, '');

                var destConfig = {
                    userFiles: this.configuration.userFiles ? this.configuration.userFiles : {},
                    "command": "node userScript.js"
                }

                this.destinationFiltersFolder.make(e =>
                {
                    for(var k in destConfig.userFiles)
                    {
                        var filters = destConfig.userFiles[k].filters;
                        if(filters)
                        {
                            var newFilters = [];
                            for(var k2 in filters)
                            {
                                var filter = filters[k2];
                                newFilters.push(path.join('/root/bin/_d__filters__', filter).replace(/\\/img, '/'));
                                fs.copySync(filter, path.join(this.destinationFiltersFolder.path, filter));
                            }
                            destConfig.userFiles[k].filters = newFilters;
                        }
                    }
                    
                    fs.writeJson(this.destinationConfigurationFile, destConfig, callback)
                })
            })
        });
    }

    /**
     * Zip the compiled exercice folder.
     */
    zip(callback)
    {
        zip(this.gatherFolder.path, this.zippedFilePath, () => {
            callback(null);
        }, e => {
            callback(e);
        });
    }

    /**
     * Compile and zip the exercice.
     */
    compile(callback)
    {
        this.gather(e => {
            if(e)
                callback(e)
            else
                this.zip(callback);
        })
    }

    /**
     * Compile, zip and send the exercice to the server.
     */
    update(callback)
    {
        this.gather(e => {
            if(e)
                callback(e)
            else
                this.zip(e => {
                    if(e)
                        callback(e)
                    else
                        this.push(callback);
                })
        })
    }


    static push(url : string, filePath : string, callback : (error : any, response : any) => void)
    {
        while(url.length > 0 && url.indexOf('/') === url.length - 1)
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
        }, (e, res, body) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            try
            {
                if(body.constructor === String)
                    body = JSON.parse(body);
            }
            catch(ex)
            {
                callback(ex, null);
                return;
            }
            
            if(!body.success)
            {
                callback(body.error ? body.error : 'Unkown error', null);
                return;
            }

            callback(null, body);
        });
    }

    /**
     * Send the zipped exercice to the server.
     */
    push(callback : (error : any, response : any) => void)
    {
        Exercice.push(this.configuration.url, this.zippedFilePath, callback);
    }
}
