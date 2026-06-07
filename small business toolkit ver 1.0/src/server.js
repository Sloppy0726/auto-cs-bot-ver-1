"use strict";

// MCP stdio server exposing the Small-Business Toolkit (~31 tools).
// Launch: `npm run mcp:smb` (from repo root) or via the root .mcp.json entry.

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const { REGISTRY } = require("./registry");
const { dispatch } = require("./dispatch");

function createServer() {
  const server = new Server(
    { name: "smb-toolkit", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: REGISTRY.map((t) => ({
      name: t.name,
      description: `[${t.category}${t.provider ? `/${t.provider}` : ""}] ${t.summary}`,
      inputSchema: t.inputSchema
    }))
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const result = await dispatch(req.params.name, req.params.arguments || {});
    return {
      isError: !result.ok,
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  });

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Stay alive on stdio; log to stderr so we don't corrupt the protocol stream.
  process.stderr.write(`smb-toolkit MCP server ready (${REGISTRY.length} tools)\n`);
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`smb-toolkit fatal: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}

module.exports = { createServer };
