#!/usr/bin/env node
'use strict';

/**
 * AI Quality Gate — static invariant checks for dash-openlayers components.
 *
 * Enforces (see .cursorrules for the full rationale):
 *   1. Docstring invariant: every `propTypes` key has a leading `/** ... *\/`
 *      JSDoc block comment (react-docgen requires this to populate the
 *      generated Python docstrings).
 *   2. Lifecycle invariant: any `useEffect` whose body instantiates an
 *      OpenLayers object (imported from an `ol/*` module), or calls
 *      `map.addLayer/addInteraction/addControl/on(...)`, must end with a
 *      cleanup `return` function.
 *
 * Usage: node scripts/check-ai-invariants.js [path...]
 * Exits non-zero if any violation is found.
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGET = path.join(REPO_ROOT, 'src', 'lib', 'components');

const MAP_MUTATION_METHODS = new Set(['addLayer', 'addInteraction', 'addControl', 'on']);

function findReactFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findReactFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.react.js')) {
      results.push(full);
    }
  }
  return results;
}

function parseFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
    attachComment: true,
  });
  return { code, ast };
}

function hasJsDocBlock(node) {
  const comments = node.leadingComments || [];
  return comments.some((c) => c.type === 'CommentBlock' && c.value.trim().startsWith('*'));
}

function checkPropTypesDocs(ast, filePath, violations) {
  traverse(ast, {
    AssignmentExpression(nodePath) {
      const { left, right } = nodePath.node;
      const isPropTypesAssignment =
        left.type === 'MemberExpression' &&
        left.property.type === 'Identifier' &&
        left.property.name === 'propTypes';

      if (!isPropTypesAssignment || right.type !== 'ObjectExpression') return;

      for (const prop of right.properties) {
        if (prop.type !== 'ObjectProperty') continue;
        const keyName = prop.key.name || prop.key.value;
        if (!hasJsDocBlock(prop)) {
          violations.push({
            file: filePath,
            line: prop.loc.start.line,
            rule: 'docstring-invariant',
            message: `propTypes.${keyName} is missing a leading /** JSDoc */ block comment.`,
          });
        }
      }
    },
  });
}

function collectOlImportNames(ast) {
  const names = new Set();
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const source = nodePath.node.source.value;
      if (!source.startsWith('ol/') && source !== 'ol') return;
      for (const spec of nodePath.node.specifiers) {
        names.add(spec.local.name);
      }
    },
  });
  return names;
}

// Manual recursive walk (rather than re-entering @babel/traverse) so we can
// scan an arbitrary sub-tree (a single useEffect's body) in isolation.
function nodeContainsMapMutation(node, olImportNames, found = { value: false }) {
  if (!node || typeof node.type !== 'string' || found.value) return found.value;

  if (node.type === 'NewExpression') {
    const callee = node.callee;
    if (callee.type === 'Identifier' && olImportNames.has(callee.name)) {
      found.value = true;
      return true;
    }
  }

  if (node.type === 'CallExpression') {
    const callee = node.callee;
    if (
      callee.type === 'MemberExpression' &&
      callee.property.type === 'Identifier' &&
      MAP_MUTATION_METHODS.has(callee.property.name)
    ) {
      found.value = true;
      return true;
    }
  }

  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string' && nodeContainsMapMutation(item, olImportNames, found)) {
          return true;
        }
      }
    } else if (value && typeof value.type === 'string') {
      if (nodeContainsMapMutation(value, olImportNames, found)) return true;
    }
  }
  return found.value;
}

function checkEffectCleanup(ast, filePath, olImportNames, violations) {
  traverse(ast, {
    CallExpression(nodePath) {
      const { callee, arguments: args } = nodePath.node;
      if (callee.type !== 'Identifier' || callee.name !== 'useEffect') return;

      const [effectFn] = args;
      if (
        !effectFn ||
        (effectFn.type !== 'ArrowFunctionExpression' && effectFn.type !== 'FunctionExpression')
      ) {
        return;
      }
      if (effectFn.body.type !== 'BlockStatement') return; // implicit-return effects can't mutate + cleanup meaningfully

      if (!nodeContainsMapMutation(effectFn.body, olImportNames)) return;

      const statements = effectFn.body.body;
      const last = statements[statements.length - 1];
      const hasCleanupReturn =
        last &&
        last.type === 'ReturnStatement' &&
        last.argument &&
        (last.argument.type === 'ArrowFunctionExpression' || last.argument.type === 'FunctionExpression');

      if (!hasCleanupReturn) {
        violations.push({
          file: filePath,
          line: nodePath.node.loc.start.line,
          rule: 'lifecycle-cleanup-invariant',
          message:
            'useEffect creates/mutates an OpenLayers object (new ol/* instance, addLayer/addInteraction/' +
            'addControl/.on) but does not end with a cleanup `return () => { ... }`.',
        });
      }
    },
  });
}

function main(argv) {
  const targets = argv.length > 0 ? argv.map((p) => path.resolve(p)) : [DEFAULT_TARGET];
  const files = targets.flatMap((t) => (fs.statSync(t).isDirectory() ? findReactFiles(t) : [t]));

  const violations = [];
  for (const filePath of files) {
    const { ast } = parseFile(filePath);
    const relPath = path.relative(REPO_ROOT, filePath);
    const olImportNames = collectOlImportNames(ast);
    checkPropTypesDocs(ast, relPath, violations);
    checkEffectCleanup(ast, relPath, olImportNames, violations);
  }

  if (violations.length === 0) {
    console.log(`AI quality gate: OK (${files.length} file(s) checked, 0 violations).`);
    return 0;
  }

  console.error(`AI quality gate: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.message}`);
  }
  return 1;
}

process.exit(main(process.argv.slice(2)));
