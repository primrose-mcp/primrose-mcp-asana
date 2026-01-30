/**
 * Tag Tools
 *
 * MCP tools for tag management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all tag-related tools
 */
export function registerTagTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Tag
  // ===========================================================================
  server.tool(
    'asana_create_tag',
    `Create a new tag.

Args:
  - name: Tag name (required)
  - workspace: Workspace GID (required)
  - color: Tag color
  - notes: Tag description`,
    {
      name: z.string().describe('Tag name'),
      workspace: z.string().describe('Workspace GID'),
      color: z.string().optional().describe('Tag color'),
      notes: z.string().optional().describe('Tag description'),
    },
    async ({ name, workspace, color, notes }) => {
      try {
        const tag = await client.createTag({ name, workspace, color, notes });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Tag created', tag }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Tag
  // ===========================================================================
  server.tool(
    'asana_get_tag',
    `Get details of a specific tag.

Args:
  - tagGid: The tag's globally unique identifier`,
    {
      tagGid: z.string().describe('The tag GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ tagGid, format }) => {
      try {
        const tag = await client.getTag(tagGid);
        return formatResponse(tag, format, 'tag');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Tag
  // ===========================================================================
  server.tool(
    'asana_update_tag',
    `Update a tag.

Args:
  - tagGid: The tag GID
  - name: New tag name
  - color: New tag color
  - notes: New tag description`,
    {
      tagGid: z.string().describe('The tag GID'),
      name: z.string().optional().describe('New tag name'),
      color: z.string().optional().describe('New tag color'),
      notes: z.string().optional().describe('New tag description'),
    },
    async ({ tagGid, name, color, notes }) => {
      try {
        const tag = await client.updateTag(tagGid, { name, color, notes });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Tag updated', tag }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Tag
  // ===========================================================================
  server.tool(
    'asana_delete_tag',
    `Delete a tag.

Args:
  - tagGid: The tag GID to delete`,
    {
      tagGid: z.string().describe('The tag GID'),
    },
    async ({ tagGid }) => {
      try {
        await client.deleteTag(tagGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Tag deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Workspace Tags
  // ===========================================================================
  server.tool(
    'asana_list_tags',
    `List all tags in a workspace.

Args:
  - workspaceGid: The workspace GID`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, limit, offset, format }) => {
      try {
        const result = await client.listTags(workspaceGid, { limit, offset });
        return formatResponse(result, format, 'tags');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Task Tags
  // ===========================================================================
  server.tool(
    'asana_list_task_tags',
    `List all tags on a task.

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
        const result = await client.listTaskTags(taskGid, { limit, offset });
        return formatResponse(result, format, 'tags');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Tag Tasks
  // ===========================================================================
  server.tool(
    'asana_list_tag_tasks',
    `List all tasks with a specific tag.

Args:
  - tagGid: The tag GID`,
    {
      tagGid: z.string().describe('The tag GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ tagGid, limit, offset, format }) => {
      try {
        const result = await client.listTagTasks(tagGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
