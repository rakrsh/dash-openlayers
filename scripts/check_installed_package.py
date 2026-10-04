#!/usr/bin/env python3
"""Check installed distribution metadata and bundled Dash assets."""

from __future__ import annotations

from importlib.metadata import version
from pathlib import Path

import dash_openlayers


def main() -> None:
    installed_version = version("dash-openlayers")
    if dash_openlayers.__version__ != installed_version:
        raise SystemExit(
            f"Runtime version {dash_openlayers.__version__} does not match "
            f"distribution metadata {installed_version}"
        )

    assets = [item["relative_package_path"] for item in dash_openlayers.Map._js_dist]
    if assets != ["dash_openlayers.umd.js"]:
        raise SystemExit(f"Unexpected Dash JavaScript assets: {assets}")
    if not (Path(dash_openlayers.__file__).parent / assets[0]).is_file():
        raise SystemExit(f"Installed Dash bundle is missing: {assets[0]}")

    print(f"Installed dash-openlayers {installed_version} with its UMD bundle")


if __name__ == "__main__":
    main()
