'use strict';
var mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	superagent = require( 'superagent' ),
	requirejs = require( 'requirejs' );

require( 'should' );
require( 'should-sinon' );

describe( 'Loader', function() {
	var loader,
		definedModules,
		OPTIONS = {},
		LANG_PACK = {};


	/***** Setup *****/

	before( function() {
		mockery.enable( {
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'superagent-d2l-cors-proxy', function() {} );
	} );

	beforeEach( function() {
		definedModules = [];

		// "Static" data
		OPTIONS = {
			langTag: 'fr-CA',
			shortLangTag: 'fr',
			defaultLangTag: 'en',
			languageFileRootUrl: 'https://example.com/lang/root',
			superagentUrl: 'https://example.com/lib/superagent.js'
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

		defineRequireJsModule( OPTIONS.superagentUrl, function() {
			return superagent;
		} );

		// Load the loader
		loader = require( '../src/loader' );
	} );


	/******* Basic Loading Tests *******/

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

	/******* Superagent Loading Tests *******/

	it( 'loads Superagent using RequireJS when Superagent URL is present', function( done ) {
		// If the RequireJS version isn't used, using the null require() version will cause errors
		// and fail the test.
		mockery.registerMock( 'superagent', null );

		loadLangPack( done, function( langPack ) {
			langPack.should.not.be.null();
			mockery.deregisterMock( 'superagent' );
		} );
	} );

	it( 'loads Superagent using require() when Superagent URL is not present', function( done ) {
		// Similar to above, undefining the RequireJS module will cause errors to be thrown if the
		// loader attempts to use it.
		requirejs.undef( OPTIONS.superagentUrl );
		delete OPTIONS.superagentUrl;

		loadLangPack( done, function( langPack ) {
			langPack.should.not.be.null();
		} );
	} );

	/***** Teardown *****/

	afterEach( function() {
		delete global.window;
		for( var i in definedModules ) {
			requirejs.undef( definedModules[i] );
		}
	} );

	after( function() {
		mockery.deregisterAll();
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

	function defineRequireJsModule( moduleName, func ) {
		requirejs.define( moduleName, func );
		definedModules.push( moduleName );
	}

} );
