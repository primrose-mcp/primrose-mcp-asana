/**
 * Task Tools
 *
 * MCP tools for task management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all task-related tools
 */
export function registerTaskTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Task
  // ===========================================================================
  server.tool(
    'asana_create_task',
    `Create a new task.

Args:
  - name: Task name (required)
  - workspace: Workspace GID (required if not in a project)
  - projects: Array of project GIDs to add task to
  - assignee: User GID to assign task to
  - dueOn: Due date (YYYY-MM-DD)
  - dueAt: Due date and time (ISO 8601)
  - startOn: Start date (YYYY-MM-DD)
  - notes: Task description
  - htmlNotes: Task description in HTML
  - completed: Whether task is completed
  - tags: Array of tag GIDs
  - parent: Parent task GID (for subtasks)
  - resourceSubtype: Task type (default_task, milestone, approval)`,
    {
      name: z.string().describe('Task name'),
      workspace: z.string().optional().describe('Workspace GID'),
      projects: z.array(z.string()).optional().describe('Project GIDs'),
      assignee: z.string().optional().describe('Assignee user GID'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      dueAt: z.string().optional().describe('Due date and time (ISO 8601)'),
      startOn: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      notes: z.string().optional().describe('Task description'),
      htmlNotes: z.string().optional().describe('Task description in HTML'),
      completed: z.boolean().optional().describe('Whether task is completed'),
      tags: z.array(z.string()).optional().describe('Tag GIDs'),
      parent: z.string().optional().describe('Parent task GID'),
      resourceSubtype: z.enum(['default_task', 'milestone', 'approval']).optional().describe('Task type'),
    },
    async ({ name, workspace, projects, assignee, dueOn, dueAt, startOn, notes, htmlNotes, completed, tags, parent, resourceSubtype }) => {
      try {
        const task = await client.createTask({
          name,
          workspace,
          projects,
          assignee,
          due_on: dueOn,
          due_at: dueAt,
          start_on: startOn,
          notes,
          html_notes: htmlNotes,
          completed,
          tags,
          parent,
          resource_subtype: resourceSubtype,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task created', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Task
  // ===========================================================================
  server.tool(
    'asana_get_task',
    `Get details of a specific task.

Args:
  - taskGid: The task's globally unique identifier
  - optFields: Optional fields to include (e.g., notes, assignee.name, projects.name)`,
    {
      taskGid: z.string().describe('The task GID'),
      optFields: z.array(z.string()).optional().describe('Optional fields to include'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ taskGid, optFields, format }) => {
      try {
        const task = await client.getTask(taskGid, optFields);
        return formatResponse(task, format, 'task');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Task
  // ===========================================================================
  server.tool(
    'asana_update_task',
    `Update a task.

Args:
  - taskGid: The task GID
  - name: New task name
  - assignee: New assignee user GID (or null to unassign)
  - dueOn: New due date (YYYY-MM-DD or null to clear)
  - dueAt: New due date and time (ISO 8601 or null to clear)
  - startOn: New start date (YYYY-MM-DD or null to clear)
  - notes: New task description
  - htmlNotes: New task description in HTML
  - completed: Whether task is completed`,
    {
      taskGid: z.string().describe('The task GID'),
      name: z.string().optional().describe('New task name'),
      assignee: z.string().nullable().optional().describe('New assignee user GID'),
      dueOn: z.string().nullable().optional().describe('New due date (YYYY-MM-DD)'),
      dueAt: z.string().nullable().optional().describe('New due date and time (ISO 8601)'),
      startOn: z.string().nullable().optional().describe('New start date (YYYY-MM-DD)'),
      notes: z.string().optional().describe('New task description'),
      htmlNotes: z.string().optional().describe('New task description in HTML'),
      completed: z.boolean().optional().describe('Whether task is completed'),
    },
    async ({ taskGid, name, assignee, dueOn, dueAt, startOn, notes, htmlNotes, completed }) => {
      try {
        const task = await client.updateTask(taskGid, {
          name,
          assignee,
          due_on: dueOn,
          due_at: dueAt,
          start_on: startOn,
          notes,
          html_notes: htmlNotes,
          completed,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task updated', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Task
  // ===========================================================================
  server.tool(
    'asana_delete_task',
    `Delete a task.

Args:
  - taskGid: The task GID to delete`,
    {
      taskGid: z.string().describe('The task GID'),
    },
    async ({ taskGid }) => {
      try {
        await client.deleteTask(taskGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Duplicate Task
  // ===========================================================================
  server.tool(
    'asana_duplicate_task',
    `Duplicate a task.

Args:
  - taskGid: The task GID to duplicate
  - name: Name for the duplicated task
  - include: What to include (assignee, attachments, dates, dependencies, followers, notes, parent, projects, subtasks, tags)`,
    {
      taskGid: z.string().describe('The task GID to duplicate'),
      name: z.string().describe('Name for the duplicated task'),
      include: z.array(z.string()).optional().describe('What to include in duplication'),
    },
    async ({ taskGid, name, include }) => {
      try {
        const task = await client.duplicateTask(taskGid, name, include);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task duplicated', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Tasks
  // ===========================================================================
  server.tool(
    'asana_list_tasks',
    `List tasks with various filters.

Args:
  - project: Filter by project GID
  - section: Filter by section GID
  - workspace: Filter by workspace GID (requires assignee)
  - assignee: Filter by assignee user GID
  - completedSince: Only return tasks completed since this time (ISO 8601)
  - modifiedSince: Only return tasks modified since this time (ISO 8601)`,
    {
      project: z.string().optional().describe('Filter by project GID'),
      section: z.string().optional().describe('Filter by section GID'),
      workspace: z.string().optional().describe('Filter by workspace GID'),
      assignee: z.string().optional().describe('Filter by assignee user GID'),
      completedSince: z.string().optional().describe('Only return tasks completed since (ISO 8601)'),
      modifiedSince: z.string().optional().describe('Only return tasks modified since (ISO 8601)'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ project, section, workspace, assignee, completedSince, modifiedSince, limit, offset, format }) => {
      try {
        const result = await client.listTasks({
          project,
          section,
          workspace,
          assignee,
          completed_since: completedSince,
          modified_since: modifiedSince,
          limit,
          offset,
        });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Project Tasks
  // ===========================================================================
  server.tool(
    'asana_list_project_tasks',
    `List all tasks in a project.

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
        const result = await client.listProjectTasks(projectGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Section Tasks
  // ===========================================================================
  server.tool(
    'asana_list_section_tasks',
    `List all tasks in a section.

Args:
  - sectionGid: The section GID`,
    {
      sectionGid: z.string().describe('The section GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ sectionGid, limit, offset, format }) => {
      try {
        const result = await client.listSectionTasks(sectionGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Tasks
  // ===========================================================================
  server.tool(
    'asana_search_tasks',
    `Search for tasks in a workspace.

Args:
  - workspaceGid: The workspace GID (required)
  - text: Text to search for
  - completed: Filter by completion status
  - assigneeAny: Filter by assignee (comma-separated user GIDs)
  - projectsAny: Filter by projects (comma-separated project GIDs)
  - tagsAny: Filter by tags (comma-separated tag GIDs)
  - dueOnBefore: Filter by due date before (YYYY-MM-DD)
  - dueOnAfter: Filter by due date after (YYYY-MM-DD)
  - sortBy: Sort by (due_date, created_at, completed_at, likes, modified_at)
  - sortAscending: Sort in ascending order`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      text: z.string().optional().describe('Text to search for'),
      completed: z.boolean().optional().describe('Filter by completion status'),
      assigneeAny: z.string().optional().describe('Filter by assignee GIDs (comma-separated)'),
      projectsAny: z.string().optional().describe('Filter by project GIDs (comma-separated)'),
      tagsAny: z.string().optional().describe('Filter by tag GIDs (comma-separated)'),
      dueOnBefore: z.string().optional().describe('Due date before (YYYY-MM-DD)'),
      dueOnAfter: z.string().optional().describe('Due date after (YYYY-MM-DD)'),
      sortBy: z.enum(['due_date', 'created_at', 'completed_at', 'likes', 'modified_at']).optional().describe('Sort by'),
      sortAscending: z.boolean().optional().describe('Sort ascending'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, text, completed, assigneeAny, projectsAny, tagsAny, dueOnBefore, dueOnAfter, sortBy, sortAscending, limit, offset, format }) => {
      try {
        const result = await client.searchTasks(workspaceGid, {
          text,
          completed,
          'assignee.any': assigneeAny,
          'projects.any': projectsAny,
          'tags.any': tagsAny,
          'due_on.before': dueOnBefore,
          'due_on.after': dueOnAfter,
          sort_by: sortBy,
          sort_ascending: sortAscending,
          limit,
          offset,
        });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Subtask
  // ===========================================================================
  server.tool(
    'asana_create_subtask',
    `Create a subtask under a parent task.

Args:
  - parentTaskGid: The parent task GID
  - name: Subtask name
  - assignee: Assignee user GID
  - dueOn: Due date (YYYY-MM-DD)
  - notes: Subtask description`,
    {
      parentTaskGid: z.string().describe('The parent task GID'),
      name: z.string().describe('Subtask name'),
      assignee: z.string().optional().describe('Assignee user GID'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      notes: z.string().optional().describe('Subtask description'),
    },
    async ({ parentTaskGid, name, assignee, dueOn, notes }) => {
      try {
        const task = await client.createSubtask(parentTaskGid, {
          name,
          assignee,
          due_on: dueOn,
          notes,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Subtask created', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Subtasks
  // ===========================================================================
  server.tool(
    'asana_list_subtasks',
    `List subtasks of a task.

Args:
  - taskGid: The parent task GID`,
    {
      taskGid: z.string().describe('The parent task GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ taskGid, limit, offset, format }) => {
      try {
        const result = await client.listSubtasks(taskGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Set Parent Task
  // ===========================================================================
  server.tool(
    'asana_set_parent_task',
    `Set or change the parent of a task.

Args:
  - taskGid: The task GID
  - parentGid: The new parent task GID (or null to remove parent)
  - insertBefore: Subtask GID to insert before
  - insertAfter: Subtask GID to insert after`,
    {
      taskGid: z.string().describe('The task GID'),
      parentGid: z.string().nullable().describe('The new parent task GID'),
      insertBefore: z.string().optional().describe('Subtask GID to insert before'),
      insertAfter: z.string().optional().describe('Subtask GID to insert after'),
    },
    async ({ taskGid, parentGid, insertBefore, insertAfter }) => {
      try {
        const task = await client.setParentTask(taskGid, parentGid, insertBefore, insertAfter);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Parent task set', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Project to Task
  // ===========================================================================
  server.tool(
    'asana_add_project_to_task',
    `Add a task to a project.

Args:
  - taskGid: The task GID
  - projectGid: The project GID
  - sectionGid: Section GID within the project (optional)`,
    {
      taskGid: z.string().describe('The task GID'),
      projectGid: z.string().describe('The project GID'),
      sectionGid: z.string().optional().describe('Section GID'),
    },
    async ({ taskGid, projectGid, sectionGid }) => {
      try {
        await client.addProjectToTask(taskGid, projectGid, sectionGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task added to project' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Project from Task
  // ===========================================================================
  server.tool(
    'asana_remove_project_from_task',
    `Remove a task from a project.

Args:
  - taskGid: The task GID
  - projectGid: The project GID`,
    {
      taskGid: z.string().describe('The task GID'),
      projectGid: z.string().describe('The project GID'),
    },
    async ({ taskGid, projectGid }) => {
      try {
        await client.removeProjectFromTask(taskGid, projectGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Task removed from project' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Tag to Task
  // ===========================================================================
  server.tool(
    'asana_add_tag_to_task',
    `Add a tag to a task.

Args:
  - taskGid: The task GID
  - tagGid: The tag GID`,
    {
      taskGid: z.string().describe('The task GID'),
      tagGid: z.string().describe('The tag GID'),
    },
    async ({ taskGid, tagGid }) => {
      try {
        await client.addTagToTask(taskGid, tagGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Tag added to task' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Tag from Task
  // ===========================================================================
  server.tool(
    'asana_remove_tag_from_task',
    `Remove a tag from a task.

Args:
  - taskGid: The task GID
  - tagGid: The tag GID`,
    {
      taskGid: z.string().describe('The task GID'),
      tagGid: z.string().describe('The tag GID'),
    },
    async ({ taskGid, tagGid }) => {
      try {
        await client.removeTagFromTask(taskGid, tagGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Tag removed from task' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Followers to Task
  // ===========================================================================
  server.tool(
    'asana_add_followers_to_task',
    `Add followers to a task.

Args:
  - taskGid: The task GID
  - followerGids: Array of user GIDs to add as followers`,
    {
      taskGid: z.string().describe('The task GID'),
      followerGids: z.array(z.string()).describe('User GIDs to add as followers'),
    },
    async ({ taskGid, followerGids }) => {
      try {
        const task = await client.addFollowersToTask(taskGid, followerGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Followers added to task', task }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Task Dependencies
  // ===========================================================================
  server.tool(
    'asana_list_task_dependencies',
    `List tasks that this task depends on.

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
        const result = await client.listTaskDependencies(taskGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Task Dependencies
  // ===========================================================================
  server.tool(
    'asana_add_task_dependencies',
    `Add dependencies to a task (tasks that must be completed first).

Args:
  - taskGid: The task GID
  - dependencyGids: Array of task GIDs that this task depends on`,
    {
      taskGid: z.string().describe('The task GID'),
      dependencyGids: z.array(z.string()).describe('Task GIDs that this task depends on'),
    },
    async ({ taskGid, dependencyGids }) => {
      try {
        await client.addTaskDependencies(taskGid, dependencyGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Dependencies added to task' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Task Dependencies
  // ===========================================================================
  server.tool(
    'asana_remove_task_dependencies',
    `Remove dependencies from a task.

Args:
  - taskGid: The task GID
  - dependencyGids: Array of task GIDs to remove as dependencies`,
    {
      taskGid: z.string().describe('The task GID'),
      dependencyGids: z.array(z.string()).describe('Task GIDs to remove as dependencies'),
    },
    async ({ taskGid, dependencyGids }) => {
      try {
        await client.removeTaskDependencies(taskGid, dependencyGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Dependencies removed from task' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Task Dependents
  // ===========================================================================
  server.tool(
    'asana_list_task_dependents',
    `List tasks that depend on this task.

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
        const result = await client.listTaskDependents(taskGid, { limit, offset });
        return formatResponse(result, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
