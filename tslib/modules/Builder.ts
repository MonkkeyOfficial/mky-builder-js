import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'

import globalConfig from './GlobalConfig'
import zip from './Zip'

export function createTempFolder(config, src, dest, callback)
{
    function go()
    {
        fs.copy(src, dest, e => {
            if(e)
            {
                console.log('ERROR: ' + e);
                return;
            }

            var installPath = path.join(dest, '_d__install__');
            if(config.install)
            {
                var installFilePath = path.resolve(path.join(src, config.install));
                fs.copySync(installFilePath, installPath);
            }
            else
                fs.writeFileSync(installPath, '');

            var destConfig = {
                userFiles: config.userFiles ? config.userFiles : {},
                "command": "node userScript.js"
            }
            var filtersPath = path.join(dest, '_d__filters__');
            fs.ensureDirSync(filtersPath);
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
                        fs.copySync(filter, path.join(filtersPath, filter));
                    }
                    destConfig.userFiles[k].filters = newFilters;
                }
            }
            fs.writeJson(path.join(dest, '_d__config__'), destConfig, e => {
                if(e)
                {
                    console.log('ERROR2: ' + e);
                    return;
                }

                callback();
            })
        });
    }
    fs.exists(dest, exists => {
        if(exists)
            fs.remove(dest, e => {
                if(e)
                {
                    console.log('ERROR : ' + e);
                    return;
                }
                go();
            })
        else
            go();
    })
}
export function execute(tmpPath, callback, errorCallback, sysErrorCallback)
{
    tmpPath = path.resolve(tmpPath);

    fs.ensureDir(tmpPath, e => {
        if(e)
        {
            sysErrorCallback(e);
            return;
        }

        var counter = globalConfig.exercices.length;
        var errors = [];
        var successes = [];
        function success(config, source, dest)
        {
            successes.push({ config: config, source: source, dest: dest});
            _done();
        }
        function error(config, e, source, dest)
        {
            errors.push({ config: config, error: e, source: source, dest: dest});
            _done();
        }
        function _done()
        {
            --counter;
            if(counter <= 0)
            {
                if(errors.length === 0)
                    callback(successes);
                else if(errorCallback)
                    errorCallback(successes, errors);
            }
        }

        globalConfig.exercices.forEach(function(exerciceFolder) {
            var exoConfig = JSON.parse(fs.readFileSync(path.resolve(path.join(exerciceFolder, globalConfig.configFileName))).toString());

            var hashedUrl = crypto.createHash('md5').update(exoConfig.url).digest('hex');
            var tmpExoFolder = path.join(tmpPath, 'f_' + hashedUrl);

            module.exports.createTempFolder(exoConfig, exerciceFolder, tmpExoFolder, () =>
            {
                zip(tmpExoFolder, path.join(tmpPath, '_' + hashedUrl), (s, d) => {
                    success(exoConfig, exerciceFolder, d);
                }, (e, s, d) => {
                    error(exoConfig, e, exerciceFolder, d);
                });
            });
        })
    });
}