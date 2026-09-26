from __future__ import print_function as _

import os as _os
import sys as _sys
import json

import dash as _dash

# Import generated component classes
from ._imports_ import *  # noqa: F401,F403
from ._imports_ import __all__

_basepath = _os.path.dirname(__file__)
_filepath = _os.path.abspath(_os.path.join(_basepath, 'package-info.json'))
with open(_filepath, encoding='utf-8') as f:
    package = json.load(f)

package_name = package.get('name', 'dash_openlayers').replace(' ', '_').replace('-', '_')
__version__ = package.get('version', '0.0.1')

_js_dist = [
    {
        'relative_package_path': 'dash_openlayers.umd.js',
        'namespace': package_name,
    },
    {
        'relative_package_path': 'dash_openlayers.esm.js',
        'namespace': package_name,
        'dynamic': False,
    },
]

_css_dist = []

for _component in __all__:
    setattr(locals()[_component], '_js_dist', _js_dist)
    setattr(locals()[_component], '_css_dist', _css_dist)
