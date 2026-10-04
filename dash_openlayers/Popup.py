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


class Popup(Component):
    """A Popup component.
Render Dash content in an OpenLayers overlay anchored to a map coordinate.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- children (a list of or a singular dash component, string or number; optional):
    Dash children rendered inside the overlay element.

- position (list of numbers; optional):
    Overlay position as [x, y] in the map view projection; None hides
    the popup.

- positioning (a value equal to: 'bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-center', 'center-right', 'top-left', 'top-center', 'top-right'; default 'bottom-center'):
    Overlay alignment relative to its position coordinate.

- offset (list of numbers; default [0, 0]):
    Pixel offset [x, y] applied to the overlay.

- autoPan (boolean; default False):
    Pan the map when positioning the overlay would place it outside
    the viewport.

- className (string; optional):
    CSS class applied to the popup content element."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'Popup'


    def __init__(
        self,
        children: typing.Optional[ComponentType] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        position: typing.Optional[typing.Sequence[NumberType]] = None,
        positioning: typing.Optional[Literal["bottom-left", "bottom-center", "bottom-right", "center-left", "center-center", "center-right", "top-left", "top-center", "top-right"]] = None,
        offset: typing.Optional[typing.Sequence[NumberType]] = None,
        autoPan: typing.Optional[bool] = None,
        className: typing.Optional[str] = None,
        style: typing.Optional[typing.Any] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'children', 'position', 'positioning', 'offset', 'autoPan', 'className', 'style']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'children', 'position', 'positioning', 'offset', 'autoPan', 'className', 'style']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        super(Popup, self).__init__(children=children, **args)

setattr(Popup, "__init__", _explicitize_args(Popup.__init__))
