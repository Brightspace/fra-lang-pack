'use strict';
(function createLangTermFormatter() {
	var MessageFormat = require( 'messageformat' );

	module.exports = Formatter;

	/**
	 * Perform placeholder replacements in strings following the
	 * [ICU string formatting standard]{@link http://userguide.icu-project.org/formatparse/messages}.
	 *
	 * Uses MessageFormat in the background, and requires that the appropriate locale files have
	 * are available. This can be accomplished by using this in NodeJS, or by loading them using
	 * {@link loadLocale}
	 *
	 * @param {string} [langTag='en'] The language code to use
	 * @constructor
	 */
	function Formatter( langTag ) {
		this.langTag = langTag || 'en';
		try {
			this._formatter = new MessageFormat( this.langTag );
		} catch( ex ) {
			console.warn( ex );
			console.warn( 'Did you load the MessageFormat locale files?' );
			this._formatter = new MessageFormat( 'en' );
		}
	}

	Formatter.prototype.format = function format(
		string,
		params
	) {
		var message = this._formatter.compile( string );
		return message( params );
	};
})();
