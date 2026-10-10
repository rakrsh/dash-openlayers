import dash
from dash import Input, Output, dcc, html

import dash_openlayers as dol

app = dash.Dash(__name__)

app.layout = html.Main(
    [
        html.H1("Measure distances and areas"),
        html.P(
            "Select Distance or Area, draw on the map, and switch units. "
            "Completed measurements remain visible until cleared."
        ),
        dcc.RadioItems(
            id="measure-units",
            options=[
                {"label": "Metric", "value": "metric"},
                {"label": "Imperial", "value": "imperial"},
            ],
            value="metric",
            inline=True,
        ),
        html.Button("Clear measurements", id="clear-measurements", n_clicks=0),
        dol.Map(
            id="map",
            center=[-0.1276, 51.5072],
            zoom=11,
            projection="EPSG:4326",
            children=[
                dol.TileLayer(id="basemap", source="OSM"),
                dol.MeasureControl(
                    id="measure",
                    units="metric",
                    clearMeasurements=0,
                    position="top-left",
                ),
            ],
            style={"height": "640px", "width": "100%"},
        ),
    ],
    style={"maxWidth": "1100px", "margin": "0 auto", "padding": "16px"},
)


@app.callback(Output("measure", "units"), Input("measure-units", "value"))
def select_measurement_units(units):
    return units


@app.callback(
    Output("measure", "clearMeasurements"),
    Input("clear-measurements", "n_clicks"),
)
def clear_measurements(clicks):
    return clicks


if __name__ == "__main__":
    app.run(debug=True)
