"""
Pruebas manuales/integración para la API de media_files.

Se marcan como skip en pytest porque requieren un servidor en marcha.
Ejecutar manualmente si se desea probar contra un backend real.
"""

import pytest

pytestmark = pytest.mark.skip(reason="Integration script; requires running API server.")
