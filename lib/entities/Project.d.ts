import { Exercice } from './Exercice';
import { Folder } from './Folder';
export declare class ErrorExerciceEntry {
    error: any;
    exercice: Exercice;
}
export interface ProjectCallback {
    (erroneousExercices: Array<ErrorExerciceEntry>, validExercices: Array<Exercice>): void;
}
export declare class Project {
    configuration: any;
    exercices: Array<Exercice>;
    temporaryFolder: Folder;
    constructor(configuration: any, temporaryFolder: string | Folder);
    static fromFolderPath(folder: string | Folder): Project;
    update(callback: ProjectCallback): void;
}
