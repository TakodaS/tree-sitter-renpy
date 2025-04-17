/**
 * @file Tree-sitter parser for the Renpy language
 * @author Austen Bolitho <austen.bolitho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "renpy",

	extras: ($) => [
		$.comment,
		/[\s\f\uFEFF\u2060\u200B]|\r?\n/,
		// $.line_continuation,
	],
	conflicts: ($) => [[$.renpy_statement]],
	externals: ($) => [
		$._newline,
		$._indent,
		$._dedent,
		$.string_start,
		$._string_content,
		$.escape_interpolation,
		$.string_end,

		// Mark comments as external tokens so that the external scanner is always
		// invoked, even if no external token is expected. This allows for better
		// error recovery, because the external scanner can maintain the overall
		// structure by returning dedent tokens whenever a dedent occurs, even
		// if no dedent is expected.
		$.comment,

		// Allow the external scanner to check for the validity of closing brackets
		// so that it can avoid returning dedent tokens between brackets.
		"]",
		")",
		"}",
		"except",
	],
	rules: {
		source_file: ($) =>
			repeat(
				choice(
					$.header,
					$.statement,
					// $.python_block,
					// $.python_inline,
					$.comment,
					$.string,
					prec(-1, $.block),
					// prec(-1, $.python_expression),
					// $.number,
				),
			),

		// block
		block: ($) =>
			seq(
				$._newline,
				$._indent,
				repeat1(choice($.statement, prec(-1, $.python_expression))),
				$._dedent,
			),

		// Comments
		comment: (_) => token(seq("#", /.*/)),

		// Numbers
		number: (_) => token(/[+-]?\d+(\.\d+)?/),

		// Strings with escapes
		string: ($) =>
			seq(
				choice('"', "'"),
				repeat(choice(/[^"'\n\\]+/, $.escape_sequence)),
				choice('"', "'"),
			),

		escape_sequence: (_) => token(seq("\\", /['"%]/)),

		// Headers like `label start:`
		header: ($) =>
			prec(
				1,
				seq(
					field(
						"keyword",
						choice("label", "init", "early", "transform", "animate"),
					),
					optional(field("priority", $.number)),
					optional(field("identifier", $.identifier)),
					optional(field("args", $.arguments)),
					":",
					$.block,
				),
			),

		// Python inline: starts with '$'
		python_inline: ($) => seq("$", $.python_expression),

		// Python blocks
		python_block: ($) =>
			seq(
				optional(choice("init", "early")),
				optional($.number),
				"python",
				":",
				repeat1($.python_expression),
				$._dedent,
			),

		indented_python: ($) => seq(/[ ]{4}/, $.python_expression),

		python_expression: (_) => token(/[^\\\n"]+/),

		// Identifiers (variable, label names)
		identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

		// Arguments for headers (simple for now)
		arguments: ($) =>
			seq(
				"(",
				optional(seq($.identifier, repeat(seq(",", $.identifier)))),
				")",
			),

		// Renpy keywords

		statement: ($) =>
			choice($.control_statement, $.renpy_statement, $.define_statement),
		// Ren'Py statements
		renpy_statement: ($) =>
			seq(
				field(
					"keyword",
					choice(
						"transform",
						"screen",
						"image",
						"hide",
						"show",
						"scene",
						"jump",
						"menu",
						"return",
						"call",
						"if",
						"elif",
						"else",
						"play",
						"stop",
						"queue",
						"voice",
						"sustain",
						"event",
						"on",
						"pause",
						"linear",
						"ease",
						"easein",
						"easeout",
						"choice",
						"function",
						"parallel",
						"block",
						"contains",
						"time",
						"pass",
						"repeat",
						"add",
						"bar",
						"vbar",
						"button",
						"textbutton",
						"imagebutton",
						"mousearea",
						"imagemap",
						"fixed",
						"frame",
						"grid",
						"hbox",
						"vbox",
						"side",
						"window",
						"null",
						"input",
						"key",
						"timer",
						"transform",
						"viewport",
						"hotspot",
						"hotbar",
						"text",
						"has",
						"for",
						"use",
					),
				),
				repeat1(choice($.identifier, $.string)),
			),

		control_statement: ($) =>
			seq(field("keyword", choice("for", "if", "elif")), $.python_expression),
		define_statement: ($) =>
			seq(
				field("keyword", choice("define", "default")),
				$.identifier,
				"=",
				$.python_expression,
			),
	},
});
