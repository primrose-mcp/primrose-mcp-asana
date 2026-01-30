/**
 * Team Tools
 *
 * MCP tools for team management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all team-related tools
 */
export function registerTeamTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Team
  // ===========================================================================
  server.tool(
    'asana_create_team',
    `Create a new team in an organization.

Args:
  - organizationGid: The organization/workspace GID
  - name: Team name
  - description: Optional team description
  - visibility: Team visibility (secret, request_to_join, public)`,
    {
      organizationGid: z.string().describe('The organization GID'),
      name: z.string().describe('Team name'),
      description: z.string().optional().describe('Team description'),
      visibility: z.enum(['secret', 'request_to_join', 'public']).optional().describe('Team visibility'),
    },
    async ({ organizationGid, name, description, visibility }) => {
      try {
        const team = await client.createTeam(organizationGid, name, description, visibility);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Team created', team }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Team
  // ===========================================================================
  server.tool(
    'asana_get_team',
    `Get details of a specific team.

Args:
  - teamGid: The team's globally unique identifier`,
    {
      teamGid: z.string().describe('The team GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ teamGid, format }) => {
      try {
        const team = await client.getTeam(teamGid);
        return formatResponse(team, format, 'team');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Team
  // ===========================================================================
  server.tool(
    'asana_update_team',
    `Update a team.

Args:
  - teamGid: The team GID
  - name: New team name
  - description: New team description
  - visibility: New team visibility`,
    {
      teamGid: z.string().describe('The team GID'),
      name: z.string().optional().describe('New team name'),
      description: z.string().optional().describe('New team description'),
      visibility: z.enum(['secret', 'request_to_join', 'public']).optional().describe('New team visibility'),
    },
    async ({ teamGid, name, description, visibility }) => {
      try {
        const team = await client.updateTeam(teamGid, { name, description, visibility });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Team updated', team }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Teams in Workspace
  // ===========================================================================
  server.tool(
    'asana_list_teams',
    `List all teams in a workspace/organization.

Args:
  - workspaceGid: The workspace/organization GID`,
    {
      workspaceGid: z.string().describe('The workspace/organization GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, limit, offset, format }) => {
      try {
        const result = await client.listTeamsInWorkspace(workspaceGid, { limit, offset });
        return formatResponse(result, format, 'teams');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List User's Teams
  // ===========================================================================
  server.tool(
    'asana_list_user_teams',
    `List all teams a user belongs to in an organization.

Args:
  - userGid: The user GID
  - organizationGid: The organization GID`,
    {
      userGid: z.string().describe('The user GID'),
      organizationGid: z.string().describe('The organization GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userGid, organizationGid, limit, offset, format }) => {
      try {
        const result = await client.listUserTeams(userGid, organizationGid, { limit, offset });
        return formatResponse(result, format, 'teams');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Team Users
  // ===========================================================================
  server.tool(
    'asana_list_team_users',
    `List all users (members) in a team.

Args:
  - teamGid: The team GID`,
    {
      teamGid: z.string().describe('The team GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ teamGid, limit, offset, format }) => {
      try {
        const result = await client.listTeamUsers(teamGid, { limit, offset });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add User to Team
  // ===========================================================================
  server.tool(
    'asana_add_user_to_team',
    `Add a user to a team.

Args:
  - teamGid: The team GID
  - userGid: The user GID to add`,
    {
      teamGid: z.string().describe('The team GID'),
      userGid: z.string().describe('The user GID to add'),
    },
    async ({ teamGid, userGid }) => {
      try {
        const membership = await client.addUserToTeam(teamGid, userGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'User added to team', membership }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove User from Team
  // ===========================================================================
  server.tool(
    'asana_remove_user_from_team',
    `Remove a user from a team.

Args:
  - teamGid: The team GID
  - userGid: The user GID to remove`,
    {
      teamGid: z.string().describe('The team GID'),
      userGid: z.string().describe('The user GID to remove'),
    },
    async ({ teamGid, userGid }) => {
      try {
        await client.removeUserFromTeam(teamGid, userGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'User removed from team' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
