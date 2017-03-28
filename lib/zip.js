var fs = require('fs'),
    tar = require("tar"),
    fstream = require("fstream"),
    zlib = require('zlib'),
    gzip = zlib.createGzip();

module.exports = {
    zip: function(directoryPath, destinationPath, callback, errorCallback) {
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

        var packer = tar.Pack({ fromBase: true })
            .on('error', onError);

        fstream.Reader({ path: directoryPath, type: "Directory" })
            .on('error', onError)
            .pipe(packer)
            .pipe(gzip)
            .on('end', onEnd)
            .pipe(dirDest);
    }
}