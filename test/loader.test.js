'use strict';
var mockery = require( 'mockery' ),
	superagent = require( 'superagent' ),
	requirejs = require( 'requirejs' );

require( 'should' );

describe( 'Loader', function() {
	var loader;

	var OPTIONS = {};

	var LANG_PACK = {};


	/***** Setup *****/

	before( function() {
	} );

	beforeEach( function() {
		// "Static" data
		OPTIONS = {
			langTag: 'fr-CA',
			shortLangTag: 'fr',
			defaultLangTag: 'en',
			languageFileRootUrl: 'https://example.com/lang/root',
			superagentUrl: 'https://example.com/lib/superagent.js',
			localeFileRootUrl: 'https://example.com/lang/messageformat'
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

		// Configure mocks
		var config = require( './superagent-mock-config' )( OPTIONS, LANG_PACK );
		require( 'superagent-mock' )( superagent, config );

		mockery.enable( {
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'superagent-d2l-cors-proxy', function() {} );

		requirejs.define( OPTIONS.superagentUrl, function() {
			return superagent;
		} );

		// Load the loader
		loader = require( '../src/loader' );
	} );


	/***** Tests *****/

	it( 'is able to pass sanity check', function( done ) {
		loadLangPack( done, function() {} );
	} );

	it( 'loads the expected langpack', function( done ) {
		var expectedLangPack = LANG_PACK[OPTIONS.langTag];

		loadLangPack( done, function( langPack ) {
			langPack.should.equal( expectedLangPack );
		} );
	} );

	it( 'falls back to the expected langpack', function( done ) {
		var expectedLangPack = LANG_PACK[OPTIONS.defaultLangTag];
		delete LANG_PACK[OPTIONS.langTag];

		loadLangPack( done, function( langPack ) {
			langPack.should.equal( expectedLangPack );
		} );
	} );


	/***** Teardown *****/

	afterEach( function() {
		mockery.deregisterMock( 'superagent-d2l-cors-proxy' );
		mockery.disable();
	} );


	/***** Helper Functions *****/

	function loadLangPack( done, onComplete ) {
		loader.loadLangPack( OPTIONS )
			.then(
				function loadLangPackSuccess( langPack ) {
					onComplete( langPack );
					done();
				},
				function loadLangPackError( err ) {
					done( err || new Error( "Error occurred during load" ) );
				}
			).catch( function( err ) {
				done( err || new Error( "Error occurred during promise handling" ) );
			} );
	}

} );
