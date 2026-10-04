#!/usr/bin/env python3
"""Ensure the release tag matches every maintained package version."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import tomllib

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: check_release_metadata.py vMAJOR.MINOR.PATCH")

    tag = sys.argv[1]
    project = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    npm_package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    package_info = json.loads(
        (ROOT / "dash_openlayers" / "package-info.json").read_text(encoding="utf-8")
    )
    versions = {
        "pyproject.toml": project["project"]["version"],
        "package.json": npm_package["version"],
        "package-info.json": package_info["version"],
    }

    if len(set(versions.values())) != 1:
        details = ", ".join(f"{source}={version}" for source, version in versions.items())
        raise SystemExit(f"Release package versions do not match: {details}")

    version = next(iter(versions.values()))
    if tag != f"v{version}":
        raise SystemExit(f"Release tag {tag!r} does not match package version v{version}")

    print(f"Release metadata is consistent for {tag}")


if __name__ == "__main__":
    main()
