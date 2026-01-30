/**
 * Goal Tools
 *
 * MCP tools for goal management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const goalStatusSchema = z.enum(['on_track', 'at_risk', 'off_track', 'on_hold', 'achieved', 'partial', 'missed', 'dropped']);

/**
 * Register all goal-related tools
 */
export function registerGoalTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Goal
  // ===========================================================================
  server.tool(
    'asana_create_goal',
    `Create a new goal.

Args:
  - name: Goal name (required)
  - workspace: Workspace GID (required if team not provided)
  - team: Team GID (for team goals)
  - timePeriod: Time period GID
  - owner: Owner user GID
  - notes: Goal description
  - dueOn: Due date (YYYY-MM-DD)
  - startOn: Start date (YYYY-MM-DD)
  - status: Goal status`,
    {
      name: z.string().describe('Goal name'),
      workspace: z.string().optional().describe('Workspace GID'),
      team: z.string().optional().describe('Team GID'),
      timePeriod: z.string().optional().describe('Time period GID'),
      owner: z.string().optional().describe('Owner user GID'),
      notes: z.string().optional().describe('Goal description'),
      dueOn: z.string().optional().describe('Due date (YYYY-MM-DD)'),
      startOn: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      status: goalStatusSchema.optional().describe('Goal status'),
    },
    async ({ name, workspace, team, timePeriod, owner, notes, dueOn, startOn, status }) => {
      try {
        const goal = await client.createGoal({
          name,
          workspace,
          team,
          time_period: timePeriod,
          owner,
          notes,
          due_on: dueOn,
          start_on: startOn,
          status,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Goal created', goal }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Goal
  // ===========================================================================
  server.tool(
    'asana_get_goal',
    `Get details of a specific goal.

Args:
  - goalGid: The goal's globally unique identifier`,
    {
      goalGid: z.string().describe('The goal GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ goalGid, format }) => {
      try {
        const goal = await client.getGoal(goalGid);
        return formatResponse(goal, format, 'goal');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Goal
  // ===========================================================================
  server.tool(
    'asana_update_goal',
    `Update a goal.

Args:
  - goalGid: The goal GID
  - name: New goal name
  - notes: New goal description
  - dueOn: New due date (YYYY-MM-DD or null to clear)
  - startOn: New start date (YYYY-MM-DD or null to clear)
  - status: New goal status (or null to clear)
  - owner: New owner user GID`,
    {
      goalGid: z.string().describe('The goal GID'),
      name: z.string().optional().describe('New goal name'),
      notes: z.string().optional().describe('New goal description'),
      dueOn: z.string().nullable().optional().describe('New due date (YYYY-MM-DD)'),
      startOn: z.string().nullable().optional().describe('New start date (YYYY-MM-DD)'),
      status: goalStatusSchema.nullable().optional().describe('New goal status'),
      owner: z.string().optional().describe('New owner user GID'),
    },
    async ({ goalGid, name, notes, dueOn, startOn, status, owner }) => {
      try {
        const goal = await client.updateGoal(goalGid, {
          name,
          notes,
          due_on: dueOn,
          start_on: startOn,
          status,
          owner,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Goal updated', goal }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Goal
  // ===========================================================================
  server.tool(
    'asana_delete_goal',
    `Delete a goal.

Args:
  - goalGid: The goal GID to delete`,
    {
      goalGid: z.string().describe('The goal GID'),
    },
    async ({ goalGid }) => {
      try {
        await client.deleteGoal(goalGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Goal deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Goals
  // ===========================================================================
  server.tool(
    'asana_list_goals',
    `List goals with various filters.

Args:
  - workspace: Filter by workspace GID
  - team: Filter by team GID
  - isWorkspaceLevel: Filter to workspace-level goals only
  - timePeriods: Filter by time period GIDs (comma-separated)
  - portfolio: Filter by portfolio GID`,
    {
      workspace: z.string().optional().describe('Filter by workspace GID'),
      team: z.string().optional().describe('Filter by team GID'),
      isWorkspaceLevel: z.boolean().optional().describe('Filter to workspace-level goals only'),
      timePeriods: z.string().optional().describe('Filter by time period GIDs (comma-separated)'),
      portfolio: z.string().optional().describe('Filter by portfolio GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspace, team, isWorkspaceLevel, timePeriods, portfolio, limit, offset, format }) => {
      try {
        const result = await client.listGoals({
          workspace,
          team,
          is_workspace_level: isWorkspaceLevel,
          time_periods: timePeriods,
          portfolio,
          limit,
          offset,
        });
        return formatResponse(result, format, 'goals');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Followers to Goal
  // ===========================================================================
  server.tool(
    'asana_add_followers_to_goal',
    `Add followers to a goal.

Args:
  - goalGid: The goal GID
  - followerGids: Array of user GIDs to add as followers`,
    {
      goalGid: z.string().describe('The goal GID'),
      followerGids: z.array(z.string()).describe('User GIDs to add as followers'),
    },
    async ({ goalGid, followerGids }) => {
      try {
        const goal = await client.addFollowersToGoal(goalGid, followerGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Followers added to goal', goal }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Goal Parent Goals
  // ===========================================================================
  server.tool(
    'asana_list_goal_parent_goals',
    `List parent goals of a goal.

Args:
  - goalGid: The goal GID`,
    {
      goalGid: z.string().describe('The goal GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ goalGid, limit, offset, format }) => {
      try {
        const result = await client.listGoalParentGoals(goalGid, { limit, offset });
        return formatResponse(result, format, 'goals');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Goal Relationships
  // ===========================================================================
  server.tool(
    'asana_list_goal_relationships',
    `List relationships (supporting goals/projects) of a goal.

Args:
  - goalGid: The goal GID`,
    {
      goalGid: z.string().describe('The goal GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ goalGid, limit, offset, format }) => {
      try {
        const result = await client.listGoalRelationships(goalGid, { limit, offset });
        return formatResponse(result, format, 'goal_relationships');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Supporting Relationship
  // ===========================================================================
  server.tool(
    'asana_add_supporting_relationship',
    `Add a supporting goal or project to a goal.

Args:
  - goalGid: The goal GID
  - supportingResourceGid: The supporting goal or project GID
  - contributionWeight: Weight of the contribution (0-1)`,
    {
      goalGid: z.string().describe('The goal GID'),
      supportingResourceGid: z.string().describe('The supporting resource GID'),
      contributionWeight: z.number().min(0).max(1).optional().describe('Contribution weight'),
    },
    async ({ goalGid, supportingResourceGid, contributionWeight }) => {
      try {
        const relationship = await client.addSupportingRelationship(goalGid, supportingResourceGid, contributionWeight);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Supporting relationship added', relationship }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Supporting Relationship
  // ===========================================================================
  server.tool(
    'asana_remove_supporting_relationship',
    `Remove a supporting relationship from a goal.

Args:
  - goalGid: The goal GID
  - supportingRelationshipGid: The relationship GID to remove`,
    {
      goalGid: z.string().describe('The goal GID'),
      supportingRelationshipGid: z.string().describe('The relationship GID'),
    },
    async ({ goalGid, supportingRelationshipGid }) => {
      try {
        await client.removeSupportingRelationship(goalGid, supportingRelationshipGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Supporting relationship removed' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
