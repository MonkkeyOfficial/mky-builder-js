"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var fs = require("fs");
function push(o, callbacks) {
    callbacks.start(o);
    var url = o.config.url;
    while (url.length > 0 && url.indexOf('/') === url.length - 1)
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
                    contentType: 'application/octet-stream'
                }
            }
        }
    }, function (e, res, body) {
        if (e) {
            callbacks.error(o, e);
            return;
        }
        try {
            if (body.constructor === String)
                body = JSON.parse(body);
        }
        catch (ex) {
            callbacks.error(o, ex);
            return;
        }
        if (!body.success) {
            callbacks.error(o, body.error);
            return;
        }
        callbacks.success(o);
    });
}
exports.push = push;
