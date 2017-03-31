var request = require('request');

function reqServer(url, data, session, callbacks)
{
    var cookie = undefined;
    if(session)
        cookie = 'connect.sid=' + session + ';';

    if(callbacks.start)
        callbacks.start();

    request.post({
        url: url,
        headers: {
            Accept: 'application/json',
            Cookie: cookie
        },
        body: data,
        json: true
    }, (e, res, body) => {
        if(e)
        {
            // manage error ...
            callbacks.error(e);
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
            callbacks.error(ex);
            return;
        }
        
        if(body.error)
        {
            // manager error ...
            callbacks.error(body.error);
            return;
        }

        callbacks.success(body.session, body.user);
    });
}

function toSuffixableUrl(url)
{
    while(url.length > 0 && url.indexOf('/') === url.length - 1)
        url = url.substring(0, url.length - 1);

    return url;
}

module.exports = {
    create: function(username, password, email, url, callbacks)
    {
        reqServer(toSuffixableUrl(url) + '/user/create', {
            username: username,
            password: password,
            email: email
        }, undefined, callbacks);
    },
    connect: function(username, password, url, callbacks)
    {
        reqServer(toSuffixableUrl(url) + '/user/connect', {
            username: username,
            password: password
        }, undefined, callbacks);
    },
    disconnect: function(url, session, callbacks)
    {
        reqServer(toSuffixableUrl(url) + '/user/connect', undefined, session, callbacks);
    }
}