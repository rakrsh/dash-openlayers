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


class ModifyInteraction(Component):
    """A ModifyInteraction component.
Allow editing vertices in a VectorLayer and report the updated features.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- layerId (string; optional):
    Dash ID of the VectorLayer to modify; defaults to the first vector
    layer on the map.

- snapToVertex (boolean; default True):
    Whether editing snaps to vector vertices.

- snapToEdge (boolean; default True):
    Whether editing snaps to vector edges.

- snapTolerance (number; default 10):
    Maximum snap distance in screen pixels.

- preserveTopology (boolean; default True):
    Revert polygon edits that introduce invalid topology.

- modifiedGeoJSON (dict; optional):
    Read-only: GeoJSON FeatureCollection of the target layer after a
    modify operation.

- modifiedWKT (string; optional):
    Read-only: WKT geometry collection of the target layer after
    modification.

- modifiedTopoJSON (dict; optional):
    Read-only: TopoJSON topology of the target layer after
    modification.

- geometryValidation (dict; optional):
    Read-only: topology validation result from the last modification."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'ModifyInteraction'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        layerId: typing.Optional[str] = None,
        snapToVertex: typing.Optional[bool] = None,
        snapToEdge: typing.Optional[bool] = None,
        snapTolerance: typing.Optional[NumberType] = None,
        preserveTopology: typing.Optional[bool] = None,
        modifiedGeoJSON: typing.Optional[dict] = None,
        modifiedWKT: typing.Optional[str] = None,
        modifiedTopoJSON: typing.Optional[dict] = None,
        geometryValidation: typing.Optional[dict] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'layerId', 'snapToVertex', 'snapToEdge', 'snapTolerance', 'preserveTopology', 'modifiedGeoJSON', 'modifiedWKT', 'modifiedTopoJSON', 'geometryValidation']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'layerId', 'snapToVertex', 'snapToEdge', 'snapTolerance', 'preserveTopology', 'modifiedGeoJSON', 'modifiedWKT', 'modifiedTopoJSON', 'geometryValidation']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(ModifyInteraction, self).__init__(**args)

setattr(ModifyInteraction, "__init__", _explicitize_args(ModifyInteraction.__init__))
