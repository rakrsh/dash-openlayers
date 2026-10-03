import json
import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

import dash
from dash import Input, Output, State, dcc, html

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
        html.Button("Load one WFS feature", id="load-wfs", n_clicks=0),
        html.Button("Sync edited point with WFS-T", id="sync-wfs", n_clicks=0),
        html.Div(id="wfs-status"),
        dcc.Store(id="wfs-features"),
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.VectorLayer(id="wfs-features-layer", geojson=None),
                dol.ModifyInteraction(id="wfs-modify", layerId="wfs-features-layer"),
            ],
            style={"height": "600px", "width": "100%"},
        ),
    ]
)


@app.callback(
    Output("wfs-features-layer", "geojson"),
    Output("wfs-status", "children"),
    Input("load-wfs", "n_clicks"),
    prevent_initial_call=True,
)
def load_wfs_feature(_clicks):
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeNames": WFS_FEATURE_TYPE,
        "outputFormat": "application/json",
        "srsName": "CRS:84",
        "count": 1,
    }
    parsed_url = urlsplit(WFS_URL)
    query = dict(parse_qsl(parsed_url.query))
    query.update(params)
    request_url = urlunsplit(parsed_url._replace(query=urlencode(query)))
    request = Request(request_url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=20) as response:
        feature_collection = json.loads(response.read())
    if not feature_collection.get("features"):
        return None, "The WFS request returned no features."
    return feature_collection, "Loaded one WFS feature. Drag its point to edit it."


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


if __name__ == "__main__":
    app.run(debug=True)
