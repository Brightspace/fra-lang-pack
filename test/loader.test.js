'use strict';
var sinon = require( 'sinon' ),
	mockery = require( 'mockery' ),
	superagent = require( 'superagent' ),
	requirejs = require( 'requirejs' );
//Q = require( 'q' );

require( 'should' );

describe( 'Loader', function() {
	var loader;

	var options = {
		langTag: 'fr-CA',
		shortLangTag: 'fr',
		defaultLangTag: 'en',
		languageFileRootUrl: 'https://example.com/lang/root',
		superagentUrl: 'https://example.com/lib/superagent.js',
		localeFileRootUrl: 'https://example.com/lang/messageformat'
	};

	/***** Setup *****/

	before( function() {
		var config = require( './superagent-mock-config' )( options );
		require( 'superagent-mock' )( superagent, config );

		mockery.enable( {
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'superagent-d2l-cors-proxy', function() {} );
	} );

	beforeEach( function() {
		requirejs.define( options.superagentUrl, function() {
			return superagent;
		} );

		loader = require( '../src/loader' );
	} );

	/***** Tests *****/

	it( 'is able to pass sanity check', function( done ) {
		loader.loadLangPack(
				options.langTag,
				options.languageFileRootUrl,
				options.superagentUrl,
				options.localeFileRootUrl,
				options.defaultLangTag
			).then( function() {
				done();
			} );
	} );

	/***** Teardown *****/

	after( function() {
		mockery.deregisterMock( 'superagent-d2l-cors-proxy' );
		mockery.disable();
	} );

} );
