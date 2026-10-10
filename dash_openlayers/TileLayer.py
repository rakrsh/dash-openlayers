# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401
from typing_extensions import TypedDict, NotRequired, Literal # noqa: F401
from dash.development.base_component import Component, _explicitize_args
try:
    from dash.types import NumberType  # noqa: F401
except ImportError:
    # Backwards compatibility for dash<=4.1.0
    if typing.TYPE_CHECKING:
        raise
    NumberType = typing.Union[  # noqa: F401
        typing.SupportsFloat, typing.SupportsInt, typing.SupportsComplex
    ]

ComponentSingleType = typing.Union[str, int, float, Component, None]
ComponentType = typing.Union[
    ComponentSingleType,
    typing.Sequence[ComponentSingleType],
]


class TileLayer(Component):
    """A TileLayer component.
Render OpenStreetMap or custom XYZ tiles on the map.

Keyword arguments:

- id (string; optional):
    The ID used to identify this layer in Dash callbacks.

- source (string; optional):
    Built-in tile source identifier. Currently supports \"OSM\".

- url (string; optional):
    URL template for a custom XYZ tile source, e.g.
    'https://tiles.example.com/{z}/{x}/{y}.png'.

- visible (boolean; default True):
    Whether this layer is rendered; updates the OpenLayers layer
    immediately.

- opacity (number; default 1):
    Layer opacity from 0 (transparent) to 1 (opaque); updates
    immediately.

- zIndex (number; optional):
    Integer stacking order; omitted values preserve OpenLayers layer
    ordering."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'TileLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        source: typing.Optional[str] = None,
        url: typing.Optional[str] = None,
        visible: typing.Optional[bool] = None,
        opacity: typing.Optional[NumberType] = None,
        zIndex: typing.Optional[NumberType] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'source', 'url', 'visible', 'opacity', 'zIndex']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'source', 'url', 'visible', 'opacity', 'zIndex']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(TileLayer, self).__init__(**args)

setattr(TileLayer, "__init__", _explicitize_args(TileLayer.__init__))
