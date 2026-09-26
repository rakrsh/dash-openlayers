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
