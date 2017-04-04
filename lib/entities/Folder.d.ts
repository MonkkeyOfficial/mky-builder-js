export declare class Folder {
    path: any;
    constructor(folderPath: string);
    static create(folder: string | Folder): Folder;
    exists(callback: (exists: boolean) => void): void;
    delete(callback: (error?: any) => void): void;
    clear(callback: (error?: any) => void): void;
    make(callback: (error?: any) => void): void;
    copyTo(destination: string | Folder, callback: (error?: any) => void): void;
    subFile(name: string): string;
    subFolder(name: string): Folder;
}
