/**
 * 01-04-2017
 * NodeJs module that concatenates a list of files.
 * ~~ Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jshint undef: true, unused: true */
/* jslint node: true */
/* global JSON:false */

var fs = require( 'fs' );
var Q = require( 'q' );
var resolvePath = require( 'promise-resolve-path' );

var concat = module.exports = function( aFiles, cDest, oOptions, undefined ){
    var deferred = Q.defer();
    var cPathDest;
    var cError;
    var aPathSources;
    var throwError = function( cError ){
        deferred.reject( cError );
    };// /throwError()

    var oSettings = Object.assign({
        addSourcePath: false,
        commentBlock: [ '/**', '**/'],
        header: '',
        footer: ''
    }, oOptions );


    resolvePath( cDest )
    .then(function( cResolved ){
        cPathDest = cResolved;

        try{
            fs.writeFileSync( cPathDest, oSettings.header );
        }
        catch( e ) {
            throwError( e );
            return;
        }

        return resolvePath( aFiles, true );
        
    })
    .then(function( aResolved ){
        var i, l, aPromises = [];
        aPathSources = aResolved;

        for( i = 0, l = aPathSources.length; i < l; i++ ) {
            aPromises.push( readFile( aPathSources[ i ] ) );
        }// /for()
        
        return Q.all( aPromises );
    })
    .then( function( aResults ){
        // All read.
        var i, l, cContent;
        var dt = new Date();
        var err;        

        // Loop over each result and append it's buffer string.
        for( i = 0, l = aResults.length; i < l; i++ ) {
            cContent = '';

            if( oSettings.prependSourcePath || oSettings.prependDatetime ){
                cContent = cContent.concat( '\n', oSettings.commentBlock[ 0 ], '\n' );

                if( oSettings.prependDatetime ){
                    cContent = cContent.concat( dt, '\n' );
                }

                if( oSettings.prependSourcePath ){
                    cContent = cContent.concat( aResults[ i ].path, '\n' );
                }
                cContent = cContent.concat( oSettings.commentBlock[ 1 ], '\n' );
            }

            cContent = cContent.concat( aResults[ i ].buffer.toString( 'utf8' ) );
            err = appendFileSync( cPathDest, cContent );

            if( err ) {
                return throwError( err );
            }
        }// /for()

        if( oSettings.footer ){
            err = appendFileSync( cPathDest, oSettings.footer );

            if( err ) {
                return throwError( err );
            }
        }

       deferred.resolve({
           src: aPathSources,
           dest: cPathDest
       });
    })
    .fail( function( err ){
        // One rejected.
        console.log( 'err' );
        return throwError( err );
    });

    return deferred.promise;

};// /concat()




var readFile = function( cFilePath ){
    var deferred = Q.defer();

    fs.readFile( cFilePath, function ( err, buffer ) {
        var cContent = buffer.toString( 'utf8' );

        if ( err ){
            return deferred.reject( err );
        }

        deferred.resolve({
            path: cFilePath,
            buffer: buffer
        });
    });

    return deferred.promise;
};// /readFile()

var appendFileSync = function( cPathDest, cContent ){
    try{
        fs.appendFileSync( cPathDest, cContent );
    }
    catch( e ) {
        return e;
    }
};// /appendFileSync()


