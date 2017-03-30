# Command line 'monkkey'

Allow to compile and push Monkkey projects to a remote server.

## Installation

### As a global program

`npm install -g monkkey`

Then, you can call it with :

`monkkey <commands...>`

### As a local dependency

`npm install monkkey`

Then, you can call it with :

```
(windows)$ node_modules/monkkey/monkkey <commands...>
   (*nux)$ ./node_modules/monkkey/monkkey <commands...>
```

You can include it to your javascript projects with :

```javascript
var monkkey = require('monkkey');
```

## Usage

### Command line

Command | Description
------------ | -------------
help / --help / -h | Display some help
update | Compile and push the result to the server
check | Check if the files are valid
run \<name> | Run a macro in the local configuration file
publish \<id> \<files> | Publish the `tar+gzip` files to the remote server
compile \<folders> | Compile the folders into `tar+gzip` files

### From javascript

```javascript
var monkkey = require('monkkey');

monkey.<command>(<args>);
```

Function | Description
------------ | -------------
update([options: Object]) | compile + publish
publish(url: String, filePath: String, [options: Object]) | Publish a compiled file to a remote server
compile([folders: Array], [options: Object]) | check + Compile the current folder or the specified folders

#### Compile([folders: Array], [options: Object]) : void

Compile a folder into a Monkkey executable file.

Behind the scene, it :
* reads and check the `monkkey.json` file of the folder
* check if all files registered exist
* gather required files
* compress them into a `tar+gzip` file

The gathering and the compression are made in a temporary folder.

```javascript
var options = {
    start: (info) => console.log(' [ ] ' + info.folder + ' : Compressing...'),
    success: (info) => {
        console.log(' [o] ' + info.folder + ' : Files compressed at :');
        console.log('     ' + info.destination);
    },
    error: (e, info) => console.error(' [!] ' + info.folder + ' : An error occured : ' + e)
};

// Compile the current folder :
monkkey.compile(options);

// Compile the specified folders :
monkkey.compile([
    'exo1', 'exo2', '/home/user/exo3', //...
], options);
```


#### Publish(url: String, filePath: String, [options: Object]) : void

Publish a file to the remote server.

Behind the scene it :
* **doesn't** check the content of the file
* send the compressed files to the server

```javascript
monkkey.publish('http://domain/exo/4', '/home/user/exo4.tar.gz', {
    start: o => console.log(' [ ] ' + o.config.url + ' - updating...'),
    success: o => console.log(' [o] ' + o.config.url + ' - updated.'),
    error: (o, e) => console.error(' [!] ' + o.config.url + ' - error : ' + e),
});
```


#### Update([options: Object]) : void

Update an exercice or a whole project and publish it to the remote server.

Behind the scene it :
* reads and check the `monkkey.json` file of the folder
* check if all files registered exist
* gather required files
* compress them into a `tar+gzip` file
* send the compressed files to the server

```javascript
monkkey.update({
    // Errors of compression / compilation
    compressionErrors: function(es)
    {
        console.error(' [!] ' + es.length + ' error(s) :');
        es.forEach(function(o) {
            console.error('     @' + o.source + ' : ' + o.error);
        });
    },
    // Push options, corresponding to the publishing to the server
    push: {
        start: o => console.log(' [ ] ' + o.config.url + ' - updating...'),
        success: o => console.log(' [o] ' + o.config.url + ' - updated.'),
        error: (o, e) => console.error(' [!] ' + o.config.url + ' - error : ' + e),
    }
});

// Light version
monkkey.update(function(o, error) {
    if(error)
        console.error(error);
    else
        console.log(o);
});
```



