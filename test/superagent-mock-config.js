// ./superagent-mock-config.js file
module.exports = generateConfig;

function generateConfig( options ) {
	return [{
		/**
		 * regular expression of URL
		 */
		pattern: options.languageFileRootUrl + '/([a-z]{2}([-_][A-Z]{2}))[.]json',

		/**
		 * returns the data
		 *
		 * @param match array Result of the resolution of the regular expression
		 * @param params object sent by 'send' function
		 */
		fixtures: function( match, params ) {
			console.info( "Superagent called to load language file: ", match[0] );
			return {
				term: 'Translation'
			};
		},

		/**
		 * returns the result of the request
		 *
		 * @param match array Result of the resolution of the regular expression
		 * @param data    mixed Data returns by `fixtures` attribute
		 */
		callback: function( match, data ) {
			return {
				body: data,
				ok: true
			};
		}
	}];
}