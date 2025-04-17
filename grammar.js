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
					$.comment,
					$.string,
					// $.header,
					// $.statement,
					// $.python_block,
					// $.python_inline,
					// $.number,
				),
			),

		// block
		block: ($) => seq($._newline, $._indent, repeat1($.statement), $._dedent),

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
			prec(
				1,
				seq(
					optional(choice("init", "early")),
					optional($.number),
					"python",
					":",
					repeat1($.indented_python),
				),
			),

		indented_python: ($) => seq(/[ ]{4}/, $.python_expression),

		python_expression: (_) => token(/.*/),

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

		// Ren'Py statements
		statement: ($) =>
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
						"define",
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
						"default",
						"for",
						"use",
					),
				),
				$.identifier,
				optional(seq("=", $.python_expression)),
			),
	},
});
