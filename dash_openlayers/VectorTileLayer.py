# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401
from typing_extensions import TypedDict, NotRequired, Literal  # noqa: F401
from dash.development.base_component import Component, _explicitize_args

try:
    from dash.types import NumberType  # noqa: F401
except ImportError:
    if typing.TYPE_CHECKING:
        raise
    NumberType = typing.Union(  # noqa: F401
        typing.SupportsFloat, typing.SupportsInt, typing.SupportsComplex
    )

ComponentSingleType = typing.Union[str, int, float, Component, None]
ComponentType = typing.Union[
    ComponentSingleType,
    typing.Sequence[ComponentSingleType],
]


class VectorTileLayer(Component):
    """Render Mapbox Vector Tiles from an MVT endpoint with an OpenLayers flat style.


    Keyword arguments:

    - id (string; optional): Component ID used to identify this layer in the Dash layout.

    - url (string; optional): MVT URL template containing {z}, {x}, and {y} or {-y}; ignored when urls is provided.

    - urls (list; optional): Alternative MVT URL templates for load balancing; takes precedence over url.

    - projection (string; optional): Projection of the vector tile grid; use the CRS served by the tile endpoint.

    - attributions (string | list; optional): Attribution text or a list of attribution strings for the tile provider.

    - style (dict; optional): OpenLayers flat-style object used to style MVT features.
    """

    _children_props: typing.List[str] = []
    _base_nodes = ["children"]
    _namespace = "dash_openlayers"
    _type = "VectorTileLayer"

    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        url: typing.Optional[str] = None,
        urls: typing.Optional[typing.Sequence[str]] = None,
        projection: typing.Optional[str] = "EPSG:3857",
        attributions: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        style: typing.Optional[dict] = None,
        **kwargs,
    ):
        self._prop_names = ["id", "url", "urls", "projection", "attributions", "style"]
        self._valid_wildcard_attributes = []
        self.available_properties = ["id", "url", "urls", "projection", "attributions", "style"]
        self.available_wildcard_properties = []
        _explicit_args = kwargs.pop("_explicit_args")
        _locals = locals()
        _locals.update(kwargs)
        args = {k: _locals[k] for k in _explicit_args}

        super(VectorTileLayer, self).__init__(**args)


setattr(VectorTileLayer, "__init__", _explicitize_args(VectorTileLayer.__init__))