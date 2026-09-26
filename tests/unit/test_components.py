import importlib


def test_components_exported():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "Map")
    assert hasattr(mod, "DrawInteraction")
    assert hasattr(mod, "__version__")
