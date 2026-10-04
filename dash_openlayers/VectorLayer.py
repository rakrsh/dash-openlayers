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


class VectorLayer(Component):
    """A VectorLayer component.
Render GeoJSON features in a canvas-backed OpenLayers vector layer.

Keyword arguments:

- id (string; optional):
    Dash component ID; also used by ModifyInteraction to target this
    vector layer.

- data (string | dict; optional):
    GeoJSON Feature or FeatureCollection as an object or JSON string;
    embedded CRS metadata is honored, otherwise coordinates default to
    EPSG:4326. Takes precedence over geojson.

- geojson (dict; optional):
    Backward-compatible GeoJSON Feature or FeatureCollection object
    alias for `data`.

- wkt (string; optional):
    WKT geometry string in [x, y] order; takes precedence over `data`
    and `geojson` when non-empty.

- clusterDistance (number; default 0):
    Point clustering distance in screen pixels; set to 0 to disable
    clustering.

- clusterMinDistance (number; default 0):
    Minimum distance in screen pixels between clusters; capped at
    clusterDistance.

- declutter (boolean | string; default False):
    Enable label decluttering, or provide a shared group name to
    declutter with other layers."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'VectorLayer'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        data: typing.Optional[typing.Union[str, dict]] = None,
        geojson: typing.Optional[dict] = None,
        wkt: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        clusterDistance: typing.Optional[NumberType] = None,
        clusterMinDistance: typing.Optional[NumberType] = None,
        declutter: typing.Optional[typing.Union[bool, str]] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'data', 'geojson', 'wkt', 'style', 'clusterDistance', 'clusterMinDistance', 'declutter']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'data', 'geojson', 'wkt', 'style', 'clusterDistance', 'clusterMinDistance', 'declutter']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(VectorLayer, self).__init__(**args)

setattr(VectorLayer, "__init__", _explicitize_args(VectorLayer.__init__))
