__version__ = '0.0.1'

try:
    from .dash_openlayers import *  # noqa: F401,F403
except Exception:
    # placeholder package during development
    pass
