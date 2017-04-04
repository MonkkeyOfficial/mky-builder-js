import * as fstream from 'fstream'
import * as zlib from 'zlib'
import * as tar from 'tar'
import * as fs from 'fs'

let gzip = zlib.createGzip();

export interface ZipCallback
{
    (directoryPath : string, destinationPath : string) : void;
}
export interface ZipErrorCallback
{
    (error : any, directoryPath : string, destinationPath : string) : void;
}

export default function zip(directoryPath : string, destinationPath : string, callback : ZipCallback, errorCallback : ZipErrorCallback)
{
    var dirDest = fs.createWriteStream(destinationPath);

    function onError(e)
    {
        if(errorCallback)
            errorCallback(e, directoryPath, destinationPath);
    }

    function onEnd()
    {
        if(callback)
            callback(directoryPath, destinationPath);
    }

    var packer = tar.Pack({/* fromBase: true*/ })
        .on('error', onError);

    fstream.Reader({ path: directoryPath, type: "Directory" })
        .on('error', onError)
        .pipe(packer)
        .pipe(gzip)
        .on('end', onEnd)
        .pipe(dirDest);
}