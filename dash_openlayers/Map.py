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


Keyword arguments:

- children (a list of or a singular dash component, string or number; optional)

- id (string; optional)

- center (list of numbers; default [0, 0])

- clickData (dict; optional)

- undo (number; optional): Increment to undo the latest Draw or Modify operation.

- redo (number; optional): Increment to redo the latest undone operation.

- canUndo (bool; optional): Read-only; whether an operation is available to undo.

- canRedo (bool; optional): Read-only; whether an operation is available to redo.

- proj4Defs (list of dicts; optional)

    `proj4Defs` is a list of dicts with keys:

    - code (string; required)

    - def (string; required)

- projection (string; default 'EPSG:3857')

- zoom (number; default 2)"""
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
        projection: typing.Optional[str] = None,
        proj4Defs: typing.Optional[typing.Sequence["Proj4Defs"]] = None,
        style: typing.Optional[typing.Any] = None,
        clickData: typing.Optional[dict] = None,
        undo: typing.Optional[NumberType] = None,
        redo: typing.Optional[NumberType] = None,
        canUndo: typing.Optional[bool] = None,
        canRedo: typing.Optional[bool] = None,
        **kwargs
    ):
        self._prop_names = ['children', 'id', 'center', 'clickData', 'proj4Defs', 'projection', 'style', 'zoom', 'undo', 'redo', 'canUndo', 'canRedo']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id', 'center', 'clickData', 'proj4Defs', 'projection', 'style', 'zoom', 'undo', 'redo', 'canUndo', 'canRedo']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        super(Map, self).__init__(children=children, **args)

setattr(Map, "__init__", _explicitize_args(Map.__init__))
