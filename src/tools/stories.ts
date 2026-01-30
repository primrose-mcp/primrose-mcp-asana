/**
 * Story Tools (Comments & Activity)
 *
 * MCP tools for managing comments and activity on tasks.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all story-related tools
 */
export function registerStoryTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Story (Add Comment)
  // ===========================================================================
  server.tool(
    'asana_add_comment',
    `Add a comment to a task.

Args:
  - taskGid: The task GID
  - text: Comment text
  - isPinned: Whether to pin the comment
  - stickerName: Name of sticker to add (optional)`,
    {
      taskGid: z.string().describe('The task GID'),
      text: z.string().describe('Comment text'),
      isPinned: z.boolean().optional().describe('Whether to pin the comment'),
      stickerName: z.string().optional().describe('Sticker name'),
    },
    async ({ taskGid, text, isPinned, stickerName }) => {
      try {
        const story = await client.createStory(taskGid, text, isPinned, stickerName);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Comment added', story }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Story
  // ===========================================================================
  server.tool(
    'asana_get_story',
    `Get details of a specific story (comment or activity).

Args:
  - storyGid: The story's globally unique identifier`,
    {
      storyGid: z.string().describe('The story GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ storyGid, format }) => {
      try {
        const story = await client.getStory(storyGid);
        return formatResponse(story, format, 'story');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Story
  // ===========================================================================
  server.tool(
    'asana_update_comment',
    `Update a comment on a task.

Args:
  - storyGid: The story GID
  - text: New comment text
  - isPinned: Whether to pin the comment
  - stickerName: Name of sticker to add`,
    {
      storyGid: z.string().describe('The story GID'),
      text: z.string().describe('New comment text'),
      isPinned: z.boolean().optional().describe('Whether to pin the comment'),
      stickerName: z.string().optional().describe('Sticker name'),
    },
    async ({ storyGid, text, isPinned, stickerName }) => {
      try {
        const story = await client.updateStory(storyGid, text, isPinned, stickerName);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Comment updated', story }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Story
  // ===========================================================================
  server.tool(
    'asana_delete_comment',
    `Delete a comment from a task.

Args:
  - storyGid: The story GID to delete`,
    {
      storyGid: z.string().describe('The story GID'),
    },
    async ({ storyGid }) => {
      try {
        await client.deleteStory(storyGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Comment deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Task Stories
  // ===========================================================================
  server.tool(
    'asana_list_task_stories',
    `List all stories (comments and activity) on a task.

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
        const result = await client.listTaskStories(taskGid, { limit, offset });
        return formatResponse(result, format, 'stories');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
