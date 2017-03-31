var fs = require('fs');

var globalConfig;

try
{
    globalConfig = JSON.parse(fs.readFileSync('monkkey.json'));
    globalConfig.found = true;
}
catch(ex)
{
    globalConfig = {
        found: false
    };
}

function $(name, defaultValue, root) {
    if(!root)
        root = globalConfig;
    if(root[name] === undefined)
        root[name] = defaultValue;
}

globalConfig.exeName = 'mky';

$('tmpFolder', '.bin');
$('repositoryUrl', 'http://192.168.0.36:9000');
$('configFileName', 'monkkey.json');

module.exports = globalConfig;