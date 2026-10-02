import importlib

import dash_openlayers as dol


def test_components_exported():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "Map")
    assert hasattr(mod, "DrawInteraction")
    assert hasattr(mod, "ModifyInteraction")
    assert hasattr(mod, "TileLayer")
    assert hasattr(mod, "VectorLayer")
    assert hasattr(mod, "__version__")


def test_component_props_serialize():
    proj4_defs = [{"code": "EPSG:27700", "def": "+proj=tmerc +lat_0=49 +lon_0=-2"}]
    drawn_geojson = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [1, 2]},
        "properties": {},
    }
    components = [
        (
            dol.Map(
                id="map",
                center=[-0.1, 51.5],
                zoom=8,
                projection="EPSG:4326",
                proj4Defs=proj4_defs,
                style={"height": "400px"},
                clickData={"coordinate": [1, 2], "latLon": [2, 1]},
            ),
            {
                "children": None,
                "id": "map",
                "center": [-0.1, 51.5],
                "zoom": 8,
                "projection": "EPSG:4326",
                "proj4Defs": proj4_defs,
                "style": {"height": "400px"},
                "clickData": {"coordinate": [1, 2], "latLon": [2, 1]},
            },
            "Map",
        ),
        (
            dol.TileLayer(id="tiles", source="OSM"),
            {"id": "tiles", "source": "OSM"},
            "TileLayer",
        ),
        (
            dol.VectorLayer(
                id="vectors",
                geojson={
                    "type": "FeatureCollection",
                    "features": [],
                },
            ),
            {
                "id": "vectors",
                "geojson": {"type": "FeatureCollection", "features": []},
            },
            "VectorLayer",
        ),
        (
            dol.DrawInteraction(
                id="draw",
                geometryType="Point",
                drawnGeoJSON=drawn_geojson,
            ),
            {
                "id": "draw",
                "geometryType": "Point",
                "drawnGeoJSON": drawn_geojson,
            },
            "DrawInteraction",
        ),
        (
            dol.ModifyInteraction(id="modify", layerId="vectors"),
            {"id": "modify", "layerId": "vectors"},
            "ModifyInteraction",
        ),
    ]

    for component, expected_props, expected_type in components:
        serialized = component.to_plotly_json()
        assert serialized["namespace"] == "dash_openlayers"
        assert serialized["type"] == expected_type
        assert serialized["props"] == expected_props


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


def test_modify_interaction_result_prop_serializes():
    result = {"type": "FeatureCollection", "features": []}
    component = dol.ModifyInteraction(
        id="modify",
        layerId="vectors",
        modifiedGeoJSON=result,
    )

    assert component.to_plotly_json()["props"] == {
        "id": "modify",
        "layerId": "vectors",
        "modifiedGeoJSON": result,
    }
