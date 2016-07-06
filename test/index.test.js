'use strict';
var mockery = require( 'mockery' );

require( 'should' );

describe( 'Module Index', function() {

	var loader = {
			loadLangPack: "This is a loader that is a string for comparisons",
			loadLocale: "This is a loader for loading locale files"
		},
		formatter = "This is a formatter that is also being used for comparisons",
		module;

	before( function() {
		mockery.enable( {
			warnOnUnregistered: false
		} );
		mockery.registerMock( './src/loader', loader );
		mockery.registerMock( './src/formatter', formatter );

		module = require( '../index' );
	} );

	it( 'exports loadLangPack() as expected', function() {
		module.loadLangPack.should.equal( loader.loadLangPack );
	} );

	it( 'exports loadLocale() as expected', function() {
		module.loadLocale.should.equal( loader.loadLocale );
	} );

	it( 'exports Formatter() as expected', function() {
		module.Formatter.should.equal( formatter );
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

} );