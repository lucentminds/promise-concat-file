/**
 * 01-04-2017
 * NodeJs module that concatenates a list of files.
 * ~~ Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jshint undef: true, unused: true */
/* jslint node: true */
/* jshint esversion: 6 */
/* eslint-env es6 */

const fs = require( 'fs' );
const Q = require( 'q' );
const resolvePath = require( 'promise-resolve-path' );

const concat = module.exports = function( aFiles, cDest, oOptions, undefined ){ // jshint ignore:line
   var deferred = Q.defer();
   var cPathDest;
   var aPathSources;
   var throwError = function( cError ){
      deferred.reject( cError );
   };// /throwError()

   var oSettings = Object.assign({
      prependSourcePath: false,
      prependDatetime: false,
      prependString: '',
      commentBlock: [ '/**', '**/'],
      commentLine: null,
      header: '',
      footer: '',
      map: null
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
   .then( function( a_results ){      
      // All read.
      var i, l, o_prom, a_prom = [];

      var after_map = function( c_result ){
         this.buffer = c_result;
      };// /after_map()

      // Loop over each result and append it's buffer string.
      for( i = 0, l = a_results.length; i < l; i++ ) {
         a_results[ i ].buffer = a_results[ i ].buffer.toString( 'utf8' );

         if( oSettings.map ) {
            o_prom = Q( oSettings.map( a_results[ i ].buffer ) )
            .then( after_map.bind( a_results[i] ) );
            a_prom.push( o_prom );
         }
      }// /for()

      return Q.all( a_prom )
      .then(function(){
         return a_results;
      });

   })
   .then( function( aResults ){
      // All ready.
      var i, l, cContent;
      var dt = new Date();
      var err;
      var c_prepend_string = oSettings.prependString;
      var c_prepend_datetime = oSettings.prependDatetime;

      // Loop over each result and append it's buffer string.
      for( i = 0, l = aResults.length; i < l; i++ ) {
         cContent = '';

         if( oSettings.prependSourcePath || c_prepend_datetime || c_prepend_string ){
            cContent = cContent.concat( '\n' );

            if( oSettings.commentBlock ) {
               cContent = cContent.concat( oSettings.commentBlock[ 0 ], '\n' );
            }

            if( c_prepend_string ){

               if( oSettings.commentLine ) {
                  cContent = cContent.concat( oSettings.commentLine );
               }

               cContent = cContent.concat( `${c_prepend_string}\n` );
               c_prepend_string = '';
            }

            if( c_prepend_datetime ){

               if( oSettings.commentLine ) {
                  cContent = cContent.concat( oSettings.commentLine );
               }

               cContent = cContent.concat( 'build time: ',  dt, '\n' );
               c_prepend_datetime = false;
            }

            if( oSettings.prependSourcePath ){

               if( oSettings.commentLine ) {
                  cContent = cContent.concat( oSettings.commentLine );
               }

               cContent = cContent.concat( 'build source: ', aResults[ i ].path, '\n' );
            }

            if( oSettings.commentBlock ) {
               cContent = cContent.concat( oSettings.commentBlock[ 1 ] );
            }

            cContent = cContent.concat( '\n' );
         }

         cContent = cContent.concat( aResults[ i ].buffer );
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
      return throwError( err );
   });

   return deferred.promise;

};// /concat()




var readFile = function( cFilePath ){
   var deferred = Q.defer();

   fs.readFile( cFilePath, function ( err, buffer ) {
      var cContent;
      
      if ( err ){
            return deferred.reject( err );
      }
      
      cContent = buffer.toString( 'utf8' );
      
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


