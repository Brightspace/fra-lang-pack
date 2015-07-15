'use strict';
(function langPackModule() {

	var loader = require( './src/loader' );

	module.exports.loadLangPack = loader.loadLangPack;
	module.exports.loadLocale = loader.loadLocale;
	module.exports.Formatter = require( './src/formatter' );

})();