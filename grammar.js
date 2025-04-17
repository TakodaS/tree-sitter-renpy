/**
 * @file Tree-sitter parser for the Renpy language
 * @author Austen Bolitho <austen.bolitho@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "renpy",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
