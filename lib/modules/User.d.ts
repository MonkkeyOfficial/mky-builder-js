export interface UserCallback {
    start?: () => void;
    error?: (error: any) => void;
    success?: (session: string, user: User) => void;
}
export declare function create(user: User, url: string, callbacks: UserCallback): void;
export declare function connect(user: User, url: string, callbacks: UserCallback): void;
export declare function getUser(url: string, session: string, callbacks: UserCallback): void;
export declare function disconnect(url: string, session: string, callbacks: UserCallback): void;
export declare class User {
    static fromSession(session: string): User;
    constructor(username: string, password?: string, email?: string);
    username?: string;
    password?: string;
    email?: string;
    session?: string;
    private wrapCallback(callbacks);
    isConnected(): boolean;
    create(url: string, callbacks: UserCallback): void;
    connect(url: string, callbacks: UserCallback): void;
    disconnect(url: string, callbacks: UserCallback): void;
}
