'use strict';
var mockery = require( 'mockery' ),
	Q = require( 'q' );

require( 'should' );

describe( 'LangPackLoader', function() {

	var langPackLoader,
		OPTIONS,
		LANG_PACK;;

	before( function() {
		mockery.enable( {
			warnOnUnregistered: false
		} );
		mockery.registerMock( './src/loader', loader );
	} );

	beforeEach( function() {
		// "Static" data
		OPTIONS = {
			langTag: 'fr-CA',
			shortLangTag: 'fr',
			defaultLangTag: 'en'
		};

		LANG_PACK = {
			'en': {
				greeting: {
					'hello': 'Hello in English'
				}
			},
			'fr-CA': {
				greeting: {
					'hello': 'Bonjour!'
				}
			}
		};

		// Create the loader
		var LangPackLoader = require( '../index' );
		langPackLoader = new LangPackLoader( OPTIONS );
	} );

	it( 'is able to pass sanity test', function( done ) {
		langPackLoader.loadLangPack()
			.then( function( langPack ) {
				langPack.should.not.be.null()
					.and.equal( LANG_PACK[OPTIONS.langTag] );

				langPackLoader.LangPack.should.equal( langPack );

				done();
			} ).catch( function( err ) {
				done( err );
			} );
	} );



	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

	/***** Mocks *****/
	var loader = {
		loadLangPack: function( options ) {
			var deferred = Q.defer();

			var pack = LANG_PACK[OPTIONS.langTag]
				|| LANG_PACK[OPTIONS.shortLangTag]
				|| LANG_PACK[OPTIONS.defaultLangTag];
			if( pack ) {
				deferred.resolve( pack );
			} else {
				deferred.reject( 'Could not locate lang pack' );
			}

			return deferred.promise;
		}
	};
} );