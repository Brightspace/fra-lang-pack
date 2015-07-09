'use strict';
(function createLangPackLoader() {
	var define = require( 'define' ),
		Q = require( 'q' ),
		requirejs = require( 'requirejs' ),
		MessageFormat = require( 'messageformat' );

	exports.loadLangPack = loadLangPack;

	/**
	 * Load the lang pack
	 *
	 * @param {string} langTag - The lang tag to load everything for (eg: 'fr-US')
	 * @param {string} languageFileRootUrl - URL to the directory containing the JSON
	 *        language files.
	 * @param {string} [superagentUrl] - URL to fetch Superagent from.
	 *        If null the NPM package will be used instead.
	 * @param {string} [localeFileRootUrl] - URL to the directory containing MessageFormat locale
	 *        files. Optional if being used in Node.
	 * @param {string} [defaultLangTag=en]    Fall back language if the desired one can't be loaded.
	 * @returns {promise}
	 */
	function loadLangPack(
		langTag,
		languageFileRootUrl,
		superagentUrl,
		localeFileRootUrl,
		defaultLangTag
	) {
		defaultLangTag = defaultLangTag || 'en';

		var superagent,
			shortLangTag = langTag.replace( /[_-].*/, '' );

		return getMessageFormatLocales()
			.then( getSuperAgent )
			.then( getLanguageFile() );

		function getMessageFormatLocales() {
			return loadMessageFormatLocales(
				localeFileRootUrl,
				shortLangTag
			);
		}

		function getSuperAgent() {
			return loadSuperAgent( superagentUrl )
				.then( function( sa ) {
					superagent = sa;
				} );
		}

		function getLanguageFile() {
			return loadLanguageFile(
				langTag,
				shortLangTag,
				defaultLangTag,
				languageFileRootUrl,
				superagent
			);
		}
	}

	/**
	 * Load superagent, if possible from an external resource
	 * @param {string} superagentUrl - URL to fetch Superagent from.
	 *        If null, use the NPM package.
	 * @returns {promise}
	 */
	function loadSuperAgent(
		superagentUrl
	) {
		var deferred = Q.defer();

		if( superagentUrl ) {
			requirejs(
				[superagentUrl],
				function superagentLoadSuccess( superagent ) {
					deferred.resolve( superagent );
				},
				function superagentLoadError( err ) {
					deferred.reject( err );
				}
			);
		} else {
			var superagent = require( 'superagent' );
			deferred.resolve( superagent );
		}

		return deferred.promise;
	}

	/**
	 * Load the required locale file for MessageFormat
	 * @param {string} shortLangTag - Short-form of the lang tag (eg: 'en')
	 * @param {string} localeFileRootUrl - URL to the directory containing the locale files
	 * @returns {promise}
	 */
	function loadMessageFormatLocales(
		shortLangTag,
		localeFileRootUrl
	) {
		var deferred = Q.defer(),
			isNode = ( typeof window === 'undefined' );

		if( isNode ) {
			// MessageFormat can load them itself if running in node
			deferred.resolve();
		} else if( !localeFileRootUrl ) {
			deferred.reject(
				'Must specify a root directory for MessageFormat locale ' +
				'files if running in a browser'
			);
		} else {
			window.MessageFormat = MessageFormat; // required for locale files to operate on

			var path = localeFileRootUrl + '/' + shortLangTag + '.js';
			requirejs(
				[path],
				function localeFileLoadSuccess() {
					deferred.resolve();
				},
				function localeFileLoadError( err ) {
					deferred.reject( err );
				}
			)
		}

		return deferred.promise;
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
		var deferred = Q.defer();

		var pathsToTry = getPathsToTry();
		var path = pathsToTry.shift();
		superagent.get( path )
			.use( corsProxy )
			.end( handleLoad );

		return deferred.promise;

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

			function getPath( langTag ) {
				return languageFileRootUrl + '/' + langTag + '.json';
			}
		}

		function handleLoad( err, res ) {
			if( err || !res.ok ) {
				var path = pathsToTry.shift();

				if( path ) {
					superagent.get( path )
						.use( corsProxy )
						.end( handleLang );
				} else {
					console.error( 'Could not load language file' );
					deferred.reject( err || res.error );
				}
			} else {
				deferred.resolve( res.body );
			}
		}
	}
})();
