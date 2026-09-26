Repository initialization: add minimal Dash component boilerplate scaffold.

This PR includes:
- Minimal `package.json` with a `build` script that writes a placeholder JS asset.
- `scripts/build.js` simple bundler placeholder.
- `src/` basic React component sources (`Map.react.js`, `DrawInteraction.react.js`).
- `dash_openlayers/` Python package stub and placeholder JS asset.
- `pyproject.toml` minimal package metadata.
- Updated `.gitignore`.

Linked issue: https://github.com/rakrsh/dash-openlayers/issues/1

Checklist for follow-up work (not in this PR):
- [ ] Replace placeholder build with a proper bundler (Rollup or Webpack) and produce a real UMD/ESM bundle.
- [ ] Generate Python wrappers using `@plotly/dash-component-boilerplate` and remove placeholder `dash_openlayers.min.js`.
- [ ] Clean up unused sample components from the boilerplate and add component tests.
- [ ] Add CI workflow for `npm install`, `npm run build`, and Python packaging.
- [ ] Add documentation and a `usage.py` demo.
