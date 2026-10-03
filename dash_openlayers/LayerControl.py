# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401

from dash.development.base_component import Component, _explicitize_args


class LayerControl(Component):
    """A LayerControl component.

    Keyword arguments:

    - id (string; optional)

    - position (string; optional)

    - title (string; optional)
    """

    _children_props: typing.List[str] = []
    _base_nodes = ["children"]
    _namespace = "dash_openlayers"
    _type = "LayerControl"

    def __init__(self, id=None, position=None, title=None, **kwargs):
        self._prop_names = ["id", "position", "title"]
        self._valid_wildcard_attributes = []
        self.available_properties = ["id", "position", "title"]
        self.available_wildcard_properties = []
        _explicit_args = kwargs.pop("_explicit_args")
        _locals = locals()
        _locals.update(kwargs)
        args = {key: _locals[key] for key in _explicit_args}

        super().__init__(**args)


LayerControl.__init__ = _explicitize_args(LayerControl.__init__)
