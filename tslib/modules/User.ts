import * as request from 'request'

export interface UserCallback
{
    start? : () => void;
    error? : (error : any) => void;
    success? : (session : string, user : User) => void;
}

function reqServer(url : string, data : any, session : string, callbacks : UserCallback)
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

        callbacks.success(body.session, body.user as User);
    });
}

function toSuffixableUrl(url)
{
    while(url.length > 0 && url.indexOf('/') === url.length - 1)
        url = url.substring(0, url.length - 1);

    return url;
}

export function create(user : User, url : string, callbacks : UserCallback)
{
    reqServer(toSuffixableUrl(url) + '/user/create', user, undefined, callbacks);
}

export function connect(user : User, url : string, callbacks : UserCallback)
{
    reqServer(toSuffixableUrl(url) + '/user/connect', user, undefined, callbacks);
}

export function getUser(url : string, session : string, callbacks : UserCallback)
{
    reqServer(toSuffixableUrl(url) + '/user', undefined, session, callbacks);
}

export function disconnect(url : string, session : string, callbacks : UserCallback)
{
    reqServer(toSuffixableUrl(url) + '/user/connect', undefined, session, callbacks);
}

export class User
{
    static fromSession(session : string) : User
    {
        return {
            session: session
        } as User
    }
    constructor(username : string, password? : string, email? : string)
    {
        this.username = username;
    }

    username?: string;
    password?: string;
    email?: string;
    session? : string;

    private wrapCallback(callbacks : UserCallback)
    {
        function set(session : string, user : User)
        {
            if(user)
            {
                this.username = user.username;
                this.password = user.password;
                this.email = user.email;
            }
            this.session = session;
        }

        if(!callbacks.success)
            callbacks.success = set;
        else
        {
            let success = callbacks.success;
            callbacks.success = (session, user) => {
                set(session, user);
                success(session, user);
            }
        }
    }

    isConnected() : boolean
    {
        return !!this.session;
    }

    create(url : string, callbacks : UserCallback)
    {
        this.wrapCallback(callbacks);
        create(this, url, null)
    }

    connect(url : string, callbacks : UserCallback)
    {
        this.wrapCallback(callbacks);
        connect(this, url, callbacks)
    }

    disconnect(url : string, callbacks : UserCallback)
    {
        this.wrapCallback(callbacks);
        disconnect(url, this.session, callbacks)
    }
}