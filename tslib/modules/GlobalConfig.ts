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

function $(name : string, defaultValue : any, root? : object)
{
    if(!root)
        root = globalConfig;
    if(root[name] === undefined)
        root[name] = defaultValue;
}

globalConfig.exeName = 'monkkey';

$('tmpFolder', '.bin');
$('repositoryUrl', 'http://192.168.0.36:9000');
$('configFileName', 'monkkey.json');

export default globalConfig as any;
