/**
 * Workspace & User Tools
 *
 * MCP tools for workspace and user management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all workspace and user-related tools
 */
export function registerWorkspaceTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // List Workspaces
  // ===========================================================================
  server.tool(
    'asana_list_workspaces',
    `List all workspaces and organizations accessible to the authenticated user.

Returns a list of workspaces with their GID, name, and whether they are an organization.`,
    {
      limit: z.number().int().min(1).max(100).optional().describe('Number of results to return (max 100)'),
      offset: z.string().optional().describe('Pagination offset token'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ limit, offset, format }) => {
      try {
        const result = await client.listWorkspaces({ limit, offset });
        return formatResponse(result, format, 'workspaces');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Workspace
  // ===========================================================================
  server.tool(
    'asana_get_workspace',
    `Get details of a specific workspace.

Args:
  - workspaceGid: The workspace's globally unique identifier`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, format }) => {
      try {
        const workspace = await client.getWorkspace(workspaceGid);
        return formatResponse(workspace, format, 'workspace');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Workspace
  // ===========================================================================
  server.tool(
    'asana_update_workspace',
    `Update a workspace name.

Args:
  - workspaceGid: The workspace's globally unique identifier
  - name: New name for the workspace`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      name: z.string().describe('New name for the workspace'),
    },
    async ({ workspaceGid, name }) => {
      try {
        const workspace = await client.updateWorkspace(workspaceGid, name);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Workspace updated', workspace }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add User to Workspace
  // ===========================================================================
  server.tool(
    'asana_add_user_to_workspace',
    `Add a user to a workspace or organization.

Args:
  - workspaceGid: The workspace GID
  - userGid: The user GID to add`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      userGid: z.string().describe('The user GID to add'),
    },
    async ({ workspaceGid, userGid }) => {
      try {
        const user = await client.addUserToWorkspace(workspaceGid, userGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'User added to workspace', user }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove User from Workspace
  // ===========================================================================
  server.tool(
    'asana_remove_user_from_workspace',
    `Remove a user from a workspace or organization.

Args:
  - workspaceGid: The workspace GID
  - userGid: The user GID to remove`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      userGid: z.string().describe('The user GID to remove'),
    },
    async ({ workspaceGid, userGid }) => {
      try {
        await client.removeUserFromWorkspace(workspaceGid, userGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'User removed from workspace' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Current User
  // ===========================================================================
  server.tool(
    'asana_get_me',
    `Get information about the currently authenticated user.

Returns the user's name, email, workspaces, and other profile information.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const user = await client.getMe();
        return formatResponse(user, format, 'user');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get User
  // ===========================================================================
  server.tool(
    'asana_get_user',
    `Get information about a specific user.

Args:
  - userGid: The user's globally unique identifier (or 'me' for current user)`,
    {
      userGid: z.string().describe('The user GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userGid, format }) => {
      try {
        const user = await client.getUser(userGid);
        return formatResponse(user, format, 'user');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Workspace Users
  // ===========================================================================
  server.tool(
    'asana_list_workspace_users',
    `List all users in a workspace or organization.

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
        const result = await client.listUsers(workspaceGid, { limit, offset });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
