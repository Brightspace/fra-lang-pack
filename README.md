# Free-Range App Langpack Loader

[![Build Status](https://travis-ci.org/Brightspace/fra-lang-pack.svg?branch=master)](https://travis-ci.org/Brightspace/fra-lang-pack)

This is a project to help you with two things when developing a Free-Range App:

- Aid in loading language files, returning promises so you can delay loading the rest of your app
  until your translations are available
- Providing a thin wrapper around [MessageFormat][messageFormat] for your app to use to do replacements in display
  strings formatted according to the [ICU string formatting standard][icu].

## Language File Loader

The main function for this is `loadLangPack()`, which will use the provided
[options](#loader-options) to fetch a JSON file of the appropriate language, with a fallback path
if the requested file can't be found.

**Example usage:**

```JavaScript
var fraLangPack = require( 'fra-lang-pack' );
fraLangPack.loadLangPack( {
    langTag: 'en-CA',
    languageFileRootUrl: 'https://s.brightspace.com/apps/your-app/lang',
    superagentUrl: 'https://s.brightspace.com/lib/superagent/1.2.0/superagent.js'
} ).then( function( langPack ) {
    // Start your app
} );
```

### Language Fallback

If, for whatever reason, a language file can't be loaded, there is a fallback to other languages
before giving up. Assuming you specified a lang tag of `fr-CA`, it would work like this:

- Attempt to load `fr-CA.json` from the directory specified by `languageFileRoot`
- If that fails, attempt to load `fr.json`
- If that fails, attempt to load `en.json` (or what was specified by `defaultLangTag`)
- If that fails, reject the promise

### Loader Options

| Name                    | Required   | Description                                                                                                |
|-------------------------|------------|------------------------------------------------------------------------------------------------------------|
| **langTag**             | yes        | The lang tag to load everything for (eg: 'fr-US'). The desired JSON file must match this. eg: `fr-US.json` |
| **languageFileRootUrl** | yes        | URL to the directory containing the JSON language files                                                    |
| **superagentUrl**       | yes        | URL to fetch Superagent from. If null the NPM package will be used instead.                                |
| **defaultLangTag**      | no         | Fall-back language if the desired one can't be loaded **(defaults to `en`)**                               |

### Superagent

This library depends on SuperAgent (tested with `^1.2.0` and `^2.0.0`), but to keep the bundle size down it does not
include it directly. You are **required** to either pass the `superagentUrl` option, or someone make it available to
RequireJS with the name `superagent`.

## Formatter

The Formatter is a wrapper around MessageFormat, with the [Language File Loader](#language-file-loader)
loading the locale files for you.

**Example usage:**
(note: this requires that the locale files have already been loaded)
 
```JavaScript
var fraLangPack = require( 'fra-lang-pack' );
var formatter = new fraLangPack.Formatter( 'fr' );

var formattedString = formatter.format(
    "Hello {name}, my name is {me}",
    { name: 'World', me: 'Sam' }
);
console.log( formattedString ); // outputs "Hello World, my name is Sam"
```

<!-- Links to external resources -->
[messageFormat]: https://www.npmjs.com/package/messageformat
[icu]: http://userguide.icu-project.org/formatparse/messages
