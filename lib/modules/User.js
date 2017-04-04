"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
function reqServer(url, data, session, callbacks) {
    var cookie = undefined;
    if (session)
        cookie = 'connect.sid=' + session + ';';
    if (callbacks.start)
        callbacks.start();
    request.post({
        url: url,
        headers: {
            Accept: 'application/json',
            Cookie: cookie
        },
        body: data,
        json: true
    }, function (e, res, body) {
        if (e) {
            callbacks.error(e);
            return;
        }
        try {
            if (body.constructor === String)
                body = JSON.parse(body);
        }
        catch (ex) {
            callbacks.error(ex);
            return;
        }
        if (body.error) {
            callbacks.error(body.error);
            return;
        }
        callbacks.success(body.session, body.user);
    });
}
function toSuffixableUrl(url) {
    while (url.length > 0 && url.indexOf('/') === url.length - 1)
        url = url.substring(0, url.length - 1);
    return url;
}
function create(username, password, email, url, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user/create', {
        username: username,
        password: password,
        email: email
    }, undefined, callbacks);
}
exports.create = create;
function connect(username, password, url, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user/connect', {
        username: username,
        password: password
    }, undefined, callbacks);
}
exports.connect = connect;
function getUser(url, session, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user', undefined, session, callbacks);
}
exports.getUser = getUser;
function disconnect(url, session, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user/connect', undefined, session, callbacks);
}
exports.disconnect = disconnect;
