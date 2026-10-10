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


class Map(Component):
    """A Map component.
Create an OpenLayers map and synchronize its view and click events with Dash.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- children (a list of or a singular dash component, string or number; optional):
    OpenLayers layer and interaction components rendered inside this
    map.

- center (list of numbers; default [0, 0]):
    Map view center as [longitude, latitude] in EPSG:4326.
    Bidirectional: updated after debounced viewport movement and
    animated when set from Python.

- zoom (number; default 2):
    Map zoom level. Bidirectional: updated after debounced viewport
    movement and animated from Python.

- bounds (list of numbers; optional):
    View extent as [minLongitude, minLatitude, maxLongitude,
    maxLatitude] in EPSG:4326; animated when set.

- debounce (number; default 300):
    Debounce delay for viewport callback updates, in milliseconds.

- projection (string; default 'EPSG:3857'):
    EPSG code the view is rendered in, e.g. 'EPSG:3857' or a custom
    code registered via `proj4Defs`.

- proj4Defs (list of dicts; optional):
    Custom proj4 projection definitions to register before the view is
    constructed, e.g. [{ code: 'EPSG:27700', def: '+proj=tmerc ...'
    }].

    `proj4Defs` is a list of dicts with keys:

    - code (string; required)

    - def (string; required)

- clickData (dict; optional):
    Read-only: set on `singleclick` with `{ coordinate: [x, y],
    latLon: [lat, lon] }`.

- bbox (list of numbers; optional):
    Read-only: current visible extent as [minLongitude, minLatitude,
    maxLongitude, maxLatitude] in EPSG:4326.

- undo (number; default 0):
    Increment to undo the latest draw or modify operation on this map.

- redo (number; default 0):
    Increment to redo the latest undone draw or modify operation on
    this map.

- canUndo (boolean; optional):
    Read-only: whether this map's edit history has an operation to
    undo.

- canRedo (boolean; optional):
    Read-only: whether this map's edit history has an operation to
    redo."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'Map'
    Proj4Defs = TypedDict(
        "Proj4Defs",
            {
            "code": str,
            "def": str
        }
    )


    def __init__(
        self,
        children: typing.Optional[ComponentType] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        center: typing.Optional[typing.Sequence[NumberType]] = None,
        zoom: typing.Optional[NumberType] = None,
        bounds: typing.Optional[typing.Sequence[NumberType]] = None,
        debounce: typing.Optional[NumberType] = None,
        projection: typing.Optional[str] = None,
        proj4Defs: typing.Optional[typing.Sequence["Proj4Defs"]] = None,
        style: typing.Optional[typing.Any] = None,
        clickData: typing.Optional[dict] = None,
        bbox: typing.Optional[typing.Sequence[NumberType]] = None,
        undo: typing.Optional[NumberType] = None,
        redo: typing.Optional[NumberType] = None,
        canUndo: typing.Optional[bool] = None,
        canRedo: typing.Optional[bool] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'children', 'center', 'zoom', 'bounds', 'debounce', 'projection', 'proj4Defs', 'style', 'clickData', 'bbox', 'undo', 'redo', 'canUndo', 'canRedo']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'children', 'center', 'zoom', 'bounds', 'debounce', 'projection', 'proj4Defs', 'style', 'clickData', 'bbox', 'undo', 'redo', 'canUndo', 'canRedo']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        super(Map, self).__init__(children=children, **args)

setattr(Map, "__init__", _explicitize_args(Map.__init__))
