import dash
from dash import html
import dash_openlayers as dol

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1('dash-openlayers demo'),
    html.Div('This demo shows the Map placeholder.'),
    html.Pre(str(dol.dash_openlayers.Map(center=[0, 0], zoom=2)))
])

if __name__ == '__main__':
    app.run_server(debug=True)
