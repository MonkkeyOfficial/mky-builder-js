import * as request from 'request'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'

import globalConfig from '../modules/GlobalConfig'
import { Exercice } from './Exercice'
import { Folder } from './Folder'

export class ErrorExerciceEntry
{
    error : any
    exercice : Exercice
}
export interface ProjectCallback
{
    (erroneousExercices : Array<ErrorExerciceEntry>, validExercices : Array<Exercice>) : void
}

class CountOutCallback
{
    number : number
    errors : Array<ErrorExerciceEntry> = []
    successes : Array<Exercice> = []
    callback : ProjectCallback

    constructor(number : number, callback : ProjectCallback)
    {
        this.number = number;
        this.callback = callback;
    }

    iterate(exercice : Exercice, error? : any)
    {
        if(error)
            this.errors.push({ error: error, exercice: exercice })
        else
            this.successes.push(exercice)
        
        if(--this.number <= 0)
            this.callback(this.errors, this.successes)
    }

    asCallable(exercice : Exercice)
    {
        return e => {
            this.iterate(exercice, e)
        }
    }
}

export class Project
{
    configuration : any
    exercices : Array<Exercice>
    temporaryFolder : Folder

    constructor(configuration : any, temporaryFolder : string | Folder)
    {
        this.configuration = configuration;
        this.temporaryFolder = Folder.create(temporaryFolder);

        if(!configuration.exercices)
            this.exercices = [];
        else
            this.exercices = configuration.exercices.map(v => Exercice.fromFolderPath(this.temporaryFolder, v));
    }

    static fromFolderPath(folder : string | Folder) : Project
    {
        var fold = Folder.create(folder);
        var configuration = fs.readJsonSync(fold.subFile(globalConfig.configFileName))

        return new Project(configuration, fold.subFolder(globalConfig.tmpFolder))
    }

    update(callback : ProjectCallback)
    {
        let countOut = new CountOutCallback(this.exercices.length, callback)
        this.exercices.forEach(exercice => exercice.update(countOut.asCallable(exercice)))
    }
}
