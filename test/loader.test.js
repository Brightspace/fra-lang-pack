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

	/******* MessageFormat Locale File Tests *******/

	it( 'loads MessageFormat locale files from URL when running in a browser', function( done ) {
		global.window = {}; // Make the loader think we're running in a browser
		var requireSpy = sinon.spy();
		var localeFileUrl = OPTIONS.localeFileRootUrl + '/' + OPTIONS.shortLangTag + '.js';
		defineRequireJsModule( localeFileUrl, requireSpy );

		loadLangPack( done, function( langPack ) {
			langPack.should.not.be.null();
			requireSpy.should.be.called();

			requireSpy.called.should.be.true(
				"RequireJS should have been used to load MessageFormat locale file from "
				+ localeFileUrl
			);
		} );
	} );

	it( 'errors if no MessageFormat locale URL when running in a browser', function( done ) {
		global.window = {}; // Make the loader think we're running in a browser
		delete OPTIONS.localeFileRootUrl;

		loader.loadLangPack( OPTIONS )
			.then(
				function success() {
					var error = new Error( "Expected an error to have occurred" );
					done( error );
				},
				function onError() {
					done();
				}
			);
	} );

	it( 'does not load MessageFormat locale files when running in node', function( done ) {
		delete global.window; // Make the loader think we're running in node
		var requireSpy = sinon.spy();
		var localeFileUrl = OPTIONS.localeFileRootUrl + '/' + OPTIONS.shortLangTag + '.js';
		var defaultFileUrl = OPTIONS.localeFileRootUrl + '/' + OPTIONS.defaultLangTag + '.js';
		defineRequireJsModule( localeFileUrl, requireSpy );
		defineRequireJsModule( defaultFileUrl, requireSpy );

		loadLangPack( done, function( langPack ) {
			langPack.should.not.be.null();
			requireSpy.should.not.be.called();
		} );
	} );

	it( 'assigns MessageFormat to window object for locale files to use', function( done ) {
		global.window = {};
		var MessageFormat = require( 'messageformat' );
		var localeFileUrl = OPTIONS.localeFileRootUrl + '/' + OPTIONS.shortLangTag + '.js';
		defineRequireJsModule( localeFileUrl );

		loadLangPack( done, function() {
			global.window.MessageFormat.should.not.be.null()
				.and.equal( MessageFormat );
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
