# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401
from typing_extensions import TypedDict, NotRequired, Literal  # noqa: F401
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


class DrawInteraction(Component):
    """A DrawInteraction component.


    Keyword arguments:

    - id (string; optional)

    - drawnGeoJSON (dict; optional)

    - geometryValidation (dict; optional): Read-only validity, topology errors, and repair suggestions
        from the last draw. Invalid geometries are not emitted as drawnGeoJSON.

    - geometryType (a value equal to: 'Point', 'LineString', 'Polygon', 'Circle'; default 'Polygon')

    - snapToVertex (boolean; default True): Snap drawn coordinates to vector vertices.

    - snapToEdge (boolean; default True): Snap drawn coordinates to vector edges.

    - snapTolerance (number; default 10): Maximum snap distance in screen pixels."""

    _children_props: typing.List[str] = []
    _base_nodes = ["children"]
    _namespace = "dash_openlayers"
    _type = "DrawInteraction"

    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        geometryType: typing.Optional[Literal["Point", "LineString", "Polygon", "Circle"]] = None,
        drawnGeoJSON: typing.Optional[dict] = None,
        geometryValidation: typing.Optional[dict] = None,
        snapToVertex: typing.Optional[bool] = None,
        snapToEdge: typing.Optional[bool] = None,
        snapTolerance: typing.Optional[NumberType] = None,
        **kwargs,
    ):
        self._prop_names = [
            "id",
            "drawnGeoJSON",
            "geometryType",
            "geometryValidation",
            "snapToVertex",
            "snapToEdge",
            "snapTolerance",
        ]
        self._valid_wildcard_attributes = []
        self.available_properties = [
            "id",
            "drawnGeoJSON",
            "geometryType",
            "geometryValidation",
            "snapToVertex",
            "snapToEdge",
            "snapTolerance",
        ]
        self.available_wildcard_properties = []
        _explicit_args = kwargs.pop("_explicit_args")
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(DrawInteraction, self).__init__(**args)


setattr(DrawInteraction, "__init__", _explicitize_args(DrawInteraction.__init__))
