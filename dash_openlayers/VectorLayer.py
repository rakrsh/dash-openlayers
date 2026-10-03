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


class VectorLayer(Component):
    """Render GeoJSON features in an OpenLayers vector layer.


    Keyword arguments:

    - id (string; optional)

    - geojson (dict; optional): GeoJSON Feature or FeatureCollection with coordinates in
      [longitude, latitude] order. Updates are rendered in the map projection.

        - wkt (string; optional): WKT geometry in [x, y] order. When non-empty, this takes
            precedence over `geojson`.

        - style (dict or list; optional): OpenLayers flat style object or rule array.
            Supports icons, fills, strokes, feature filters, and resolution expressions.

        - clusterDistance (number; optional): Point cluster distance in screen pixels; 0 disables.

        - clusterMinDistance (number; optional): Minimum pixel distance between clusters.

        - declutter (boolean or string; optional): Enable label decluttering or share a group.
    """

    _children_props: typing.List[str] = []
    _base_nodes = ["children"]
    _namespace = "dash_openlayers"
    _type = "VectorLayer"

    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        geojson: typing.Optional[dict] = None,
        wkt: typing.Optional[str] = None,
        style: typing.Optional[typing.Union[dict, typing.Sequence[dict]]] = None,
        clusterDistance: typing.Optional[NumberType] = None,
        clusterMinDistance: typing.Optional[NumberType] = None,
        declutter: typing.Optional[typing.Union[bool, str]] = None,
        **kwargs,
    ):
        self._prop_names = [
            "id",
            "geojson",
            "wkt",
            "style",
            "clusterDistance",
            "clusterMinDistance",
            "declutter",
        ]
        self._valid_wildcard_attributes = []
        self.available_properties = self._prop_names
        self.available_wildcard_properties = []
        _explicit_args = kwargs.pop("_explicit_args")
        _locals = locals()
        _locals.update(kwargs)
        args = {k: _locals[k] for k in _explicit_args}

        super(VectorLayer, self).__init__(**args)


setattr(VectorLayer, "__init__", _explicitize_args(VectorLayer.__init__))
