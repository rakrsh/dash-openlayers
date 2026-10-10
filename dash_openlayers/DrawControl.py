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

- geometryTypes (list of a value equal to: 'Point', 'LineString', 'Polygon', 'Circle', 'Box's; default ['Point', 'LineString', 'Polygon', 'Circle', 'Box']):
    Drawing modes displayed in the control: Point, LineString,
    Polygon, Circle, and Box (rectangle).

- activeDrawMode (a value equal to: null, 'Point', 'LineString', 'Polygon', 'Circle', 'Box'; optional):
    Active drawing mode; set to None to stop drawing. Bidirectional
    when changed by toolbar clicks.

- editMode (boolean; optional):
    Whether selection and vertex editing are enabled; toolbar changes
    are bidirectional.

- deleteSelected (number; default 0):
    Increment to delete the currently selected feature or features.

- position (a value equal to: 'top-left', 'top-right', 'bottom-left', 'bottom-right'; default 'top-left'):
    Corner of the map where the drawing tools are displayed.

- title (string; default 'Draw'):
    Accessible toolbar label and visible heading.

- buttonStyle (dict; optional):
    Inline styles applied to each drawing mode button.

- drawnGeoJSON (dict; optional):
    Read-only: GeoJSON Feature emitted only when geometry validation
    succeeds.

- drawnFeatures (dict; optional):
    Read-only: GeoJSON FeatureCollection of all drawn features,
    updated after drawing, editing, undo, or removal.

- editedFeature (dict; optional):
    Read-only: selected or last modified GeoJSON Feature, or None
    after deselection or deletion.

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
        geometryTypes: typing.Optional[typing.Sequence[Literal["Point", "LineString", "Polygon", "Circle", "Box"]]] = None,
        activeDrawMode: typing.Optional[Literal[None, "Point", "LineString", "Polygon", "Circle", "Box"]] = None,
        editMode: typing.Optional[bool] = None,
        deleteSelected: typing.Optional[NumberType] = None,
        position: typing.Optional[Literal["top-left", "top-right", "bottom-left", "bottom-right"]] = None,
        title: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        buttonStyle: typing.Optional[dict] = None,
        drawnGeoJSON: typing.Optional[dict] = None,
        drawnFeatures: typing.Optional[dict] = None,
        editedFeature: typing.Optional[dict] = None,
        drawnWKT: typing.Optional[str] = None,
        drawnTopoJSON: typing.Optional[dict] = None,
        geometryValidation: typing.Optional[dict] = None,
        snapToVertex: typing.Optional[bool] = None,
        snapToEdge: typing.Optional[bool] = None,
        snapTolerance: typing.Optional[NumberType] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'geometryTypes', 'activeDrawMode', 'editMode', 'deleteSelected', 'position', 'title', 'style', 'buttonStyle', 'drawnGeoJSON', 'drawnFeatures', 'editedFeature', 'drawnWKT', 'drawnTopoJSON', 'geometryValidation', 'snapToVertex', 'snapToEdge', 'snapTolerance']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'geometryTypes', 'activeDrawMode', 'editMode', 'deleteSelected', 'position', 'title', 'style', 'buttonStyle', 'drawnGeoJSON', 'drawnFeatures', 'editedFeature', 'drawnWKT', 'drawnTopoJSON', 'geometryValidation', 'snapToVertex', 'snapToEdge', 'snapTolerance']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(DrawControl, self).__init__(**args)

setattr(DrawControl, "__init__", _explicitize_args(DrawControl.__init__))
