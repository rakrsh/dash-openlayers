import importlib


def test_package_importable():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "__version__")
    assert hasattr(mod, "Map")
    assert hasattr(mod, "DrawInteraction")
