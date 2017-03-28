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

monkkey.update();

monkkey.check(function(isValid, errorsFound) {
    console.log('Are files valid? ', isValid);
    if(!isValid)
        console.log(errorsFounds);
})

monkkey.run(function() {
})

monkkey.publish(13828494, ['...']);

monkkey.compile(['...']);
```



