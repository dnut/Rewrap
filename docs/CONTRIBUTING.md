# Contributing to Rewrap Revived

This guide covers the development workflow for building, testing, and publishing
the Rewrap Revived project. Rewrap Revived has three main components: an F# core (compiled to JS
via Fable), a VSCode extension (TypeScript + Parcel), and a Visual Studio
extension (C#).

## Prerequisites

| Tool       | Version                           | Notes                                      |
|------------|-----------------------------------|--------------------------------------------|
| .NET SDK   | 6.0                               | Required for Fable 3.6.2. SDK 8.0 does not work. |
| Node.js    | 18+ recommended (tested up to 25) |                                            |
| npm        | Included with Node.js             |                                            |

The build script auto-runs `dotnet tool restore` (installs Fable) and
`npm install` on first build, so you don't need to install these manually.

## Project Structure

```
core/           F# wrapping logic, compiled to JS via Fable
vscode/         VSCode extension — TypeScript, bundled with Parcel
vs/             Visual Studio extension — C#
docs/           MkDocs documentation site + spec/test files
.config/do.mjs  Build orchestrator, invoked via ./do (Unix) or do.cmd (Windows)
```

## The `./do` CLI

All development operations go through the `./do` script. Run `./do` with no
arguments to see available commands.

| Command          | Description                                              |
|------------------|----------------------------------------------------------|
| `./do clean`     | Remove build artifacts                                   |
| `./do build`     | Development build (Fable + Parcel)                       |
| `./do test`      | Build then run core + VSCode tests                       |
| `./do prod`      | Production build (tests, ESLint, optimized bundle)       |
| `./do watch`     | Concurrent Fable, TypeScript, and Parcel file watchers   |
| `./do package`   | Create `.obj/Rewrap-VSCode.vsix`                         |
| `./do prepublish`| Clean build, version bump, changelog prep                |
| `./do publish`   | Package and publish to Marketplace + OpenVSX             |

Each operation implies its predecessors — `test` builds first, `prod` tests
first, `package` implies `prod`, and so on.

**Component targeting**: Commands accept `core` or `vscode` to build/test only
one component:

```sh
./do build core      # Only build the F# core
./do build vscode    # Only build the VSCode extension
./do test core       # Only run core tests
```

Pass `--verbose` or `-v` for detailed output.

## Building

### Quick Start

```sh
./do build
```

This builds both core and vscode. On first run it restores dotnet tools and npm
dependencies automatically.

### What Happens

**Core** (F# via Fable):

1. `dotnet restore` (if needed)
2. `dotnet fable` — transpiles F# to JavaScript in `core/dist/dev/`

**VSCode extension** (TypeScript + Parcel):

1. `npm install` in `vscode/` (if needed)
2. `tsc` type-check (no emit)
3. Parcel bundles to `vscode/dist/Extension.js`

### Production Build

```sh
./do prod
```

Adds ESLint, removes source maps, produces optimized bundles. This is equivalent
to what CI runs.

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
    terminal instead.

## Manual Testing in VSCode

1. Open the Rewrap Revived project in VSCode.
2. In the **Run and Debug** panel, select the **"Extension"** launch
   configuration.
3. Press **F5** — a new Extension Development Host window opens with Rewrap
   loaded.
4. Test wrapping with `Alt+Q` in a comment block.

All launch configurations run the "Build extension" pre-launch task
(`./do build vscode`) automatically.

**Available launch configurations:**

| Configuration       | Purpose                                        |
|--------------------|-------------------------------------------------|
| Extension          | Manual e2e testing in a dev VSCode window       |
| Web Extension      | Test as a web/browser extension                 |
| Core Tests         | Debug core spec tests with breakpoints          |
| Extension Tests    | Debug VSCode integration tests with breakpoints |

## Watch Mode

```sh
./do watch
```

Runs three concurrent watchers for fast feedback during development:

- **Fable** — rebuilds core and auto-runs core tests on F# changes
- **TypeScript** — continuous type-checking
- **Parcel** — continuous VSCode extension bundling

After starting watch mode, press F5 in VSCode to launch the Extension
Development Host. Changes rebuild automatically; reload the dev host window to
pick them up.

## Packaging & Publishing

### Create a VSIX Package

```sh
./do package
```

Runs a production build and outputs `.obj/Rewrap-VSCode.vsix`.

### Full Publish Workflow

1. **Prepare**: `./do prepublish` — clean build, version bump, prints
   instructions to edit `CHANGELOG.md`.
2. **Edit changelog**: Update `CHANGELOG.md` with the new version's changes.
3. **Publish**: `./do publish` — validates changes, packages, publishes to
   both the VS Code Marketplace (via `vsce`) and OpenVSX (via `ovsx`).

**Required environment variables:**

| Variable     | Purpose                    |
|-------------|----------------------------|
| `GITHUB_PAT` | GitHub releases             |
| `OVSX_PAT`   | OpenVSX publishing          |

### Versioning

Even major version = stable release, odd major version = pre-release. Version is
stored in `vscode/package.json` and synced to `vs/source.extension.vsixmanifest`
and `README.md` during prepublish.

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs on every push and pull
request:

```
./do build test --production
```

This performs a full production build and runs all tests. Integration tests run
under xvfb to provide a virtual display for the VSCode instance.

To reproduce CI locally:

```sh
./do prod
```
