/**
 * Typeahead Tools
 *
 * MCP tools for typeahead search functionality.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register typeahead-related tools
 */
export function registerTypeaheadTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Typeahead Search
  // ===========================================================================
  server.tool(
    'asana_typeahead',
    `Search for resources by name using typeahead.

This is useful for autocomplete functionality and finding resources quickly.

Args:
  - workspaceGid: The workspace GID to search in
  - resourceType: Type of resource to search for (custom_field, goal, portfolio, project, tag, task, team, user)
  - query: Search query string
  - count: Maximum number of results (default 10)`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      resourceType: z.enum(['custom_field', 'goal', 'portfolio', 'project', 'tag', 'task', 'team', 'user']).describe('Resource type to search'),
      query: z.string().describe('Search query'),
      count: z.number().int().min(1).max(100).optional().describe('Maximum results (default 10)'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, resourceType, query, count, format }) => {
      try {
        const results = await client.typeahead(workspaceGid, resourceType, query, count);
        return formatResponse({ data: results }, format, 'typeahead_results');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
