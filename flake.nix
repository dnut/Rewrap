{
  description = "Development shell for Rewrap Revived";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";

  outputs = { nixpkgs, ... }:
    let
      systems =
        [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      formatter = forAllSystems
        (system: let pkgs = import nixpkgs { inherit system; }; in pkgs.nixfmt);

      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };

          # These libs are vscode dependencies provided for running the vscode tests.
          # To identify missing libraries:
          # > nix develop -ic ldd .obj/vscode-test/vscode-linux-x64-1.121.0/VSCode-linux-x64/code | grep found
          vscodeRuntimeLibs = with pkgs;
            lib.optionals stdenv.isLinux [
              alsa-lib
              at-spi2-core
              atk
              cairo
              dbus
              expat
              glib
              gtk3
              libxkbcommon
              mesa
              nspr
              nss
              pango
              systemd
              xorg.libX11
              xorg.libXcomposite
              xorg.libXdamage
              xorg.libXext
              xorg.libXfixes
              xorg.libXrandr
              xorg.libxcb
            ];
        in {
          default = pkgs.mkShell {
            packages = with pkgs; [ dotnet-sdk_6 nodejs_21 xvfb-run ];
            shellHook = ''
              export LD_LIBRARY_PATH=${
                pkgs.lib.makeLibraryPath vscodeRuntimeLibs
              }:$LD_LIBRARY_PATH
              cat <<EOF

              Rewrap Revived Dev Shell

                  dotnet $(dotnet --version)
                  node.js $(node --version)
                  npm $(npm --version)
              EOF
              ./do
            '';
          };
        });
    };
}
