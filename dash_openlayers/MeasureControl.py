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


class MeasureControl(Component):
    """A MeasureControl component.
Draw lines and polygons with live geodesic length and area measurements.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this measurement control in Dash.

- units (a value equal to: 'metric', 'imperial'; default 'metric'):
    Measurement units: metric uses meters, kilometers, and hectares;
    imperial uses feet, miles, and acres.

- clearMeasurements (number; default 0):
    Increment to clear all completed and in-progress measurements.

- position (a value equal to: 'top-left', 'top-right', 'bottom-left', 'bottom-right'; default 'top-left'):
    Corner of the map where the measurement toolbar is displayed.

- title (string; default 'Measure'):
    Accessible toolbar label and visible heading."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'MeasureControl'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        units: typing.Optional[Literal["metric", "imperial"]] = None,
        clearMeasurements: typing.Optional[NumberType] = None,
        position: typing.Optional[Literal["top-left", "top-right", "bottom-left", "bottom-right"]] = None,
        title: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'units', 'clearMeasurements', 'position', 'title', 'style']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'units', 'clearMeasurements', 'position', 'title', 'style']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(MeasureControl, self).__init__(**args)

setattr(MeasureControl, "__init__", _explicitize_args(MeasureControl.__init__))
