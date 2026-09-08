#!/usr/bin/env python3
"""Copy the explicit static-site allowlist; no templating or asset conversion.

Usage: python scripts/build-site.py [--output PATH]
Only the repository's own _site directory may be replaced. Other output paths
must be new or empty, and must be outside the source tree.
"""
import argparse
from pathlib import Path
import shutil
import sys

from site_files import ROOT_FILES, SITE_DIRS, excluded

ROOT = Path(__file__).resolve().parents[1]


def build(output):
    raw_output = output.absolute()
    if raw_output.is_symlink() or (hasattr(raw_output, "is_junction") and raw_output.is_junction()):
        raise ValueError("Output must not be a symbolic link or junction")
    output = raw_output.resolve()
    default_output = ROOT / "_site"
    if output == ROOT or output in ROOT.parents:
        raise ValueError("Output must not be the repository or any of its ancestors")
    if output.is_relative_to(ROOT) and output != default_output:
        raise ValueError("Within the repository, only _site is an allowed output")
    if output.exists() and (not output.is_dir() or
                            (output != default_output and any(output.iterdir()))):
        raise ValueError("Custom output must be a new or empty directory")

    # Validate all sources before removing a previous build. Missing files in a
    # partial checkout are a local build failure, not proof of a live-site 404.
    sources = []
    for name in ROOT_FILES + SITE_DIRS:
        source = ROOT / name
        expected = source.is_file() if name in ROOT_FILES else source.is_dir()
        if not expected:
            raise ValueError(f"Missing publication source: {name}; complete the checkout first")
        candidates = [source] if source.is_file() else [source, *source.rglob("*")]
        for candidate in candidates:
            relative = candidate.relative_to(ROOT)
            if excluded(relative):
                continue
            if candidate.is_symlink() or (hasattr(candidate, "is_junction") and candidate.is_junction()):
                raise ValueError(f"Symbolic links/junctions are not allowed: {relative}")
            if not candidate.resolve().is_relative_to(ROOT):
                raise ValueError(f"Source escapes the repository: {relative}")
            if candidate.is_file():
                sources.append((candidate, relative))

    # The only recursive removal is this verified, fixed build directory.
    if output.exists() and output == default_output:
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)
    for source, relative in sources:
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    print(f"Built {len(sources)} static files in {output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    args = parser.parse_args()
    try:
        build(args.output)
    except (OSError, ValueError) as error:
        print(f"Build failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
