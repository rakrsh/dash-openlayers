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


class LayerControl(Component):
    """A LayerControl component.
Layer visibility, opacity, and stacking-order controls for map layers.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- position (a value equal to: 'top-left', 'top-right', 'bottom-left', 'bottom-right'; default 'top-right'):
    Corner of the map where the control is displayed.

- title (string; default 'Layers'):
    Heading displayed above the layer controls."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'LayerControl'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        position: typing.Optional[Literal["top-left", "top-right", "bottom-left", "bottom-right"]] = None,
        title: typing.Optional[str] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'position', 'title']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'position', 'title']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(LayerControl, self).__init__(**args)

setattr(LayerControl, "__init__", _explicitize_args(LayerControl.__init__))
