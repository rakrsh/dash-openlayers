import json
import os
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

import dash
from dash import Input, Output, State, html

import dash_openlayers as dol

WFS_URL = os.environ.get("WFS_URL", "https://ahocevar.com/geoserver/wfs")
WFS_FEATURE_TYPE = os.environ.get("WFS_FEATURE_TYPE", "ne:ne_10m_populated_places")
WFS_TRANSACTION_URL = os.environ.get("WFS_TRANSACTION_URL")
WFS_FEATURE_NAMESPACE = os.environ.get("WFS_FEATURE_NAMESPACE")
WFS_GEOMETRY_PROPERTY = os.environ.get("WFS_GEOMETRY_PROPERTY", "the_geom")

WFS_NS = "http://www.opengis.net/wfs/2.0"
FES_NS = "http://www.opengis.net/fes/2.0"
GML_NS = "http://www.opengis.net/gml/3.2"

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        html.Button("Sync edited point with WFS-T", id="sync-wfs", n_clicks=0),
        html.Div(id="wfs-status"),
        html.Pre(id="edit-validation"),
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.WFSLayer(
                    id="wfs-features-layer",
                    url=WFS_URL,
                    typeNames=WFS_FEATURE_TYPE,
                    srsName="EPSG:4326",
                    params={"count": 1},
                ),
                dol.ModifyInteraction(
                    id="wfs-modify",
                    layerId="wfs-features-layer",
                    snapToVertex=True,
                    snapToEdge=True,
                    snapTolerance=14,
                    preserveTopology=True,
                ),
            ],
            style={"height": "600px", "width": "100%"},
        ),
    ]
)


@app.callback(
    Output("wfs-status", "children"),
    Input("wfs-features-layer", "featureCount"),
    Input("wfs-features-layer", "loadError"),
)
def show_wfs_status(feature_count, load_error):
    if load_error:
        return f"WFS request failed: {load_error}"
    if feature_count is None:
        return "Loading WFS features..."
    if feature_count == 0:
        return "The WFS request returned no features."
    return f"Loaded {feature_count} WFS feature(s). Drag a point to edit it."


def make_point_update_transaction(feature_collection):
    if not WFS_FEATURE_NAMESPACE:
        raise ValueError("Set WFS_FEATURE_NAMESPACE before enabling WFS-T writes.")

    prefix = WFS_FEATURE_TYPE.split(":", 1)[0] if ":" in WFS_FEATURE_TYPE else "feature"
    ET.register_namespace(prefix, WFS_FEATURE_NAMESPACE)
    ET.register_namespace("wfs", WFS_NS)
    ET.register_namespace("fes", FES_NS)
    ET.register_namespace("gml", GML_NS)
    transaction = ET.Element(
        f"{{{WFS_NS}}}Transaction",
        {"service": "WFS", "version": "2.0.0"},
    )

    for feature in feature_collection.get("features", []):
        feature_id = feature.get("id")
        geometry = feature.get("geometry") or {}
        if not feature_id or geometry.get("type") != "Point":
            continue
        longitude, latitude = geometry["coordinates"][:2]
        update = ET.SubElement(
            transaction,
            f"{{{WFS_NS}}}Update",
            {"typeName": WFS_FEATURE_TYPE},
        )
        prop = ET.SubElement(update, f"{{{WFS_NS}}}Property")
        ET.SubElement(prop, f"{{{WFS_NS}}}ValueReference").text = WFS_GEOMETRY_PROPERTY
        value = ET.SubElement(prop, f"{{{WFS_NS}}}Value")
        point = ET.SubElement(
            value,
            f"{{{GML_NS}}}Point",
            {"srsName": "urn:ogc:def:crs:OGC::CRS84"},
        )
        ET.SubElement(point, f"{{{GML_NS}}}pos").text = f"{longitude} {latitude}"
        filter_element = ET.SubElement(update, f"{{{FES_NS}}}Filter")
        ET.SubElement(
            filter_element,
            f"{{{FES_NS}}}ResourceId",
            {"rid": str(feature_id)},
        )

    if not list(transaction):
        raise ValueError("No edited Point features with WFS feature IDs were found.")
    return ET.tostring(transaction, encoding="utf-8", xml_declaration=True)


@app.callback(
    Output("wfs-status", "children", allow_duplicate=True),
    Input("sync-wfs", "n_clicks"),
    State("wfs-modify", "modifiedGeoJSON"),
    prevent_initial_call=True,
)
def sync_wfs_edits(_clicks, modified_geojson):
    if not WFS_TRANSACTION_URL:
        return "Set WFS_TRANSACTION_URL to an authorized WFS-T endpoint before syncing."
    if not modified_geojson:
        return "Load and edit a WFS feature before syncing."

    try:
        transaction = make_point_update_transaction(modified_geojson)
        request = Request(
            WFS_TRANSACTION_URL,
            data=transaction,
            headers={"Content-Type": "text/xml; charset=UTF-8"},
            method="POST",
        )
        with urlopen(request, timeout=20) as response:
            server_response = response.read().decode("utf-8")
        return f"WFS-T response: {server_response[:500]}"
    except Exception as error:  # Surface endpoint errors in the demo UI.
        return f"WFS-T failed: {error}"


@app.callback(Output("edit-validation", "children"), Input("wfs-modify", "geometryValidation"))
def show_edit_validation(result):
    if not result:
        return "Modify validation appears here."
    return json.dumps(result, indent=2)


if __name__ == "__main__":
    app.run(debug=True)
