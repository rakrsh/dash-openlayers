#!/usr/bin/env python3
"""Generate Dash Python wrappers from the checked-in React metadata."""

from __future__ import annotations

import json
import os
from pathlib import Path

from dash.development.component_generator import generate_components

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS_DIR = ROOT / "src" / "lib" / "components"
PACKAGE_DIR = ROOT / "dash_openlayers"
METADATA_PATH = PACKAGE_DIR / "metadata.json"


def normalize_types(value):
    if isinstance(value, dict):
        if value.get("name") == "boolean":
            value["name"] = "bool"
        for child in value.values():
            normalize_types(child)
    elif isinstance(value, list):
        for child in value:
            normalize_types(child)


def main():
    os.chdir(ROOT)
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    expected_sources = {
        f"src/lib/components/{path.name}" for path in COMPONENTS_DIR.glob("*.react.js")
    }
    metadata_sources = set(metadata)
    if metadata_sources != expected_sources:
        missing = sorted(expected_sources - metadata_sources)
        stale = sorted(metadata_sources - expected_sources)
        raise SystemExit(f"Component metadata mismatch; missing={missing}, stale={stale}")

    missing_descriptions = []
    for source, component in metadata.items():
        if not component.get("description", "").strip():
            missing_descriptions.append(f"{source}: component description")
        for name, prop in component.get("props", {}).items():
            if not prop.get("description", "").strip():
                missing_descriptions.append(f"{source}: {name} description")
    if missing_descriptions:
        raise SystemExit("Missing API descriptions: " + ", ".join(missing_descriptions))

    normalize_types(metadata)
    generate_components(
        "src/lib/components",
        "dash_openlayers",
        package_info_filename="package-info.json",
        metadata=metadata,
        keep_prop_order="ALL",
    )
    METADATA_PATH.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
