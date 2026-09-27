import chromedriver_autoinstaller

# Ensure a matching chromedriver binary is available on the system before tests run.
# chromedriver_autoinstaller.install() downloads the driver if needed and returns
# the executable path. Import-time execution here ensures it's available for
# dash.testing's selenium webdriver when pytest starts.
chromedriver_autoinstaller.install()


def pytest_configure(config):
    # ensure dash[testing] fixtures are available
    config.addinivalue_line("markers", "integration: integration tests for dash apps")
