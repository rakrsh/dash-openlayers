'use strict';

/**
 * Dash Build & AST Validation MCP server.
 *
 * Gives an AI agent direct, deterministic access to the real build output
 * instead of guessing: it can trigger `npm run build` and inspect the
 * generated `dash_openlayers/metadata.json` to confirm Python prop
 * generation (and JSDoc-derived descriptions) without hallucinating.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createServer } = require('./lib/stdio-rpc');

const REPO_ROOT = path.resolve(__dirname, '..');
const METADATA_PATH = path.join(REPO_ROOT, 'dash_openlayers', 'metadata.json');

function runDashBuild() {
  try {
    const stdout = execFileSync('npm', ['run', 'build'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
    return { success: true, output: stdout };
  } catch (err) {
    return {
      success: false,
      output: (err.stdout || '') + (err.stderr || ''),
      error: err.message,
    };
  }
}

function inspectMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error(
      `${path.relative(REPO_ROOT, METADATA_PATH)} not found — run the run_dash_build tool first.`,
    );
  }

  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  const components = [];

  for (const [file, entry] of Object.entries(metadata)) {
    const props = Object.entries(entry.props || {}).map(([propName, propEntry]) => ({
      name: propName,
      type: propEntry.type ? propEntry.type.name : 'unknown',
      required: !!propEntry.required,
      hasDescription: !!(propEntry.description && propEntry.description.trim()),
    }));

    const missingJsDoc = props.filter((p) => !p.hasDescription).map((p) => p.name);

    components.push({
      file,
      displayName: entry.displayName,
      props,
      missingJsDoc,
    });
  }

  const flagged = components.filter((c) => c.missingJsDoc.length > 0);

  return {
    metadataPath: path.relative(REPO_ROOT, METADATA_PATH),
    componentCount: components.length,
    components,
    jsDocInvariantViolations: flagged.map((c) => ({ file: c.file, missingJsDoc: c.missingJsDoc })),
  };
}

createServer({
  name: 'dash-openlayers-build-validator',
  version: '1.0.0',
  tools: [
    {
      name: 'run_dash_build',
      description:
        'Run `npm run build` in the repository root to regenerate the dash_openlayers/ Python ' +
        'wrapper, metadata.json, and JS bundles. Returns build stdout/stderr and success status.',
      inputSchema: { type: 'object', properties: {} },
      handler: runDashBuild,
    },
    {
      name: 'inspect_metadata',
      description:
        'Read dash_openlayers/metadata.json (react-docgen output) and report every component/prop ' +
        'discovered, flagging any propTypes entries whose JSDoc-derived description is empty — this ' +
        'is the exact evidence needed to confirm the Docstring Invariant instead of guessing.',
      inputSchema: { type: 'object', properties: {} },
      handler: inspectMetadata,
    },
  ],
});
