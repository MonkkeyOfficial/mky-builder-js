import * as fs from 'fs-extra'
import * as path from 'path'

export class Folder
{
    path : any

    constructor(folderPath : string)
    {
        this.path = path.resolve(folderPath);
    }

    static create(folder : string | Folder) : Folder
    {
        if(folder instanceof Folder)
            return folder;
        else
            return new Folder(folder);
    }

    exists(callback : (exists : boolean) => void)
    {
        fs.exists(this.path, callback);
    }

    delete(callback : (error? : any) => void)
    {
        this.exists(exists => {
            if(exists)
                fs.remove(this.path, callback);
            else
                callback(null);
        })
    }

    clear(callback : (error? : any) => void)
    {
        fs.exists(this.path, exists => {
            if(!exists)
                fs.mkdir(this.path, callback)
            else
                fs.emptyDir(this.path, callback)
        })
    }

    make(callback : (error? : any) => void)
    {
        fs.ensureDir(this.path, callback);
    }

    copyTo(destination : string | Folder, callback : (error? : any) => void)
    {
        fs.copy(this.path, Folder.create(destination).path, callback);
    }

    subFile(name : string) : string
    {
        return path.join(this.path, name);
    }
    subFolder(name : string) : Folder
    {
        return Folder.create(path.join(this.path, name))
    }
}
