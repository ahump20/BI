#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const HAWKEYE_API_BASE = 'https://api.hawkeyeinnovations.com';

class HawkEyeInnovationsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'hawkeye-innovations',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'proxyRequest',
            description: 'Proxy requests to the Hawk-Eye Innovations API',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string',
                  description: 'API endpoint path, e.g., "events" or "matches/123"',
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST'],
                  default: 'GET',
                },
                query: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  description: 'Query string parameters',
                },
                body: {
                  type: 'object',
                  description: 'JSON body for POST requests',
                },
              },
              required: ['endpoint'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'proxyRequest':
          return this.proxyRequest(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async proxyRequest(args) {
    try {
      const { endpoint, method = 'GET', query, body } = args;
      const url = new URL(`${HAWKEYE_API_BASE}/${endpoint}`);
      if (query && typeof query === 'object') {
        for (const [key, value] of Object.entries(query)) {
          url.searchParams.set(key, String(value));
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed with ${res.status}: ${text}`);
      }

      const data = await res.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hawk-Eye Innovations MCP server running on stdio');
  }
}

const server = new HawkEyeInnovationsServer();
server.run().catch(console.error);

