#!/usr/bin/env python3
"""Generate the public API reference from the checked-in Dash metadata."""

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METADATA_PATH = ROOT / "dash_openlayers" / "metadata.json"
OUTPUT_PATH = ROOT / "docs" / "api.md"


def type_name(specification):
    name = specification.get("name", "any")
    if name in {"bool", "boolean"}:
        return "bool"
    if name == "arrayOf":
        return f"list[{type_name(specification.get('value', {}))}]"
    if name == "union":
        return " | ".join(type_name(option) for option in specification.get("value", []))
    if name == "enum":
        return " | ".join(option.get("value", "") for option in specification.get("value", []))
    if name == "shape":
        return "dict"
    return {
        "func": "callback",
        "node": "Dash component",
        "object": "dict",
    }.get(name, name)


def markdown_cell(value):
    return " ".join(str(value or "").split()).replace("|", "\\|")


def render_api(metadata):
    sections = [
        "# API Reference",
        "",
        "This reference is generated from the component metadata used to build "
        "the Python wrappers.",
        "For runnable examples, see the [usage guide](usage.md).",
    ]
    components = sorted(metadata.items(), key=lambda item: Path(item[0]).name)
    for source, component in components:
        component_name = Path(source).name.removesuffix(".react.js")
        sections.extend(["", f"## `{component_name}`", ""])
        if component.get("description"):
            sections.extend([markdown_cell(component["description"]), ""])
        sections.extend(
            [
                "| Prop | Type | Default | Description |",
                "| --- | --- | --- | --- |",
            ]
        )
        for name, prop in component.get("props", {}).items():
            if name == "setProps":
                continue
            default = prop.get("defaultValue", {}).get("value", "")
            default = f"`{markdown_cell(default)}`" if default else "—"
            sections.append(
                "| `{}` | `{}` | {} | {} |".format(
                    name,
                    markdown_cell(type_name(prop.get("type", {}))),
                    default,
                    markdown_cell(prop.get("description", "")),
                )
            )
    return "\n".join(sections) + "\n"


def main():
    os.chdir(ROOT)
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    OUTPUT_PATH.write_text(render_api(metadata), encoding="utf-8")


if __name__ == "__main__":
    main()
