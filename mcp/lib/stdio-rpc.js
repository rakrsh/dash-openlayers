'use strict';

/**
 * Minimal MCP (Model Context Protocol) stdio server helper.
 *
 * Implements just enough of the MCP JSON-RPC 2.0 stdio transport
 * (newline-delimited messages, no Content-Length framing) to expose a small
 * set of local tools to MCP-aware AI coding agents, without pulling in the
 * full `@modelcontextprotocol/sdk` dependency.
 */

const PROTOCOL_VERSION = '2024-11-05';

function createServer({ name, version, tools }) {
  let buffer = '';

  function send(message) {
    process.stdout.write(JSON.stringify(message) + '\n');
  }

  async function dispatch(method, params) {
    if (method === 'initialize') {
      return {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name, version },
      };
    }

    if (method === 'notifications/initialized' || method === 'ping') {
      return undefined;
    }

    if (method === 'tools/list') {
      return {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    }

    if (method === 'tools/call') {
      const tool = tools.find((candidate) => candidate.name === params.name);
      if (!tool) {
        throw new Error(`Unknown tool: ${params.name}`);
      }
      try {
        const result = await tool.handler(params.arguments || {});
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return { content: [{ type: 'text', text }], isError: false };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    }

    throw new Error(`Unsupported method: ${method}`);
  }

  function handleLine(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return; // ignore malformed frames rather than crashing the server
    }

    const { id, method, params } = message;
    dispatch(method, params)
      .then((result) => {
        if (id !== undefined) send({ jsonrpc: '2.0', id, result });
      })
      .catch((err) => {
        if (id !== undefined) {
          send({ jsonrpc: '2.0', id, error: { code: -32000, message: err.message } });
        }
      });
  }

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) handleLine(line);
    }
  });

  process.stdin.on('end', () => process.exit(0));
}

module.exports = { createServer };
