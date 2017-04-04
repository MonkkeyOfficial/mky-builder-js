import { Folder } from './Folder';
export declare class Exercice {
    configuration: any;
    sourceFolder: Folder;
    gatherFolder: Folder;
    sourceInstallFilePath: string;
    destinationInstallFilePath: string;
    destinationFiltersFolder: Folder;
    destinationConfigurationFile: string;
    zippedFilePath: string;
    constructor(configuration: any, sourceFolder: string | Folder, gatherFolder: string | Folder, zippedFilePath: string);
    static fromFolderPath(temporaryFolder: string | Folder, folderPath: string | Folder): Exercice;
    gather(callback: (error?: any) => void): void;
    zip(callback: any): void;
    compile(callback: any): void;
    update(callback: any): void;
    static push(url: string, filePath: string, callback: (error: any, response: any) => void): void;
    push(callback: (error: any, response: any) => void): void;
}
