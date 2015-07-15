// ./superagent-mock-config.js file
module.exports = generateConfig;

function generateConfig( options, langPack ) {

	var pattern = options.languageFileRootUrl + '/([a-z]{2}([-_][A-Z]{2})?)[.]json';

	return [{
		/**
		 * regular expression of URL
		 */
		pattern: pattern,

		/**
		 * returns the data
		 *
		 * @param match array Result of the resolution of the regular expression
		 * @param params object sent by 'send' function
		 */
		fixtures: function( match, params ) {
			var langCode = match[1];

			return langPack[langCode];
		},

		/**
		 * returns the result of the request
		 *
		 * @param match {array} - Result of the resolution of the regular expression
		 * @param data {object} - Data returns by `fixtures` attribute
		 */
		callback: function( match, data ) {
			if( data ) {
				return {
					body: data,
					ok: true
				};
			}

			return {
				ok: false,
				error: 'File not found: ' + match[0]
			};
		}
	}, {
		pattern: '(?!' + pattern + ')',

		fixtures: function( match, params ) {
			console.log( pattern );
			console.log( match[0] );
			return null;
		},

		callback: function( match, data ) {
			return {
				ok: false,
				error: 'File not found 2: ' + match[0]
			};
		}
	}];
}