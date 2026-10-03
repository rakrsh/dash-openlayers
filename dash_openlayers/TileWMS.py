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


class TileWMS(Component):
    """A TileWMS component.
Render a tiled OGC Web Map Service layer.

Keyword arguments:

- id (string; optional):
    Component ID used to identify this layer in the Dash layout.

- url (string; optional):
    OGC WMS endpoint URL.

- params (dict; optional):
    WMS request parameters, including LAYERS; changes refresh the
    source.

- serverType (a value equal to: 'carmentaserver', 'geoserver', 'mapserver', 'qgis'; optional):
    WMS server type used for vendor-specific HiDPI request parameters."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_openlayers'
    _type = 'TileWMS'


    def __init__(
        self,
        id: typing.Optional[typing.Union[str, dict]] = None,
        url: typing.Optional[str] = None,
        params: typing.Optional[dict] = None,
        serverType: typing.Optional[Literal["carmentaserver", "geoserver", "mapserver", "qgis"]] = None,
        **kwargs
    ):
        self._prop_names = ['id', 'url', 'params', 'serverType']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'url', 'params', 'serverType']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(TileWMS, self).__init__(**args)

setattr(TileWMS, "__init__", _explicitize_args(TileWMS.__init__))
