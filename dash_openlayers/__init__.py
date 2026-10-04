from __future__ import print_function as _

import json
import os as _os
from collections.abc import Sequence as _Sequence
from functools import wraps as _wraps

from dash.development.base_component import Component as _Component

# Import generated component classes
from ._imports_ import *  # noqa: F401,F403
from ._imports_ import __all__
from .Map import Map as _GeneratedMap


def _validate_map_children(value, path="children"):
    if value is None or isinstance(value, (str, int, float, _Component)):
        return
    if isinstance(value, _Sequence) and not isinstance(value, (str, bytes, bytearray)):
        for index, child in enumerate(value):
            _validate_map_children(child, f"{path}[{index}]")
        return
    raise TypeError(
        "Map.children must contain Dash components, strings, numbers, or None; "
        f"found {type(value).__name__} at {path}."
    )


_generated_map_init = _GeneratedMap.__init__


@_wraps(_generated_map_init)
def _validated_map_init(self, *args, **kwargs):
    children = kwargs.get("children", args[0] if args else None)
    _validate_map_children(children)
    _generated_map_init(self, *args, **kwargs)


_GeneratedMap.__init__ = _validated_map_init

_basepath = _os.path.dirname(__file__)
_filepath = _os.path.abspath(_os.path.join(_basepath, 'package-info.json'))
with open(_filepath, encoding='utf-8') as f:
    package = json.load(f)

package_name = package.get('name', 'dash_openlayers').replace(' ', '_').replace('-', '_')
__version__ = package.get('version', '0.0.1')

# UMD only: Dash serves relative_package_path assets as plain <script> tags
# (no type="module"), so the ESM build can't be loaded this way.
_js_dist = [
    {
        'relative_package_path': 'dash_openlayers.umd.js',
        'namespace': package_name,
    },
]

_css_dist = []

for _component in __all__:
    _component_class = locals()[_component]
    _component_class._js_dist = _js_dist
    _component_class._css_dist = _css_dist
