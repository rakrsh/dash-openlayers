from dash import Dash, html

import dash_openlayers as dol

app = Dash(__name__)
app.layout = dol.Map(
    id="popup-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.TileLayer(source="OSM"),
        dol.Popup(
            id="place-popup",
            position=[0, 0],
            positioning="bottom-center",
            offset=[0, -12],
            autoPan=True,
            className="place-popup",
            style={
                "backgroundColor": "white",
                "border": "1px solid #cccccc",
                "padding": "8px 12px",
            },
            children=html.Div([html.Strong("Null Island"), html.P("0, 0")]),
        ),
    ],
    style={"height": "500px"},
)

if __name__ == "__main__":
    app.run(debug=True)
