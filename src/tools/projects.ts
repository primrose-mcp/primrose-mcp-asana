/**
 * Project Tools
 *
 * MCP tools for project management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all project-related tools
 */
export function registerProjectTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Project
  // ===========================================================================
  server.tool(
    'asana_create_project',
    `Create a new project.

Args:
  - name: Project name (required)
  - workspace: Workspace GID (required if team not provided)
  - team: Team GID (required if workspace not provided)
  - public: Whether project is public to organization
  - color: Project color
  - notes: Project description
  - dueOn: Due date (YYYY-MM-DD)
  - startOn: Start date (YYYY-MM-DD)
  - defaultView: Default view (list, board, calendar, timeline)`,
    {
      name: z.string().describe('Project name'),
      workspace: z.string().optional().describe('Workspace GID'),
      team: z.string().optional().describe('Team GID'),
      public: z.boolean().optional().describe('Whether project is public'),
      color: z.string().optional().describe('Project color'),
      notes: z.string().optional().describe('Project description'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      startOn: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      defaultView: z.enum(['list', 'board', 'calendar', 'timeline']).optional().describe('Default view'),
    },
    async ({ name, workspace, team, public: isPublic, color, notes, dueOn, startOn, defaultView }) => {
      try {
        const project = await client.createProject({
          name,
          workspace,
          team,
          public: isPublic,
          color,
          notes,
          due_on: dueOn,
          start_on: startOn,
          default_view: defaultView,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project created', project }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Project
  // ===========================================================================
  server.tool(
    'asana_get_project',
    `Get details of a specific project.

Args:
  - projectGid: The project's globally unique identifier`,
    {
      projectGid: z.string().describe('The project GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectGid, format }) => {
      try {
        const project = await client.getProject(projectGid);
        return formatResponse(project, format, 'project');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Project
  // ===========================================================================
  server.tool(
    'asana_update_project',
    `Update a project.

Args:
  - projectGid: The project GID
  - name: New project name
  - public: Whether project is public
  - color: Project color
  - notes: Project description
  - archived: Whether project is archived
  - dueOn: Due date (YYYY-MM-DD or null to clear)
  - startOn: Start date (YYYY-MM-DD or null to clear)`,
    {
      projectGid: z.string().describe('The project GID'),
      name: z.string().optional().describe('New project name'),
      public: z.boolean().optional().describe('Whether project is public'),
      color: z.string().optional().describe('Project color'),
      notes: z.string().optional().describe('Project description'),
      archived: z.boolean().optional().describe('Whether project is archived'),
      dueOn: z.string().nullable().optional().describe('Due date (YYYY-MM-DD or null)'),
      startOn: z.string().nullable().optional().describe('Start date (YYYY-MM-DD or null)'),
    },
    async ({ projectGid, name, public: isPublic, color, notes, archived, dueOn, startOn }) => {
      try {
        const project = await client.updateProject(projectGid, {
          name,
          public: isPublic,
          color,
          notes,
          archived,
          due_on: dueOn,
          start_on: startOn,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project updated', project }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Project
  // ===========================================================================
  server.tool(
    'asana_delete_project',
    `Delete a project.

Args:
  - projectGid: The project GID to delete`,
    {
      projectGid: z.string().describe('The project GID'),
    },
    async ({ projectGid }) => {
      try {
        await client.deleteProject(projectGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Duplicate Project
  // ===========================================================================
  server.tool(
    'asana_duplicate_project',
    `Duplicate a project.

Args:
  - projectGid: The project GID to duplicate
  - name: Name for the new project
  - team: Team GID for the new project (optional)
  - include: What to include (forms, members, notes, task_assignee, task_attachments, task_dates, task_dependencies, task_followers, task_notes, task_projects, task_subtasks, task_tags)`,
    {
      projectGid: z.string().describe('The project GID to duplicate'),
      name: z.string().describe('Name for the new project'),
      team: z.string().optional().describe('Team GID for the new project'),
      include: z.array(z.string()).optional().describe('What to include in duplication'),
    },
    async ({ projectGid, name, team, include }) => {
      try {
        const result = await client.duplicateProject(projectGid, name, { team, include });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project duplicated', newProject: result.new_project }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Projects
  // ===========================================================================
  server.tool(
    'asana_list_projects',
    `List projects in a workspace or team.

Args:
  - workspace: Workspace GID (optional, required if team not provided)
  - team: Team GID (optional)
  - archived: Include archived projects`,
    {
      workspace: z.string().optional().describe('Workspace GID'),
      team: z.string().optional().describe('Team GID'),
      archived: z.boolean().optional().describe('Include archived projects'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspace, team, archived, limit, offset, format }) => {
      try {
        const result = await client.listProjects({ workspace, team, archived, limit, offset });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Project Task Counts
  // ===========================================================================
  server.tool(
    'asana_get_project_task_counts',
    `Get task counts for a project.

Args:
  - projectGid: The project GID`,
    {
      projectGid: z.string().describe('The project GID'),
    },
    async ({ projectGid }) => {
      try {
        const counts = await client.getProjectTaskCounts(projectGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify(counts, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Members to Project
  // ===========================================================================
  server.tool(
    'asana_add_members_to_project',
    `Add members to a project.

Args:
  - projectGid: The project GID
  - memberGids: Array of user GIDs to add as members`,
    {
      projectGid: z.string().describe('The project GID'),
      memberGids: z.array(z.string()).describe('User GIDs to add'),
    },
    async ({ projectGid, memberGids }) => {
      try {
        const project = await client.addMembersToProject(projectGid, memberGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Members added to project', project }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Members from Project
  // ===========================================================================
  server.tool(
    'asana_remove_members_from_project',
    `Remove members from a project.

Args:
  - projectGid: The project GID
  - memberGids: Array of user GIDs to remove`,
    {
      projectGid: z.string().describe('The project GID'),
      memberGids: z.array(z.string()).describe('User GIDs to remove'),
    },
    async ({ projectGid, memberGids }) => {
      try {
        const project = await client.removeMembersFromProject(projectGid, memberGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Members removed from project', project }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Project Status
  // ===========================================================================
  server.tool(
    'asana_create_project_status',
    `Create a status update for a project.

Args:
  - projectGid: The project GID
  - text: Status text
  - color: Status color (green, yellow, red, blue)
  - title: Optional status title`,
    {
      projectGid: z.string().describe('The project GID'),
      text: z.string().describe('Status text'),
      color: z.enum(['green', 'yellow', 'red', 'blue']).describe('Status color'),
      title: z.string().optional().describe('Status title'),
    },
    async ({ projectGid, text, color, title }) => {
      try {
        const status = await client.createProjectStatus(projectGid, text, color, title);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project status created', status }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Project Statuses
  // ===========================================================================
  server.tool(
    'asana_list_project_statuses',
    `List status updates for a project.

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
        const result = await client.listProjectStatuses(projectGid, { limit, offset });
        return formatResponse(result, format, 'project_statuses');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
