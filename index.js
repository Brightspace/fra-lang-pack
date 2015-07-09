'use strict';
(function() {

	var loader = require( 'src/loader' ),
		MessageFormat = require( 'messageformat' );

	/**
	 *
	 * @param langTag
	 * @param languageFileRootUrl
	 * @param superagentUrl
	 * @param {string} [localeFileRootUrl] - URL to the directory containing MessageFormat locale
	 *        files. Optional if being used in Node.
	 * @param defaultLangTag
	 * @constructor
	 */
	function LangPack(
		langTag,
		languageFileRootUrl,
		superagentUrl,
		localeFileRootUrl,
		defaultLangTag
	) {
		var me = this;
		me.langTag = langTag;
		me.defaultLangTag = defaultLangTag;

		me._languageFileRootUrl = languageFileRootUrl;
		me._localeFileRootUrl = localeFileRootUrl;

		me.LangPack = null;
		me._formatter = null;

		this.loadLangPack = function() {
			return loader.loadLangPack(
				langTag,
				languageFileRootUrl,
				superagentUrl,
				defaultLangTag
			).then(
				function( langPack ) {
					me.LangPack = langPack;
				}
			);
		}
	}

	module.exports = LangPack;

	LangPack.prototype._initFormatter = initFormatter;

	LangPack.prototype.format = format;

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