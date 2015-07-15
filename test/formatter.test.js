'use strict';
require( 'should' );

describe( 'Formatter', function() {
	var Formatter = require( '../src/formatter' ),
		formatter,
		LANG_TAG = 'en';

	beforeEach( function() {
		formatter = new Formatter( LANG_TAG );
	} );

	it( 'is able to pass sanity test', function() {
		var input = "This is a string";

		var output = formatter.format( input );
		output.should.equal( input );
	} );

	it( 'replaces placeholders in a string', function() {
		var input = "There once was a man named {name}, who lived in a {place}";
		var params = {
			'name': 'Joe',
			'place': 'shoe'
		};
		var expectedOutput = "There once was a man named Joe, who lived in a shoe";

		var output = formatter.format( input, params );
		output.should.equal( expectedOutput );
	} );

	it( 'works with languages other than English', function() {
		var formatter = new Formatter( 'fr-CA' );

		var input = "Ceci n'est pas une chaîne, mais c'est un {object}!";
		var params = {
			'object': 'piece de code'
		};
		var expectedOutput = "Ceci n'est pas une chaîne, mais c'est un piece de code!";

		var output = formatter.format( input, params );
		output.should.equal( expectedOutput );
	} );

	it( 'is able to handle unicode characters in input & params', function() {
		var input = "¡s????????? ?po??un {uo??????p} ???? un? ??os ???? s,???";
		var params = {
			'uo??????p': 'u?op ?p?sdn'
		};
		var expectedOutput = "¡s????????? ?po??un u?op ?p?sdn ???? un? ??os ???? s,???";

		var output = formatter.format( input, params );
		output.should.equal( expectedOutput );
	} );

	[
		{ count: 0, expected: "There are no babies in the bucket." },
		{ count: 1, expected: "There is one baby in the bucket." },
		{ count: 2, expected: "There is a pair of babies in the bucket." },
		{ count: 3, expected: "There are 3 babies in the bucket." },
		{ count: 4, expected: "There are 4 babies in the bucket." }
	].forEach( function( testCase ) {

		it( 'does correct pluralization for ' + testCase.count + ' objects', function() {
			var expectedOutput = testCase.expected;

			// Create the inner 'object' string, since MessageFormat doesn't
			// seem to process variables in parameters.
			var object = "{num_objs, plural, " +
							 "one {baby}" +
							 "other {babies}" +
						 "}";
			var params = {
				'object': object,
				'num_objs': testCase.count
			};
			object = formatter.format( object, params );

			// Create our main plural
			var input = "There {num_objs, plural, " +
							"=0 {are no}" +
							"=1 {is one}" +
							"=2 {is a pair of}" +
							"other {are #}" +
						"} {object} in the bucket.";

			params = {
				'object': object,
				'num_objs': testCase.count
			};

			var output = formatter.format( input, params );
			output.should.equal( expectedOutput );
		} );
	} );

	[
		{ gender: 'male', expected: 'His dog likes to play fetch' },
		{ gender: 'female', expected: 'Her dog likes to play fetch' },
		{ gender: 'neither', expected: 'Their dog likes to play fetch' },
		{ gender: 'both', expected: 'Their dog likes to play fetch' }
	].forEach( function( testCase ) {
		it( 'does correct gender selection for "' + testCase.gender + '"', function() {
			var expectedOutput = testCase.expected;

			var input = "{genderOfOwner, select, " +
							"male {His}" +
							"female {Her}" +
							"other {Their}" +
						"} dog likes to play fetch";
			var params = {
				'genderOfOwner': testCase.gender
			};

			var output = formatter.format( input, params );
			output.should.equal( expectedOutput );
		} );
	} );

} );
