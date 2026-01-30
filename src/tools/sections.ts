/**
 * Section Tools
 *
 * MCP tools for project section management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all section-related tools
 */
export function registerSectionTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Section
  // ===========================================================================
  server.tool(
    'asana_create_section',
    `Create a new section in a project.

Args:
  - projectGid: The project GID
  - name: Section name
  - insertBefore: Section GID to insert before (optional)
  - insertAfter: Section GID to insert after (optional)`,
    {
      projectGid: z.string().describe('The project GID'),
      name: z.string().describe('Section name'),
      insertBefore: z.string().optional().describe('Section GID to insert before'),
      insertAfter: z.string().optional().describe('Section GID to insert after'),
    },
    async ({ projectGid, name, insertBefore, insertAfter }) => {
      try {
        const section = await client.createSection(projectGid, name, insertBefore, insertAfter);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Section created', section }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Section
  // ===========================================================================
  server.tool(
    'asana_get_section',
    `Get details of a specific section.

Args:
  - sectionGid: The section's globally unique identifier`,
    {
      sectionGid: z.string().describe('The section GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sectionGid, format }) => {
      try {
        const section = await client.getSection(sectionGid);
        return formatResponse(section, format, 'section');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Section
  // ===========================================================================
  server.tool(
    'asana_update_section',
    `Update a section's name.

Args:
  - sectionGid: The section GID
  - name: New section name`,
    {
      sectionGid: z.string().describe('The section GID'),
      name: z.string().describe('New section name'),
    },
    async ({ sectionGid, name }) => {
      try {
        const section = await client.updateSection(sectionGid, name);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Section updated', section }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Section
  // ===========================================================================
  server.tool(
    'asana_delete_section',
    `Delete a section.

Args:
  - sectionGid: The section GID to delete`,
    {
      sectionGid: z.string().describe('The section GID'),
    },
    async ({ sectionGid }) => {
      try {
        await client.deleteSection(sectionGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Section deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Project Sections
  // ===========================================================================
  server.tool(
    'asana_list_project_sections',
    `List all sections in a project.

Args:
  - projectGid: The project GID`,
    {
      projectGid: z.string().describe('The project GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectGid, limit, offset, format }) => {
      try {
        const result = await client.listProjectSections(projectGid, { limit, offset });
        return formatResponse(result, format, 'sections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Task to Section
  // ===========================================================================
  server.tool(
    'asana_add_task_to_section',
    `Add a task to a section.

Args:
  - sectionGid: The section GID
  - taskGid: The task GID to add
  - insertBefore: Task GID to insert before (optional)
  - insertAfter: Task GID to insert after (optional)`,
    {
      sectionGid: z.string().describe('The section GID'),
      taskGid: z.string().describe('The task GID'),
      insertBefore: z.string().optional().describe('Task GID to insert before'),
      insertAfter: z.string().optional().describe('Task GID to insert after'),
    },
    async ({ sectionGid, taskGid, insertBefore, insertAfter }) => {
      try {
        await client.addTaskToSection(sectionGid, taskGid, insertBefore, insertAfter);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task added to section' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Move Section
  // ===========================================================================
  server.tool(
    'asana_move_section',
    `Move a section within a project.

Args:
  - projectGid: The project GID
  - sectionGid: The section GID to move
  - beforeSection: Section GID to insert before (optional)
  - afterSection: Section GID to insert after (optional)`,
    {
      projectGid: z.string().describe('The project GID'),
      sectionGid: z.string().describe('The section GID to move'),
      beforeSection: z.string().optional().describe('Section GID to insert before'),
      afterSection: z.string().optional().describe('Section GID to insert after'),
    },
    async ({ projectGid, sectionGid, beforeSection, afterSection }) => {
      try {
        await client.moveSection(projectGid, sectionGid, beforeSection, afterSection);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Section moved' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
