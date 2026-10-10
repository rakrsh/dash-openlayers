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


class WFSLayer(Component):
    """A WFSLayer component.
Load WFS GeoJSON features into an editable vector layer.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component and layer in Dash
    callbacks.

- url (string; optional):
    WFS endpoint URL; the service must allow browser CORS access.

- typeNames (string; optional):
    WFS feature type name (sent as typeNames for 2.x, typeName for
    1.x).

- version (string; default '2.0.0'):
    WFS protocol version.

- srsName (string; default 'EPSG:4326'):
    Coordinate reference system requested from the service and used to
    parse response coordinates.

- outputFormat (string; default 'application/json'):
    WFS response format; the component currently parses GeoJSON
    responses.

- params (dict; optional):
    Additional GetFeature query parameters, such as count, bbox, or
    CQL_FILTER.

- visible (boolean; default True):
    Whether this layer is rendered; updates the OpenLayers layer
    immediately.

- opacity (number; default 1):
    Layer opacity from 0 (transparent) to 1 (opaque); updates
    immediately.

- zIndex (number; optional):
    Integer stacking order; omitted values preserve OpenLayers layer
    ordering.

- featureCount (number; optional):
    Read-only: number of features loaded by the last successful
    request.

- loadError (string; optional):
    Read-only: message from the last failed request, or None after
    success."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'WFSLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        url: typing.Optional[str] = None,
        typeNames: typing.Optional[str] = None,
        version: typing.Optional[str] = None,
        srsName: typing.Optional[str] = None,
        outputFormat: typing.Optional[str] = None,
        params: typing.Optional[dict] = None,
        visible: typing.Optional[bool] = None,
        opacity: typing.Optional[NumberType] = None,
        zIndex: typing.Optional[NumberType] = None,
        featureCount: typing.Optional[NumberType] = None,
        loadError: typing.Optional[str] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'url', 'typeNames', 'version', 'srsName', 'outputFormat', 'params', 'visible', 'opacity', 'zIndex', 'featureCount', 'loadError']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'url', 'typeNames', 'version', 'srsName', 'outputFormat', 'params', 'visible', 'opacity', 'zIndex', 'featureCount', 'loadError']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WFSLayer, self).__init__(**args)

setattr(WFSLayer, "__init__", _explicitize_args(WFSLayer.__init__))
