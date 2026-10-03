import dash
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait

import dash_openlayers as dol


def test_layer_control_visibility_opacity_and_order(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dol.Map(
        id="map",
        center=[0, 0],
        zoom=2,
        children=[
            dol.TileLayer(id="basemap", source="OSM"),
            dol.VectorLayer(
                id="observations",
                geojson={"type": "FeatureCollection", "features": []},
            ),
            dol.DrawInteraction(id="draw", geometryType="Point"),
            dol.LayerControl(id="layers"),
        ],
        style={"height": "400px", "width": "600px"},
    )

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map .ol-control ol li", timeout=15)

    get_layer_names = """
        return Array.from(document.querySelectorAll('#map .ol-control ol li label span'))
            .map((element) => element.textContent);
    """
    assert dash_duo.driver.execute_script(get_layer_names) == ["observations", "basemap"]

    visibility = dash_duo.find_element('input[aria-label="Visibility of observations"]')
    assert visibility.is_selected()
    visibility.click()
    WebDriverWait(dash_duo.driver, 10).until(
        lambda driver: (
            not driver.find_element(
                By.CSS_SELECTOR, 'input[aria-label="Visibility of observations"]'
            ).is_selected()
        )
    )

    opacity = dash_duo.find_element('input[aria-label="Opacity of observations"]')
    opacity.send_keys(Keys.ARROW_LEFT)
    WebDriverWait(dash_duo.driver, 10).until(
        lambda driver: (
            driver.execute_script(
                "return arguments[0].closest('li').querySelector("
                "'[aria-hidden=true]').textContent;",
                opacity,
            )
            == "95%"
        )
    )

    dash_duo.find_element('button[aria-label="Move basemap up"]').click()
    WebDriverWait(dash_duo.driver, 10).until(
        lambda driver: driver.execute_script(get_layer_names) == ["basemap", "observations"]
    )
    assert dash_duo.driver.execute_script(get_layer_names) == ["basemap", "observations"]
    assert dash_duo.get_logs() == []
