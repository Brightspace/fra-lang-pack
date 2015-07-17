'use strict';
(function langPackModule() {

	var loader = require( './src/loader' );

	module.exports = {
		loadLangPack: loader.loadLangPack,
		loadLocale: loader.loadLocale,
		Formatter: require( './src/formatter' )
	};

})();