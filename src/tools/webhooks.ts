/**
 * Webhook Tools
 *
 * MCP tools for webhook management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all webhook-related tools
 */
export function registerWebhookTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Webhook
  // ===========================================================================
  server.tool(
    'asana_create_webhook',
    `Create a webhook to receive notifications about changes to a resource.

Args:
  - resourceGid: The resource GID to watch (task, project, etc.)
  - target: The URL to receive webhook events
  - filters: Optional array of filter objects to filter events`,
    {
      resourceGid: z.string().describe('The resource GID to watch'),
      target: z.string().url().describe('The URL to receive webhook events'),
      filters: z.array(z.object({
        action: z.string().optional().describe('Event action (changed, added, removed, deleted)'),
        fields: z.array(z.string()).optional().describe('Fields to watch'),
        resourceSubtype: z.string().optional().describe('Resource subtype to filter'),
        resourceType: z.string().optional().describe('Resource type to filter'),
      })).optional().describe('Event filters'),
    },
    async ({ resourceGid, target, filters }) => {
      try {
        const mappedFilters = filters?.map(f => ({
          action: f.action,
          fields: f.fields,
          resource_subtype: f.resourceSubtype,
          resource_type: f.resourceType,
        }));
        const webhook = await client.createWebhook(resourceGid, target, mappedFilters);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Webhook created', webhook }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Webhook
  // ===========================================================================
  server.tool(
    'asana_get_webhook',
    `Get details of a specific webhook.

Args:
  - webhookGid: The webhook's globally unique identifier`,
    {
      webhookGid: z.string().describe('The webhook GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ webhookGid, format }) => {
      try {
        const webhook = await client.getWebhook(webhookGid);
        return formatResponse(webhook, format, 'webhook');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Webhook
  // ===========================================================================
  server.tool(
    'asana_update_webhook',
    `Update a webhook's filters.

Args:
  - webhookGid: The webhook GID
  - filters: New array of filter objects`,
    {
      webhookGid: z.string().describe('The webhook GID'),
      filters: z.array(z.object({
        action: z.string().optional().describe('Event action (changed, added, removed, deleted)'),
        fields: z.array(z.string()).optional().describe('Fields to watch'),
        resourceSubtype: z.string().optional().describe('Resource subtype to filter'),
        resourceType: z.string().optional().describe('Resource type to filter'),
      })).describe('New event filters'),
    },
    async ({ webhookGid, filters }) => {
      try {
        const mappedFilters = filters.map(f => ({
          action: f.action,
          fields: f.fields,
          resource_subtype: f.resourceSubtype,
          resource_type: f.resourceType,
        }));
        const webhook = await client.updateWebhook(webhookGid, mappedFilters);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Webhook updated', webhook }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Webhook
  // ===========================================================================
  server.tool(
    'asana_delete_webhook',
    `Delete a webhook.

Args:
  - webhookGid: The webhook GID to delete`,
    {
      webhookGid: z.string().describe('The webhook GID'),
    },
    async ({ webhookGid }) => {
      try {
        await client.deleteWebhook(webhookGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Webhook deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Webhooks
  // ===========================================================================
  server.tool(
    'asana_list_webhooks',
    `List webhooks in a workspace.

Args:
  - workspaceGid: The workspace GID
  - resourceGid: Filter by resource GID (optional)`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      resourceGid: z.string().optional().describe('Filter by resource GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, resourceGid, limit, offset, format }) => {
      try {
        const result = await client.listWebhooks(workspaceGid, resourceGid, { limit, offset });
        return formatResponse(result, format, 'webhooks');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
