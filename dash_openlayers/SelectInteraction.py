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


class SelectInteraction(Component):
    """A SelectInteraction component.
Select vector features and report the current selection to Dash.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- layerId (string; optional):
    Dash ID of the vector layer to select from; omit to allow all
    selectable layers.

- selectedGeoJSON (dict; optional):
    Read-only: current selection as a GeoJSON FeatureCollection in
    EPSG:4326.

- selectedFeature (dict; optional):
    Read-only: first selected GeoJSON Feature in EPSG:4326, or None
    when nothing is selected."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'SelectInteraction'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        layerId: typing.Optional[str] = None,
        selectedGeoJSON: typing.Optional[dict] = None,
        selectedFeature: typing.Optional[dict] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'layerId', 'selectedGeoJSON', 'selectedFeature']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'layerId', 'selectedGeoJSON', 'selectedFeature']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(SelectInteraction, self).__init__(**args)

setattr(SelectInteraction, "__init__", _explicitize_args(SelectInteraction.__init__))
