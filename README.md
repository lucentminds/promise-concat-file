# promise-concat-file
NodeJs module that concatenates a list of files.

## Installation

Install by npm.

```shell
npm install git+https://github.com/lucentminds/promise-concat-file.git
```

### Useage:

```js
var concatFile = require( 'promise-concat-file' );
var cPathDestination = './temp/webwelcomer-modules.js';
var aSourcePaths = [ 
    "./modules/jquery-widgetfactory/build/jquery-widgetfactory.js",
    "./modules/util/build/util.js",
    "./modules/events/build/events.js",
    "./modules/storage/build/storage.js",
    "./modules/http/build/http.js",
    "./modules/visitor/build/visitor.js",
    "./modules/start-default/build/start-default.js",
    "./modules/invite-default/build/invite-default.js",
    "./modules/template/build/template.js",
    "./modules/actor-default/build/actor-default.js",
    "./modules/dom/build/dom.js",
    "./modules/chatbox-live/build/chatbox-live.js",
    "./modules/presentation-live/build/presentation-live.js"
];

var oOptions = {
    prependSourcePath: true,
    prependDatetime: true,
    header: '(function( window, undefined ){\n',
    footer: '\n}( window ));'
};

concat( aSourcePaths, cPathDestination,  oOptions )
.then(function( oResult ){

   console.log( 'Success!' );

})
.fail(function( err ){

    console.log( 'Oops!' );
    
});
```
