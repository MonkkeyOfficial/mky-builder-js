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
function create(user, url, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user/create', user, undefined, callbacks);
}
exports.create = create;
function connect(user, url, callbacks) {
    reqServer(toSuffixableUrl(url) + '/user/connect', user, undefined, callbacks);
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
var User = (function () {
    function User(username, password, email) {
        this.username = username;
    }
    User.fromSession = function (session) {
        return {
            session: session
        };
    };
    User.prototype.wrapCallback = function (callbacks) {
        function set(session, user) {
            if (user) {
                this.username = user.username;
                this.password = user.password;
                this.email = user.email;
            }
            this.session = session;
        }
        if (!callbacks.success)
            callbacks.success = set;
        else {
            var success_1 = callbacks.success;
            callbacks.success = function (session, user) {
                set(session, user);
                success_1(session, user);
            };
        }
    };
    User.prototype.isConnected = function () {
        return !!this.session;
    };
    User.prototype.create = function (url, callbacks) {
        this.wrapCallback(callbacks);
        create(this, url, null);
    };
    User.prototype.connect = function (url, callbacks) {
        this.wrapCallback(callbacks);
        connect(this, url, callbacks);
    };
    User.prototype.disconnect = function (url, callbacks) {
        this.wrapCallback(callbacks);
        disconnect(url, this.session, callbacks);
    };
    return User;
}());
exports.User = User;
