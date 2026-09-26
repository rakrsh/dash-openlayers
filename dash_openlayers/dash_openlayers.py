"""Minimal Python wrapper for dash-openlayers components.

This file mimics the generated wrapper produced by the Plotly Dash component
boilerplate. It provides safe imports so the package can be imported during CI
without requiring Dash at runtime.
"""
__all__ = ["__version__", "Map"]

__version__ = "0.0.1"

class Map:
    """Placeholder Map component wrapper.

    When Dash is available, users should replace this with a generated
    component class created by the Dash component boilerplate. For now this
    class only contains minimal metadata so importing the package is safe.
    """
    _namespace = "dash_openlayers"
    _component_name = "Map"

    def __init__(self, *args, **kwargs):
        # Store props for user inspection
        self.props = kwargs

    def __repr__(self):
        return f"<dash_openlayers.Map props={self.props}>"
