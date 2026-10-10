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


class VectorTileLayer(Component):
    """A VectorTileLayer component.
Render MVT/PBF vector tiles with OpenLayers flat styles or Mapbox GL style documents and report clicked or hovered feature attributes.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this layer in the Dash layout.

- url (string; optional):
    MVT URL template containing {z}, {x}, and {y} or {-y}; ignored
    when urls is provided.

- urls (list of strings; optional):
    Alternative MVT URL templates for load balancing; takes precedence
    over url.

- projection (string; default 'EPSG:3857'):
    Projection of the vector tile grid; use the CRS served by the tile
    endpoint.

- attributions (string | list of strings; optional):
    Attribution text or a list of attribution strings for the tile
    provider.

- mapboxStyle (dict; optional):
    Mapbox GL Style document used to style this layer's vector source.

- mapboxSource (string; optional):
    Vector source key within mapboxStyle; inferred when that document
    contains one vector source.

- visible (boolean; default True):
    Whether this layer is rendered; updates the OpenLayers layer
    immediately.

- opacity (number; default 1):
    Layer opacity from 0 (transparent) to 1 (opaque); updates
    immediately.

- zIndex (number; optional):
    Integer stacking order; omitted values preserve OpenLayers layer
    ordering.

- clickedFeature (dict; optional):
    Read-only: attributes of the vector-tile feature clicked on this
    layer, or None.

- hoveredFeature (dict; optional):
    Read-only: attributes of the vector-tile feature currently under
    the pointer, or None."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'VectorTileLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        url: typing.Optional[str] = None,
        urls: typing.Optional[typing.Sequence[str]] = None,
        projection: typing.Optional[str] = None,
        attributions: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        style: typing.Optional[typing.Any] = None,
        mapboxStyle: typing.Optional[dict] = None,
        mapboxSource: typing.Optional[str] = None,
        visible: typing.Optional[bool] = None,
        opacity: typing.Optional[NumberType] = None,
        zIndex: typing.Optional[NumberType] = None,
        clickedFeature: typing.Optional[dict] = None,
        hoveredFeature: typing.Optional[dict] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'url', 'urls', 'projection', 'attributions', 'style', 'mapboxStyle', 'mapboxSource', 'visible', 'opacity', 'zIndex', 'clickedFeature', 'hoveredFeature']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'url', 'urls', 'projection', 'attributions', 'style', 'mapboxStyle', 'mapboxSource', 'visible', 'opacity', 'zIndex', 'clickedFeature', 'hoveredFeature']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(VectorTileLayer, self).__init__(**args)

setattr(VectorTileLayer, "__init__", _explicitize_args(VectorTileLayer.__init__))
