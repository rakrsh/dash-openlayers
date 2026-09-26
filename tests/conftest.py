def pytest_configure(config):
    # ensure dash[testing] fixtures are available
    config.addinivalue_line("markers", "integration: integration tests for dash apps")
