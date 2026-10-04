import importlib

import pytest
from dash import html

import dash_openlayers as dol


def test_components_exported():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "Map")
    assert hasattr(mod, "DrawInteraction")
    assert hasattr(mod, "ImageWMS")
    assert hasattr(mod, "LayerControl")
    assert hasattr(mod, "ModifyInteraction")
    assert hasattr(mod, "SelectInteraction")
    assert hasattr(mod, "TileLayer")
    assert hasattr(mod, "TileWMS")
    assert hasattr(mod, "VectorLayer")
    assert hasattr(mod, "VectorTileLayer")
    assert hasattr(mod, "WFSLayer")
    assert hasattr(mod, "WMTSLayer")
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
                undo=2,
                redo=1,
                canUndo=True,
                canRedo=False,
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
                "undo": 2,
                "redo": 1,
                "canUndo": True,
                "canRedo": False,
            },
            "Map",
        ),
        (
            dol.TileLayer(id="tiles", source="OSM"),
            {"id": "tiles", "source": "OSM"},
            "TileLayer",
        ),
        (
            dol.LayerControl(id="layer-control", position="bottom-left", title="Map layers"),
            {"id": "layer-control", "position": "bottom-left", "title": "Map layers"},
            "LayerControl",
        ),
        (
            dol.TileWMS(
                id="tile-wms",
                url="https://maps.example.com/geoserver/wms",
                params={"LAYERS": "workspace:roads"},
                serverType="geoserver",
            ),
            {
                "id": "tile-wms",
                "url": "https://maps.example.com/geoserver/wms",
                "params": {"LAYERS": "workspace:roads"},
                "serverType": "geoserver",
            },
            "TileWMS",
        ),
        (
            dol.ImageWMS(
                id="image-wms",
                url="https://maps.example.com/wms",
                params={"LAYERS": "workspace:boundaries"},
                serverType="qgis",
            ),
            {
                "id": "image-wms",
                "url": "https://maps.example.com/wms",
                "params": {"LAYERS": "workspace:boundaries"},
                "serverType": "qgis",
            },
            "ImageWMS",
        ),
        (
            dol.VectorLayer(
                id="vectors",
                geojson={
                    "type": "FeatureCollection",
                    "features": [],
                },
                wkt="POINT (10 45)",
                style=[
                    {
                        "filter": ["<", ["resolution"], 2500],
                        "style": {"stroke-color": "#1f6a5e"},
                    },
                    {"else": True, "style": {"circle-radius": 5}},
                ],
                clusterDistance=42,
                clusterMinDistance=8,
                declutter="labels",
            ),
            {
                "id": "vectors",
                "geojson": {"type": "FeatureCollection", "features": []},
                "wkt": "POINT (10 45)",
                "style": [
                    {
                        "filter": ["<", ["resolution"], 2500],
                        "style": {"stroke-color": "#1f6a5e"},
                    },
                    {"else": True, "style": {"circle-radius": 5}},
                ],
                "clusterDistance": 42,
                "clusterMinDistance": 8,
                "declutter": "labels",
            },
            "VectorLayer",
        ),
        (
            dol.VectorTileLayer(
                id="vector-tiles",
                url="https://tiles.example/{z}/{x}/{y}.pbf",
                projection="EPSG:3857",
                attributions="Tile provider",
                style={"fill-color": "#6b9b83"},
            ),
            {
                "id": "vector-tiles",
                "url": "https://tiles.example/{z}/{x}/{y}.pbf",
                "projection": "EPSG:3857",
                "attributions": "Tile provider",
                "style": {"fill-color": "#6b9b83"},
            },
            "VectorTileLayer",
        ),
        (
            dol.WMTSLayer(
                id="wmts",
                url="https://tiles.example/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
                layer="roads",
                matrixSet="EPSG:3857",
                projection="EPSG:3857",
                style="default",
                format="image/png",
                requestEncoding="KVP",
                dimensions={"TIME": "2026-01-01"},
                attributions="Tile provider",
            ),
            {
                "id": "wmts",
                "url": "https://tiles.example/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
                "layer": "roads",
                "matrixSet": "EPSG:3857",
                "projection": "EPSG:3857",
                "style": "default",
                "format": "image/png",
                "requestEncoding": "KVP",
                "dimensions": {"TIME": "2026-01-01"},
                "attributions": "Tile provider",
            },
            "WMTSLayer",
        ),
        (
            dol.DrawInteraction(
                id="draw",
                geometryType="Point",
                drawnGeoJSON=drawn_geojson,
                drawnWKT="POINT (1 2)",
                drawnTopoJSON={"type": "Topology"},
                geometryValidation={"valid": True, "errors": [], "suggestions": []},
                snapToVertex=False,
                snapToEdge=True,
                snapTolerance=6,
            ),
            {
                "id": "draw",
                "geometryType": "Point",
                "drawnGeoJSON": drawn_geojson,
                "drawnWKT": "POINT (1 2)",
                "drawnTopoJSON": {"type": "Topology"},
                "geometryValidation": {"valid": True, "errors": [], "suggestions": []},
                "snapToVertex": False,
                "snapToEdge": True,
                "snapTolerance": 6,
            },
            "DrawInteraction",
        ),
        (
            dol.ModifyInteraction(
                id="modify",
                layerId="vectors",
                snapToVertex=False,
                snapToEdge=True,
                snapTolerance=6,
                preserveTopology=False,
                modifiedWKT="GEOMETRYCOLLECTION EMPTY",
                modifiedTopoJSON={"type": "Topology"},
            ),
            {
                "id": "modify",
                "layerId": "vectors",
                "snapToVertex": False,
                "snapToEdge": True,
                "snapTolerance": 6,
                "preserveTopology": False,
                "modifiedWKT": "GEOMETRYCOLLECTION EMPTY",
                "modifiedTopoJSON": {"type": "Topology"},
            },
            "ModifyInteraction",
        ),
        (
            dol.SelectInteraction(
                id="select",
                layerId="vectors",
                selectedGeoJSON={"type": "FeatureCollection", "features": []},
            ),
            {
                "id": "select",
                "layerId": "vectors",
                "selectedGeoJSON": {"type": "FeatureCollection", "features": []},
            },
            "SelectInteraction",
        ),
        (
            dol.WFSLayer(
                id="wfs",
                url="https://maps.example.com/geoserver/wfs",
                typeNames="workspace:roads",
                params={"count": 100},
                featureCount=5,
            ),
            {
                "id": "wfs",
                "url": "https://maps.example.com/geoserver/wfs",
                "typeNames": "workspace:roads",
                "params": {"count": 100},
                "featureCount": 5,
            },
            "WFSLayer",
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


def test_map_accepts_nested_component_children():
    children = [dol.TileLayer(id="tiles", source="OSM"), dol.VectorLayer(id="vectors")]

    layout = dol.Map(children=children)

    assert layout.children == children


def test_popup_serializes_as_nested_map_child():
    content = html.Div("Place details")
    popup = dol.Popup(
        id="place-popup",
        position=[10, 20],
        positioning="bottom-center",
        offset=[0, -8],
        autoPan=True,
        className="place-popup",
        style={"color": "red"},
        children=content,
    )

    serialized = popup.to_plotly_json()
    layout = dol.Map(children=popup)

    assert serialized["namespace"] == "dash_openlayers"
    assert serialized["type"] == "Popup"
    assert serialized["props"] == {
        "id": "place-popup",
        "children": content,
        "position": [10, 20],
        "positioning": "bottom-center",
        "offset": [0, -8],
        "autoPan": True,
        "className": "place-popup",
        "style": {"color": "red"},
    }
    assert layout.children is popup


@pytest.mark.parametrize(
    "data",
    [
        {"type": "FeatureCollection", "features": []},
        '{"type":"FeatureCollection","features":[]}',
    ],
)
def test_vector_layer_serializes_geojson_data(data):
    component = dol.VectorLayer(data=data, style={"circle-radius": 5})

    assert component.to_plotly_json()["props"] == {
        "data": data,
        "style": {"circle-radius": 5},
    }


@pytest.mark.parametrize(
    "children",
    [
        {"not": "a component"},
        object(),
        [dol.TileLayer(source="OSM"), object()],
    ],
)
def test_map_rejects_invalid_children(children):
    with pytest.raises(TypeError, match=r"Map\.children.*found .* at children"):
        dol.Map(children=children)


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
