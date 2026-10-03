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


class WMTSLayer(Component):
    """A WMTSLayer component.
Render a WMTS layer using its service capabilities to configure the tile grid.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this layer in the Dash layout.

- url (string; optional):
    URL of the WMTS GetCapabilities document; the server must allow
    browser CORS access.

- layer (string; optional):
    Layer identifier advertised by the WMTS capabilities.

- matrixSet (string; optional):
    Tile matrix set identifier; inferred when the capabilities
    advertise a single set.

- projection (string; optional):
    Projection code to select a compatible matrix set, such as
    EPSG:3857.

- format (string; optional):
    Tile image format; defaults to the first advertised format.

- requestEncoding (a value equal to: 'KVP', 'REST'; optional):
    WMTS request encoding, either KVP or REST.

- dimensions (dict; optional):
    Values for advertised WMTS dimensions, such as TIME or ELEVATION.

- attributions (string | list of strings; optional):
    Attribution text or a list of attribution strings for the tile
    provider."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'WMTSLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        url: typing.Optional[str] = None,
        layer: typing.Optional[str] = None,
        matrixSet: typing.Optional[str] = None,
        projection: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        format: typing.Optional[str] = None,
        requestEncoding: typing.Optional[Literal["KVP", "REST"]] = None,
        dimensions: typing.Optional[dict] = None,
        attributions: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'url', 'layer', 'matrixSet', 'projection', 'style', 'format', 'requestEncoding', 'dimensions', 'attributions']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'url', 'layer', 'matrixSet', 'projection', 'style', 'format', 'requestEncoding', 'dimensions', 'attributions']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WMTSLayer, self).__init__(**args)

setattr(WMTSLayer, "__init__", _explicitize_args(WMTSLayer.__init__))
