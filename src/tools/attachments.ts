/**
 * Attachment Tools
 *
 * MCP tools for managing attachments on tasks.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all attachment-related tools
 */
export function registerAttachmentTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Get Attachment
  // ===========================================================================
  server.tool(
    'asana_get_attachment',
    `Get details of a specific attachment.

Args:
  - attachmentGid: The attachment's globally unique identifier`,
    {
      attachmentGid: z.string().describe('The attachment GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ attachmentGid, format }) => {
      try {
        const attachment = await client.getAttachment(attachmentGid);
        return formatResponse(attachment, format, 'attachment');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Attachment
  // ===========================================================================
  server.tool(
    'asana_delete_attachment',
    `Delete an attachment from a task.

Args:
  - attachmentGid: The attachment GID to delete`,
    {
      attachmentGid: z.string().describe('The attachment GID'),
    },
    async ({ attachmentGid }) => {
      try {
        await client.deleteAttachment(attachmentGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Attachment deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Task Attachments
  // ===========================================================================
  server.tool(
    'asana_list_task_attachments',
    `List all attachments on a task.

Args:
  - taskGid: The task GID`,
    {
      taskGid: z.string().describe('The task GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ taskGid, limit, offset, format }) => {
      try {
        const result = await client.listTaskAttachments(taskGid, { limit, offset });
        return formatResponse(result, format, 'attachments');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
