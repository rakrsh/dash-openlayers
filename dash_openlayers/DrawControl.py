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


class DrawControl(Component):
    """A DrawControl component.
Provide interactive map tools for drawing and serializing spatial study areas.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this drawing control and its
    callback outputs.

- geometryTypes (list of a value equal to: 'Point', 'LineString', 'Polygon', 'Box's; default ['Point', 'LineString', 'Polygon', 'Box']):
    Drawing modes displayed in the control: Point, LineString,
    Polygon, and Box (rectangle).

- position (a value equal to: 'top-left', 'top-right', 'bottom-left', 'bottom-right'; default 'top-left'):
    Corner of the map where the drawing tools are displayed.

- title (string; default 'Draw'):
    Accessible toolbar label and visible heading.

- drawnGeoJSON (dict; optional):
    Read-only: GeoJSON Feature emitted only when geometry validation
    succeeds.

- drawnWKT (string; optional):
    Read-only: WKT geometry emitted only when geometry validation
    succeeds.

- drawnTopoJSON (dict; optional):
    Read-only: TopoJSON topology emitted only when geometry validation
    succeeds.

- geometryValidation (dict; optional):
    Read-only: validity, topology errors, and repair suggestions from
    the last draw.

- snapToVertex (boolean; default True):
    Whether drawing snaps to existing vector vertices.

- snapToEdge (boolean; default True):
    Whether drawing snaps to existing vector edges.

- snapTolerance (number; default 10):
    Maximum snap distance in screen pixels."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'DrawControl'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        geometryTypes: typing.Optional[typing.Sequence[Literal["Point", "LineString", "Polygon", "Box"]]] = None,
        position: typing.Optional[Literal["top-left", "top-right", "bottom-left", "bottom-right"]] = None,
        title: typing.Optional[str] = None,
        drawnGeoJSON: typing.Optional[dict] = None,
        drawnWKT: typing.Optional[str] = None,
        drawnTopoJSON: typing.Optional[dict] = None,
        geometryValidation: typing.Optional[dict] = None,
        snapToVertex: typing.Optional[bool] = None,
        snapToEdge: typing.Optional[bool] = None,
        snapTolerance: typing.Optional[NumberType] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'geometryTypes', 'position', 'title', 'drawnGeoJSON', 'drawnWKT', 'drawnTopoJSON', 'geometryValidation', 'snapToVertex', 'snapToEdge', 'snapTolerance']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'geometryTypes', 'position', 'title', 'drawnGeoJSON', 'drawnWKT', 'drawnTopoJSON', 'geometryValidation', 'snapToVertex', 'snapToEdge', 'snapTolerance']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(DrawControl, self).__init__(**args)

setattr(DrawControl, "__init__", _explicitize_args(DrawControl.__init__))
