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


class ModifyInteraction(Component):
    """Allow editing vertices in a VectorLayer and report updated GeoJSON.


    Keyword arguments:

    - id (string; optional)

    - layerId (string; optional): Dash ID of the VectorLayer to modify; defaults
      to the first vector layer on the map.

    - modifiedGeoJSON (dict; optional): Read-only GeoJSON FeatureCollection
      emitted after a modify operation.
    """

    _children_props: typing.List[str] = []
    _base_nodes = ["children"]
    _namespace = "dash_openlayers"
    _type = "ModifyInteraction"

    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        layerId: typing.Optional[str] = None,
        modifiedGeoJSON: typing.Optional[dict] = None,
        **kwargs,
    ):
        self._prop_names = ["id", "layerId", "modifiedGeoJSON"]
        self._valid_wildcard_attributes = []
        self.available_properties = ["id", "layerId", "modifiedGeoJSON"]
        self.available_wildcard_properties = []
        _explicit_args = kwargs.pop("_explicit_args")
        _locals = locals()
        _locals.update(kwargs)
        args = {k: _locals[k] for k in _explicit_args}

        super(ModifyInteraction, self).__init__(**args)


setattr(ModifyInteraction, "__init__", _explicitize_args(ModifyInteraction.__init__))