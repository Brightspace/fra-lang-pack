'use strict';
(function createLangPackLoader() {
	var Promise = require( 'lie' ),
		requirejs = require( 'requirejs' ),
		corsProxy = require( 'superagent-d2l-cors-proxy' );

	exports.loadLangPack = loadLangPack;

	/**
	 * Load the lang pack
	 *
	 * @param {object} options - Options
	 * @param {string} options.langTag - The lang tag to load everything for (eg: 'fr-US')
	 * @param {string} options.languageFileRootUrl - URL to the directory containing the JSON
	 *        language files.
	 * @param {string} [options.superagentUrl] - URL to fetch Superagent from.
	 *        If null the NPM package will be used instead.
	 * @param {string} [options.localeFileRootUrl] - URL to the directory containing MessageFormat
	 *        locale files. Optional if being used in Node.
	 * @param {string} [options.defaultLangTag=en] - Fall back language if the desired one can't
	 *        be loaded.
	 * @returns {promise}
	 */
	function loadLangPack(
		options
	) {
		var superagent,
			defaultLangTag = options.defaultLangTag || 'en',
			shortLangTag = options.langTag.replace( /[_-].*/, '' );

		return getSuperAgent()
			.then( getLanguageFile );

		function getSuperAgent() {
			return loadSuperAgent( options.superagentUrl )
				.then( function( sa ) {
					superagent = sa;
				} );
		}

		function getLanguageFile() {
			return loadLanguageFile(
				options.langTag,
				shortLangTag,
				defaultLangTag,
				options.languageFileRootUrl,
				superagent
			);
		}
	}

	/**
	 * Load superagent, if possible from an external resource
	 * @param {string} superagentUrl - URL to fetch Superagent from.
	 *        If null, use the NPM package.
	 * @returns {Promise}
	 */
	function loadSuperAgent(
		superagentUrl
	) {
		return new Promise( function( resolve, reject ) {
			if( superagentUrl ) {
				requirejs(
					[superagentUrl],
					function superagentLoadSuccess( superagent ) {
						resolve( superagent );
					},
					function superagentLoadError( err ) {
						reject( err );
					}
				);
			} else {
				var superagent = require( 'superagent' );
				resolve( superagent );
			}
		} );
	}

	/**
	 * {string}
	 * @param {string} fullLangTag - The full lang tag (eg: 'fr-CA')
	 * @param {string} shortLangTag - The short lang tag (eg: 'fr')
	 * @param {string} defaultLangTag - The lang tag to fall back on (eg: 'en')
	 * @param {string} languageFileRootUrl - URL to the directory containing the JSON
	 *        language files
	 * @param {superagent} superagent - Instance of superagent
	 * @returns {promise}
	 */
	function loadLanguageFile(
		fullLangTag,
		shortLangTag,
		defaultLangTag,
		languageFileRootUrl,
		superagent
	) {
		return new Promise( function( resolve, reject ) {
			var pathsToTry = getPathsToTry();
			var path = pathsToTry.shift();

			superagent.get( path )
				.use( corsProxy )
				.end( handleLoad );


			function handleLoad( err, res ) {
				if( err || !res.ok ) {
					var path = pathsToTry.shift();

					if( path ) {
						superagent.get( path )
							.use( corsProxy )
							.end( handleLoad );
					} else {
						console.error( 'Could not load language file' );
						reject( err || new Error( res.error ) );
					}
				} else {
					resolve( res.body );
				}
			}
		} );

		function getPathsToTry() {
			var pathsToTry = [
				getPath( fullLangTag )
			];

			if( shortLangTag != fullLangTag ) {
				pathsToTry.push( getPath( shortLangTag ) );
			}

			if( pathsToTry.indexOf( defaultLangTag ) == -1 ) {
				pathsToTry.push( getPath( defaultLangTag ) );
			}

			return pathsToTry;
		}

		function getPath( langTag ) {
			return languageFileRootUrl + '/' + langTag + '.json';
		}
	}
})();
