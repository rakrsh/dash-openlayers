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


class WebGLPointsLayer(Component):
    """A WebGLPointsLayer component.
Render large GeoJSON point datasets with the OpenLayers WebGL renderer.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this layer in the Dash layout.

- data (string | dict; optional):
    GeoJSON Point or MultiPoint FeatureCollection as an object or JSON
    string; embedded CRS metadata is honored, otherwise coordinates
    default to EPSG:4326.

- disableHitDetection (boolean; default False):
    Disable WebGL feature hit detection for a small rendering
    performance gain.

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
    _type = 'WebGLPointsLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        data: typing.Optional[typing.Union[str, dict]] = None,
        style: typing.Optional[typing.Any] = None,
        disableHitDetection: typing.Optional[bool] = None,
        visible: typing.Optional[bool] = None,
        opacity: typing.Optional[NumberType] = None,
        zIndex: typing.Optional[NumberType] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'data', 'style', 'disableHitDetection', 'visible', 'opacity', 'zIndex']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'data', 'style', 'disableHitDetection', 'visible', 'opacity', 'zIndex']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WebGLPointsLayer, self).__init__(**args)

setattr(WebGLPointsLayer, "__init__", _explicitize_args(WebGLPointsLayer.__init__))
