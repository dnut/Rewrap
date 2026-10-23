# Contributing to Rewrap Revived

This guide covers the development workflow for building, testing, and publishing
the Rewrap Revived project. Rewrap Revived has three main components: an F# core
(compiled to JS via Fable), a VSCode extension (TypeScript + Parcel), and a
Visual Studio extension (C#).

## Dependencies

Install `nix` with flake support, and run this command to get a dev shell with
all the dependencies installed:

```sh
nix develop
```

Alternatively, you can install all the dependencies manually. See flake.nix for
a comprehensive list. These are the most important ones:

| Tool     | Version               | Notes                 |
| -------- | --------------------- | --------------------- |
| .NET SDK | 10.0+                 | Required for Fable 5  |
| Node.js  | 24.11+ (26 in Nix)    | Required for Babel 8  |
| npm      | Included with Node.js |                       |
| Python   | 3.8+                  | Runs the build script |

## Project Structure

| Path      | Purpose                                            |
| --------- | -------------------------------------------------- |
| `core/`   | F# wrapping logic, compiled to JS via Fable        |
| `vscode/` | VSCode extension — TypeScript, bundled with Parcel |
| `vs/`     | Visual Studio extension — C#                       |
| `docs/`   | MkDocs documentation site + spec/test files        |
| `./do`    | Build orchestrator (Python, stdlib only)           |

## The `./do` CLI

All development operations go through `./do`. Run `./do --help`
or `./do <subcommand> --help` for usage.

| Command                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `./do clean`           | Remove build artifacts                                 |
| `./do build`           | Development build (Fable + Parcel)                     |
| `./do test`            | Build then run core + VSCode tests                     |
| `./do package`         | Production build, create `dist/rewrap-revived-\*.vsix` |
| `./do publish`         | Production build, publish to VS Code Marketplace       |
| `./do version [X.Y.Z]` | Print or set the version across project files          |

**Flags** (apply to `build` and `test`):

- `--release` — production-mode bundles, ESLint, no source maps. Implied by
  `package` and `publish`.
- `--watch` — run Fable / tsc / Parcel in watch mode. Ctrl-C exits cleanly.

**Component targeting**: `build`, `test`, and `clean` accept an optional
positional `core` or `vscode` to limit to one component:

```sh
./do build core      # Only build the F# core
./do build vscode    # Only build the VSCode extension
./do test core       # Only run core tests
```

Each command also accepts `-v` / `--verbose`.

## Building

### Quick Start

```sh
./do build
```

This builds both core and vscode. On first run it restores dotnet tools and npm
dependencies automatically.

### What Happens

**Core** (F# via Fable):

1. `dotnet tool restore` and `dotnet restore` (if needed)
2. `dotnet fable` — transpiles F# to JavaScript in `core/dist/dev/`

**VSCode extension** (TypeScript + Parcel):

1. `npm install` in `vscode/` and at the repo root (if needed)
2. `tsc` type-check (no emit)
3. Parcel bundles to `vscode/dist/Extension.node.js`

The script uses mtime checks to skip steps whose outputs are already up to date.

### Production Build

```sh
./do build --release
```

Adds ESLint, removes source maps, produces optimized bundles. Combined with
`test`, this is equivalent to what CI runs:

```sh
./do test --release
```

### Visual Studio Extension

The VS extension uses the F# Core project directly (not Fable). Open
`Rewrap.sln` in Visual Studio and build `vs/VS.csproj`.

## Testing

### Run All Tests

```sh
./do test
```

This builds first, then runs both core spec tests and VSCode integration tests.

### Core Spec Tests

```sh
./do test core
```

The core tests use a spec-as-test system: markdown files in `docs/specs/`
contain input/expected-output pairs that double as feature documentation. The
test runner parses these files and validates wrapping behavior.

See [Specs](specs/README.md) for the full test format documentation.

To isolate a single test for debugging, add `<only>` to any line of that test.
Remove it before committing.

### VSCode Integration Tests

```sh
./do test vscode
```

Uses `@vscode/test-electron` to launch a real VSCode instance and run
assertions against the VSCode API (settings resolution, basic wrapping).

!!! warning
    Integration tests **cannot** run from inside VSCode's integrated terminal.
    The script detects this and skips with a warning. Run from an external
    terminal instead — or use `xvfb-run`, which works inside a VSCode terminal:

```sh
xvfb-run ./do test vscode
```

## Manual Testing in VSCode

1. Open the Rewrap Revived project in VSCode.
2. In the **Run and Debug** panel, select the **"Extension"** launch
   configuration.
3. Press **F5** — a new Extension Development Host window opens with Rewrap
   loaded.
4. Test wrapping with `Alt+Q` in a comment block.

All launch configurations run a build pre-launch task automatically.

**Available launch configurations:**

| Configuration   | Purpose                                         |
| --------------- | ----------------------------------------------- |
| Extension       | Manual e2e testing in a dev VSCode window       |
| Web Extension   | Test as a web/browser extension                 |
| Core Tests      | Debug core spec tests with breakpoints          |
| Extension Tests | Debug VSCode integration tests with breakpoints |

## Watch Mode

```sh
./do build --watch
```

Runs three concurrent watchers for fast feedback during development:

- **Fable** — rebuilds core and auto-runs core tests on F# changes
- **TypeScript** — continuous type-checking
- **Parcel** — continuous VSCode extension bundling

Ctrl-C stops all watchers cleanly.

After starting watch mode, press F5 in VSCode to launch the Extension
Development Host. Changes rebuild automatically; reload the dev host window to
pick them up.

## Packaging & Publishing

### Create a VSIX Package

```sh
./do package
```

Runs a production build and outputs `dist/Rewrap-VSCode.vsix`.

### Publish to the Marketplace

```sh
./do publish
```

Runs a production build and publishes via `vsce publish`. Uses whatever
credentials `vsce` already has configured (`vsce login <publisher>` or the
`VSCE_PAT` environment variable).

### Versioning

```sh
./do version            # print current version
./do version 1.18.0     # set version
```

Even major version = stable release, odd major version = pre-release. Version
is stored in `vscode/package.json` and synced to
`vs/source.extension.vsixmanifest` and `README.md`.

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs on every push and pull
request:

```sh
./do test --release
```

This performs a full production build and runs all tests. Integration tests run
under xvfb to provide a virtual display for the VSCode instance.
