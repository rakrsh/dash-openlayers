import importlib


def test_measure_control_importable():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "MeasureControl")
