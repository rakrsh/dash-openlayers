import sys

import chromedriver_autoinstaller
from selenium.webdriver.chrome.options import Options as ChromeOptions

# Ensure a matching chromedriver binary is available on the system before tests run.
# chromedriver_autoinstaller.install() downloads the driver if needed and returns
# the executable path. Import-time execution here ensures it's available for
# dash.testing's selenium webdriver when pytest starts.
chromedriver_autoinstaller.install()


def pytest_configure(config):
    # ensure dash[testing] fixtures are available
    config.addinivalue_line("markers", "integration: integration tests for dash apps")


def pytest_setup_options():
    if not sys.platform.startswith("linux"):
        return None

    options = ChromeOptions()
    options.add_argument("--enable-webgl")
    options.add_argument("--ignore-gpu-blocklist")
    options.add_argument("--use-gl=angle")
    options.add_argument("--use-angle=swiftshader")
    options.add_argument("--enable-unsafe-swiftshader")
    return options
