{
  description = "Description for the project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      perSystem =
        let
          pkg-name = "tree-sitter-renpy";
        in
        { config, pkgs, ... }:
        {
          packages.default = config.packages.${pkg-name};

          packages.${pkg-name} = pkgs.callPackage ./package.nix { };

          checks.${pkg-name} = pkgs.callPackage ./test.nix {
            ${pkg-name} = config.packages.${pkg-name};
          };
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              tree-sitter
              nodejs
            ];
          };
        };
    };
}
