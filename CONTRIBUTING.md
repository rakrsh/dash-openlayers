# Contributing to dash-openlayers

This project uses **trunk-based development**. `main` is the trunk: it is always
kept in a releasable state, and all work merges back into it frequently through
short-lived branches.

## Branching policy

- `main` is the only long-lived branch. Do not create long-lived `develop`,
  `staging`, or release branches.
- All changes are made on short-lived feature branches cut from `main`, named
  with a `type/short-description` prefix:
  - `feat/...` — new functionality
  - `fix/...` — bug fixes
  - `chore/...` — maintenance, tooling, cleanup
  - `docs/...` — documentation only
- Keep branches small and short-lived (ideally merged within a day or two).
  Rebase on `main` regularly instead of letting a branch drift.
- `release/**` branches are allowed only as a short-lived exception for
  cutting/hardening a release; they should be deleted once merged/released.

## Merge rules for `main`

`main` is protected:

- All changes land via a pull request — direct pushes to `main` are blocked.
- The `build` and `package` CI status checks (from
  [ci.yml](.github/workflows/ci.yml)) must pass before a PR can be merged.
- Branches must be up to date with `main` before merging (`strict` status
  checks).
- History on `main` is linear — use **squash merge** or **rebase merge** when
  merging a PR, not a merge commit.
- Force-pushes and branch deletion are blocked on `main`.
- No mandatory reviewer count is enforced (solo/small-maintainer friendly),
  but PRs are still required so CI runs before anything lands on `main`.

Repo admins can bypass these rules only for genuine emergencies (e.g. reverting
a broken `main`) — this should be the exception, not the norm.

## Feature branch workflow example

```bash
# start from an up-to-date trunk
git checkout main
git pull

# create a short-lived feature branch
git checkout -b feat/tile-layer-component

# ... make changes, commit in small increments ...
git add .
git commit -m "feat: add TileLayer component"

# keep the branch current with main
git fetch origin
git rebase origin/main

# push and open a PR
git push -u origin feat/tile-layer-component
gh pr create --base main --fill

# after CI passes, squash-merge via the PR (GitHub UI or gh)
gh pr merge --squash
```

## Feature flags

Trunk-based development favors merging incomplete work behind a flag over
long-lived branches. For this project:

- **New/experimental components**: land the component but keep it out of the
  public API surface (don't export it from `src/index.js` / regenerate Python
  wrappers) until it's ready. This is the default "flag" for anything not
  export-ready.
- **New/experimental props on existing components**: default them to `False`/
  `None`/off so existing users see no behavior change, e.g.:

  ```javascript
  MapComponent.defaultProps = {
    // ...
    enableClustering: false, // experimental, opt-in only
  };
  ```

- **Runtime/CI-only toggles**: use an environment variable checked at import
  time or in `usage.py`/demo apps, e.g. `DASH_OPENLAYERS_EXPERIMENTAL=1`, so
  incomplete work can be merged to `main` and exercised in CI/demos without
  being enabled for end users by default.

Remove the flag/condition as soon as the feature is complete — flags are meant
to be temporary, not permanent configuration.

## Development setup

Dependencies are split into groups (`pyproject.toml` `[dependency-groups]`):
`test`, `build`, and `lint`; `dev` includes all three and is what `uv sync`
installs by default.

```bash
# install JS deps and build the JS bundles (needed before Python tests/imports)
npm install
npm run build

# install Python dev tooling (pytest, build, ruff, pre-commit)
uv sync

# install the git hook so checks run automatically on every commit
uv run pre-commit install
```

## AI-Assisted Development Guide

This repository provides a curated, safe workflow for using AI/code-assistant tools
to author components and tests while avoiding common OpenLayers/Dash pitfalls.

- Follow the repository invariants in `.cursorrules` (lifecycle, docstring, coordinate order).
- Run the AI quality gate locally before opening a PR:

```bash
# run static invariants (JSDoc + cleanup hooks)
npm run check-ai-invariants

# regenerate bundles + python wrappers and verify no generator drift
npm run build
git diff -- dash_openlayers
```

- Quick helpers (available as npm scripts):

```bash
npm run check-ai-invariants     # run the AST-based JSDoc & cleanup checks
npm run mcp-inspect-metadata    # (advanced) start the MCP validator helper
npm run mcp-validate-spatial    # (advanced) run the local GIS inspector
```

- Skills and local agent tools:
  - Use the `.agent/skills/scaffold-dash-ol-component` skill to scaffold new components that already follow JSDoc and cleanup rules.
  - Use `.agent/skills/gis-projection-validator` when adding new projections or coordinate-heavy code.
  - Use `.agent/skills/dash-duo-test-generator` to produce end-to-end `dash_duo` tests for interactive components.

- MCP tools: see `.mcp/config.json` and the `mcp/` helpers for programmatic checks
  (these are intended for AI agents and maintainers who want deterministic evidence
  from `dash_openlayers/metadata.json` or to pre-validate spatial fixtures).

If you are using an AI assistant, always run `npm run check-ai-invariants` and `npm run build`
and inspect the generated `dash_openlayers/` diff before committing — failing to do so makes
CI likely to reject the PR.


## Code style

- **Python**: [ruff](https://docs.astral.sh/ruff/) for linting and formatting
  (`uv run ruff check .`, `uv run ruff format .`). Generated code under
  `dash_openlayers/` (the Dash component wrappers and JS bundles) is excluded —
  it's regenerated by the Dash component generator / Rollup, not hand-edited.
- **JS/React**: [ESLint](eslint.config.js) + [Prettier](.prettierrc) for
  `src/` (`npm run lint`, `npm run format`).
- **Pre-commit**: [.pre-commit-config.yaml](.pre-commit-config.yaml) runs
  ruff, ESLint, Prettier, and generic hygiene checks (trailing whitespace,
  end-of-file, YAML/JSON validity, merge-conflict markers) both locally
  (`pre-commit install`) and in CI (the `lint` job in
  [ci.yml](.github/workflows/ci.yml)).

## Why no `setup.py`

This project is packaged entirely through `pyproject.toml` (PEP 621 metadata +
`setuptools.build_meta` as the PEP 517 build backend). A `setup.py` is not
needed:

- All metadata, dependencies, and package-data (JS bundles/JSON) are declared
  declaratively in `pyproject.toml`.
- `uv build` / `python -m build` already produce a correct wheel + sdist from
  this alone (verified in CI's `package` job).
- Adding a `setup.py` back would be redundant legacy boilerplate and a second
  source of truth for metadata — avoid it unless a future need arises for
  logic that genuinely can't be expressed declaratively (e.g. a compiled
  extension), which isn't the case here.
