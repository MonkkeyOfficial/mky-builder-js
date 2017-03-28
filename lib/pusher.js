var fs = require('fs'),
    globalConfig = require('./globalConfig.js'),
    request = require('request');

module.exports = {
    push: function(o, callbacks)
    {
        callbacks.start(o);

        var url = o.config.url;
        while(url.length > 0 && url.indexOf('/') === url.length - 1)
            url = url.substring(0, url.length - 1);

        request.post({
            url: url + '/compile',
            headers: {
                Accept: 'application/json'
            },
            formData: {
                file: {
                    value: fs.createReadStream(o.dest),
                    options: {
                        //filename: 'exo.tar.gz',
                        contentType: 'application/octet-stream'
                    }
                }
            }
        }, (e, res, body) => {
            if(e)
            {
                // manage error ...
                callbacks.error(o, e);
                return;
            }

            try
            {
                if(body.constructor === String)
                    body = JSON.parse(body);
            }
            catch(ex)
            {
                // manager error ...
                callbacks.error(o, ex);
                return;
            }
            
            if(!body.success)
            {
                // manager error ...
                callbacks.error(o, body.error);
                return;
            }

            callbacks.success(o);
        });
    }
}