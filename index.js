'use strict';
(function() {

	var loader = require( './src/loader' ),
		MessageFormat = require( 'messageformat' );

	/**
	 *
	 * @param {object} options - Options for loading lang packs
	 * @param {string} options.langTag - The lang tag to load a lang pack for (eg: 'fr-CA', 'fr')
	 * @param {string} options.languageFileRootUrl - URL to the directory containing the JSON
	 *        language files.
	 * @param {string} [options.superagentUrl] - URL to fetch Superagent from.
	 *        If null the NPM package will be used instead.
	 * @param {string} [options.localeFileRootUrl] - URL to the directory containing MessageFormat
	 *        locale files. Optional if running in Node.
	 * @param {string} [options.defaultLangTag=en] - Fall back language if the desired one can't
	 *        be loaded.
	 * @constructor
	 */
	function LangPackLoader(
		options
	) {
		var me = this;
		me.langTag = options.langTag;
		me.defaultLangTag = options.defaultLangTag;
		me.LangPack = null;

		me._options = options;
		me._languageFileRootUrl = options.languageFileRootUrl;
		me._localeFileRootUrl = options.localeFileRootUrl;
		me._superagentUrl = options.superagentUrl;

		me._formatter = null;

		this.loadLangPack = function() {
			return loader.loadLangPack(
				me.langTag,
				me._languageFileRootUrl,
				me._superagentUrl,
				me.defaultLangTag
			).then(
				function( langPack ) {
					me.LangPack = langPack;
					return langPack;
				}
			);
		}
	}

	module.exports = LangPackLoader;

	LangPackLoader.prototype._initFormatter = initFormatter;

	LangPackLoader.prototype.format = format;

	function initFormatter() {
		if( this._formatter ) {
			return;
		}

		if( !this.LangPack ) {
			throw new Error( "Cannot initialize formatter until lang pack has been loaded" );
		}

		this._formatter = new MessageFormat( this.langTag );
	}

	function format(
		langString,
		params
	) {
		if( !this._formatter ) {
			this._initFormatter();
		}

		var message = this._formatter.compile( langString );
		return message( params );
	}

})();