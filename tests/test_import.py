import importlib


def test_package_importable():
    mod = importlib.import_module('dash_openlayers.dash_openlayers')
    assert hasattr(mod, '__version__')
