/**
 * Asana MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It provides comprehensive access to the Asana API.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (access tokens) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Asana-Access-Token: Asana Personal Access Token or OAuth access token
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createAsanaClient } from './client.js';
import {
  registerAttachmentTools,
  registerCustomFieldTools,
  registerGoalTools,
  registerPortfolioTools,
  registerProjectTools,
  registerSectionTools,
  registerStoryTools,
  registerTagTools,
  registerTaskTools,
  registerTeamTools,
  registerTypeaheadTools,
  registerWebhookTools,
  registerWorkspaceTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-asana';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 */
export class AsanaMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Asana-Access-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createAsanaClient(credentials);

  // Register all tools
  registerWorkspaceTools(server, client);
  registerTeamTools(server, client);
  registerProjectTools(server, client);
  registerSectionTools(server, client);
  registerTaskTools(server, client);
  registerTagTools(server, client);
  registerStoryTools(server, client);
  registerAttachmentTools(server, client);
  registerCustomFieldTools(server, client);
  registerPortfolioTools(server, client);
  registerGoalTools(server, client);
  registerWebhookTools(server, client);
  registerTypeaheadTools(server, client);

  // Test connection tool
  server.tool('asana_test_connection', 'Test the connection to the Asana API', {}, async () => {
    try {
      const result = await client.testConnection();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Asana-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Asana MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass your Asana access token via request headers',
          required_headers: {
            'X-Asana-Access-Token': 'Asana Personal Access Token or OAuth access token',
          },
        },
        tools: [
          // Workspaces & Users
          'asana_list_workspaces', 'asana_get_workspace', 'asana_update_workspace',
          'asana_add_user_to_workspace', 'asana_remove_user_from_workspace',
          'asana_get_me', 'asana_get_user', 'asana_list_workspace_users',
          // Teams
          'asana_create_team', 'asana_get_team', 'asana_update_team',
          'asana_list_teams', 'asana_list_user_teams', 'asana_list_team_users',
          'asana_add_user_to_team', 'asana_remove_user_from_team',
          // Projects
          'asana_create_project', 'asana_get_project', 'asana_update_project',
          'asana_delete_project', 'asana_duplicate_project', 'asana_list_projects',
          'asana_get_project_task_counts', 'asana_add_members_to_project',
          'asana_remove_members_from_project', 'asana_create_project_status',
          'asana_list_project_statuses',
          // Sections
          'asana_create_section', 'asana_get_section', 'asana_update_section',
          'asana_delete_section', 'asana_list_project_sections',
          'asana_add_task_to_section', 'asana_move_section',
          // Tasks
          'asana_create_task', 'asana_get_task', 'asana_update_task',
          'asana_delete_task', 'asana_duplicate_task', 'asana_list_tasks',
          'asana_list_project_tasks', 'asana_list_section_tasks', 'asana_search_tasks',
          'asana_create_subtask', 'asana_list_subtasks', 'asana_set_parent_task',
          'asana_add_project_to_task', 'asana_remove_project_from_task',
          'asana_add_tag_to_task', 'asana_remove_tag_from_task',
          'asana_add_followers_to_task', 'asana_list_task_dependencies',
          'asana_add_task_dependencies', 'asana_remove_task_dependencies',
          'asana_list_task_dependents',
          // Tags
          'asana_create_tag', 'asana_get_tag', 'asana_update_tag',
          'asana_delete_tag', 'asana_list_tags', 'asana_list_task_tags',
          'asana_list_tag_tasks',
          // Stories (Comments)
          'asana_add_comment', 'asana_get_story', 'asana_update_comment',
          'asana_delete_comment', 'asana_list_task_stories',
          // Attachments
          'asana_get_attachment', 'asana_delete_attachment', 'asana_list_task_attachments',
          // Custom Fields
          'asana_create_custom_field', 'asana_get_custom_field', 'asana_update_custom_field',
          'asana_delete_custom_field', 'asana_list_custom_fields',
          'asana_add_custom_field_to_project', 'asana_remove_custom_field_from_project',
          // Portfolios
          'asana_create_portfolio', 'asana_get_portfolio', 'asana_update_portfolio',
          'asana_delete_portfolio', 'asana_list_portfolios', 'asana_list_portfolio_items',
          'asana_add_item_to_portfolio', 'asana_remove_item_from_portfolio',
          'asana_add_members_to_portfolio', 'asana_remove_members_from_portfolio',
          // Goals
          'asana_create_goal', 'asana_get_goal', 'asana_update_goal',
          'asana_delete_goal', 'asana_list_goals', 'asana_add_followers_to_goal',
          'asana_list_goal_parent_goals', 'asana_list_goal_relationships',
          'asana_add_supporting_relationship', 'asana_remove_supporting_relationship',
          // Webhooks
          'asana_create_webhook', 'asana_get_webhook', 'asana_update_webhook',
          'asana_delete_webhook', 'asana_list_webhooks',
          // Typeahead
          'asana_typeahead',
          // Connection
          'asana_test_connection',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
