#!/usr/bin/env python3
"""Build, test, package, and publish the Rewrap Revived VS Code extension."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORE_TEST_PROD = "core/test/prod.js"
CORE_TEST_DEV = "core/dist/dev/Tests.js"
CORE_PROD = "core/dist/index.js"
VSCODE_MAIN = "vscode/dist/Extension.node.js"
VSIX = ".obj/rewrap-revived-{version}.vsix"


def main():
    args = parse_args()
    if not args.no_nix and shutil.which("nix") and os.getenv("IN_NIX_SHELL") is None:
        run("nix develop -c " + " ".join(sys.argv))
    else:
        os.chdir(ROOT)
        args.func(args)


def parse_args():
    parser = argparse.ArgumentParser(prog="build.py", description=__doc__)
    parser.add_argument("--no-nix", action="store_true", help="disable automatic nix invocation")
    sub = parser.add_subparsers(dest="cmd", required=True)

    component = argparse.ArgumentParser(add_help=False)
    component.add_argument(
        "component", nargs="?", choices=["core", "vscode"], help="defaults to both"
    )

    distribution = argparse.ArgumentParser(add_help=False)
    distribution.add_argument("--skip-build", action="store_true", help="skip the build step")

    mode = argparse.ArgumentParser(add_help=False)
    mode.add_argument("--release", action="store_true")
    mode.add_argument("--watch", action="store_true")

    sub.add_parser("clean", parents=[component]).set_defaults(func=clean)
    sub.add_parser("build", parents=[component, mode]).set_defaults(func=build)
    sub.add_parser("test", parents=[component, mode]).set_defaults(func=test)
    sub.add_parser("package", parents=[distribution]).set_defaults(func=package)
    sub.add_parser("publish", parents=[distribution]).set_defaults(func=publish)

    version_parser = sub.add_parser("version")
    version_parser.add_argument("version", nargs="?", help="X.Y.Z to set; omit to print current")
    version_parser.set_defaults(func=version)

    release_notes_parser = sub.add_parser("release-notes")
    release_notes_parser.add_argument(
        "version", nargs="?", help="X.Y.Z to extract; omit to use current version"
    )
    release_notes_parser.set_defaults(func=release_notes)

    args = parser.parse_args()

    # Normalize component to two booleans for downstream readability
    comp = getattr(args, "component", None)
    args.core = comp in (None, "core")
    args.vscode = comp in (None, "vscode")
    return args


# ---------- Commands ----------


def clean(args):
    if args.core:
        for d in (".obj/.net/core/bin", "core/dist"):
            rmtree(d)
        for f in (CORE_TEST_PROD, CORE_TEST_PROD + ".map"):
            unlink(f)
    if args.vscode:
        for d in ("vscode/dist", "vscode/node_modules"):
            rmtree(d)


def build(args):
    procs = []
    if args.core:
        procs += build_core(args)
    if args.vscode:
        procs += build_vscode(args)
    if args.watch and procs:
        print("Watching. Ctrl-C to stop.", flush=True)
        try:
            for pr in procs:
                pr.wait()
        except KeyboardInterrupt:
            for pr in procs:
                pr.terminate()


def test(args):
    build(args)
    if args.watch:
        return
    if args.core:
        if args.release and outdated(CORE_TEST_PROD, CORE_TEST_DEV):
            npx(args, "parcel build core/test --cache-dir .obj/parcel")
        run(f"node core/test{'/prod' if args.release else ''}")
    if args.vscode:
        if shutil.which("xvfb-run"):
            run(
                "xvfb-run node vscode/test/run.cjs",
                DISPLAY="",
                QT_IM_MODULES="",
                XDG_SESSION_TYPE="",
                XAUTHORITY="",
                WAYLAND_DISPLAY="",
                GDK_BACKEND="",
            )
        else:
            run("node vscode/test/run.cjs")


def package(args):
    if not args.skip_build:
        args.core = True
        args.vscode = True
        args.release = True
        args.watch = False
        build(args)

    shutil.copyfile("README.md", "vscode/README.md")
    readme = Path("vscode/README.md")
    readme.write_text(readme.read_text().replace(".svg", ".png"))

    version = read_version()
    pre = "" if version.is_stable() else "--pre-release"
    path = VSIX.format(version=version)

    npx(args, f"vsce package {pre} -o ../{path}", cwd="vscode")
    print(f"VSIX created at {path}", flush=True)


def publish(args):
    if not args.skip_build:
        package(args)

    version = read_version()
    pre = "" if version.is_stable() else "--pre-release"
    path = VSIX.format(version=version)

    npx(args, f"vsce publish {pre} -i {path}")
    npx(args, f"ovsx publish {pre} -i {path}")


def version(args):
    if not args.version:
        print(read_version(), flush=True)
        return
    write_version(Version.parse(args.version))
    run("npm install", cwd="vscode")


def release_notes(args):
    version_number = Version.parse(args.version) if args.version else read_version()

    changelog = Path("CHANGELOG.md").read_text()
    heading = re.search(rf"^#\s+{re.escape(str(version_number))}\s*$", changelog, re.MULTILINE)
    if not heading:
        sys.exit(f"No changelog section found for {version_number}")

    start = heading.end()
    next_heading = re.search(r"^#\s+\S", changelog[start:], re.MULTILINE)
    end = start + next_heading.start() if next_heading else len(changelog)
    notes = changelog[start:end].strip()
    if not notes:
        sys.exit(f"Changelog section for {version_number} is empty")

    with open(f"release-notes.md", "w") as f:
        f.write(notes)


# ---------- Build steps ----------


def build_core(args):
    if not Path(".obj/.net/core/project.assets.json").exists():
        run("dotnet tool restore")
        run("dotnet restore core/Core.Test.fsproj")
    fable = "core/Core.Test.fsproj -o core/dist/dev"
    if args.watch:
        return [popen(f'dotnet fable watch {fable} --runWatch "node core/test"')]
    if outdated(CORE_TEST_DEV, "core"):
        run(f"dotnet fable {fable}")
    if args.release and outdated(CORE_PROD, "core"):
        npx(args, "parcel build core --cache-dir .obj/parcel")
    return []


def build_vscode(args):
    if not Path("vscode/node_modules").exists():
        run("npm install", cwd="vscode")
    if not Path("node_modules").exists():
        run("npm install")
    if args.watch:
        return [
            popen("npx --silent tsc -w -p vscode --noEmit"),
            popen("npx --silent parcel watch vscode --cache-dir .obj/parcel"),
        ]
    if not outdated(VSCODE_MAIN, "vscode/src", "core"):
        return []
    npx(args, "tsc -p vscode --noEmit")
    if args.release:
        npx(args, "eslint vscode --ext .ts")
        npx(args, "parcel build vscode --no-source-maps --cache-dir .obj/parcel")
        unlink(VSCODE_MAIN + ".map")
    else:
        npx(args, "parcel build vscode --no-optimize --cache-dir .obj/parcel")
    return []


# ---------- Version ----------

VERSION_RE = re.compile(r'"version"\s*:\s*"([\d.]+)"', re.I)


def read_version() -> Version:
    with open("vscode/package.json") as f:
        return Version.parse(json.load(f)["version"])


def write_version(v: Version):
    sub_in_file("vscode/package.json", VERSION_RE, str(v))
    sub_in_file(
        "vs/source.extension.vsixmanifest",
        re.compile(r'Rewrap.* Version="([\d.]+)"'),
        str(v) + ".0",
    )
    if v.is_stable():
        sub_in_file("README.md", re.compile(r"version <b>([\d.]+)<"), str(v))
        # This allows the README to show the latest stable as a pre-release if it is
        # greater than the current pre-release version, since that is the version
        # that will be installed by vscode for users on the pre-release channel.
        prerelease_badge = re.compile(r"pre-release <b>([\d.]+)<")
        match = prerelease_badge.search(Path("README.md").read_text())
        if match and v > Version.parse(match.group(1)):
            sub_in_file("README.md", prerelease_badge, str(v))
    else:
        sub_in_file("README.md", re.compile(r"pre-release <b>([\d.]+)<"), str(v))


@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

    def parse(s: str) -> Version:
        """splits, validates, and converts to ints"""
        return Version(*(int(i) for i in s.split(".")))

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

    def is_stable(self: Version):
        return self.minor % 2 == 1


def sub_in_file(path, regex, replacement):
    text = Path(path).read_text()
    m = regex.search(text)
    if not m:
        return
    Path(path).write_text(text.replace(m.group(0), m.group(0).replace(m.group(1), replacement)))


# ---------- Helpers ----------


def run(cmd, cwd=None, **env):
    print(f"\n\033[34m{cwd if cwd else ''}> {cmd}\033[0m", flush=True)
    try:
        subprocess.run(cmd, shell=True, cwd=cwd, check=True, env={**os.environ, **env})
    except subprocess.CalledProcessError:
        sys.exit(1)


def npx(args, cmd, cwd=None):
    run("npx --silent " + cmd, cwd=cwd)


def popen(cmd, cwd=None):
    print(f"\n\033[34m{cwd if cwd else ''}> {cmd}\033[0m", flush=True)
    return subprocess.Popen(cmd, shell=True, cwd=cwd)


def rmtree(p):
    if Path(p).exists():
        print(f"\n\033[34m> rm -rf {p}\033[0m", flush=True)
        shutil.rmtree(p)


def unlink(p):
    if Path(p).exists():
        print(f"\n\033[34m> rm {p}\033[0m", flush=True)
        Path(p).unlink()


def outdated(target, *sources):
    """True if `target` is missing or older than the newest file directly under
    any of `sources`. For a directory source, only direct file children
    contribute to its mtime (matches the original do.mjs semantics)."""

    def last_modified(path):
        p = Path(path)
        if not p.exists():
            return float("-inf")
        if p.is_dir():
            times = [c.stat().st_mtime for c in p.iterdir() if c.is_file()]
            return max(times) if times else float("-inf")
        return p.stat().st_mtime

    src_max = max((last_modified(s) for s in sources), default=float("-inf"))
    return last_modified(target) <= src_max


if __name__ == "__main__":
    main()
