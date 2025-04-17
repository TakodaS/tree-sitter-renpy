/**
 * @file Tree-sitter parser for the Renpy language
 * @author Austen Bolitho <austen.bolitho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "renpy",

	extras: ($) => [/\s/, $.comment],

	rules: {
		source_file: ($) =>
			repeat(
				choice(
					$.header,
					$.statement,
					$.python_block,
					$.python_inline,
					$.string,
					$.number,
				),
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
				),
			),

		// Python inline: starts with '$'
		python_inline: ($) => seq("$", /.+/),

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

		indented_python: (_) => token(seq(/[ ]{4}/, /.*/)),

		python_expression: ($) => choice($.python_inline, $.python_block),

		// Identifiers (variable, label names)
		identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

		// Arguments for headers (simple for now)
		arguments: ($) =>
			seq(
				"(",
				optional(seq($.identifier, repeat(seq(",", $.identifier)))),
				")",
			),

		// Ren'Py statements
		statement: ($) =>
			choice(
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
					repeat($.identifier),
					"=",
					field("value", $.python_expression),
				),
			),
	},
});
