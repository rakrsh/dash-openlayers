# Quickstart

Install and build the project for local development:

```bash
# install JS deps
npm install

# install Python dev requirements (editable install)
pip install -e .

# build JS components (if applicable)
npm run build

# run the example app
python usage.py
```

For publishing documentation the CI workflow will build the MkDocs site and deploy it to GitHub Pages.
