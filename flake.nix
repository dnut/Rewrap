{
  description = "Development shell for Rewrap Revived";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems =
        f:
        nixpkgs.lib.genAttrs
          [
            "x86_64-linux"
            "aarch64-linux"
            "x86_64-darwin"
            "aarch64-darwin"
          ]
          (
            system:
            let
              pkgs = import nixpkgs {
                inherit system;
                # VS Code is used to run the vscode tests
                config.allowUnfreePredicate = pkg: nixpkgs.lib.getName pkg == "vscode";
              };
            in
            f pkgs
          );
    in
    {
      formatter = forAllSystems (pkgs: pkgs.nixfmt);
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            dotnet-sdk_10
            nodejs_26
            (python3.withPackages (
              ps: with ps; [
                mkdocs
                mkdocs-material
                pymdown-extensions
              ]
            ))
            vsce
            xvfb-run
          ];

          VSCODE_TEST_EXECUTABLE =
            if pkgs.stdenv.isDarwin then
              "${pkgs.vscode}/Applications/${pkgs.vscode.longName}.app/Contents/MacOS/Code"
            else
              "${pkgs.vscode}/lib/vscode/code";

          shellHook = ''
            cat <<EOF

            Rewrap Revived Dev Shell

                dotnet $(dotnet --version)
                node   $(node --version)
                npm    $(npm --version)
                python $(python3 --version | awk '{print $2}')
                mkdocs $(mkdocs --version | awk '{print $3}')
                vsce   $(vsce --version)
                xvfb   ${pkgs.xorg-server.version}

            EOF
          '';
        };
      });
    };
}
