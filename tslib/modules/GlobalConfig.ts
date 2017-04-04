import * as URL from 'url'
import * as fs from 'fs'

var globalConfig;

try
{
    globalConfig = JSON.parse(fs.readFileSync('monkkey.json').toString());
    globalConfig.found = true;
}
catch(ex)
{
    globalConfig = {
        found: false
    };
}

export class GlobalConfiguration
{
    found: boolean

    // From file
    baseUrl : string
    url : string
    exercices : Array<string>

    // From static
    configFileName : string
    repositoryUrl : string
    tmpFolder : string
    exeName : string
}

if(globalConfig.found)
{
    let url = globalConfig.url;
    url = URL.parse(url);
    url = url.protocol + '//' + url.hostname + ':' + url.port;
    globalConfig.baseUrl = url;
}

globalConfig.configFileName = 'monkkey.json'
globalConfig.repositoryUrl = 'http://192.168.0.36:9000'
globalConfig.tmpFolder = '.bin'
globalConfig.exeName = 'monkkey'

export default globalConfig as GlobalConfiguration;
