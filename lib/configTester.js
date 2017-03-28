module.exports = {
    checkExercice: function(config) {
        var result = {
            missing: [],
            unrecognized: [],
            badType: []
        };

        // required
        if(!config.userFiles)
            result.missing.push('userFiles');
        if(!config.uid)
            result.missing.push('uid');
        if(!config.command)
            result.missing.push('command');

        for(var k in config)
        {
            switch(k)
            {
                case 'information':
                case 'userFIles':
                    if(config[k].constructor !== Object)
                        result.badType.push(k);
                    break;

                case 'uid':
                    if(config[k].constructor !== Number)
                        result.badType.push(k);
                    break;

                case 'include':
                    if(config[k].constructor !== Array)
                        result.badType.push(k);
                    break;

                case 'command':
                    if(config[k].constructor !== String)
                        result.badType.push(k);
                    break;
                
                default:
                    result.unrecognized.push(k);
                    break;
            }
        }
        
        return result;
    }
}