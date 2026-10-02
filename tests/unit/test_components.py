import importlib

import dash_openlayers as dol


def test_components_exported():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "Map")
    assert hasattr(mod, "DrawInteraction")
    assert hasattr(mod, "TileLayer")
    assert hasattr(mod, "__version__")


def test_tile_layer_source_props_serialize():
    osm_layer = dol.TileLayer(id="osm", source="OSM")
    custom_layer = dol.TileLayer(
        id="custom",
        url="https://tiles.example.com/{z}/{x}/{y}.png",
    )

    assert osm_layer.to_plotly_json()["props"] == {"id": "osm", "source": "OSM"}
    assert custom_layer.to_plotly_json()["props"] == {
        "id": "custom",
        "url": "https://tiles.example.com/{z}/{x}/{y}.png",
    }
