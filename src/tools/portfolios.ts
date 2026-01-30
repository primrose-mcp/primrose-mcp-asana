/**
 * Portfolio Tools
 *
 * MCP tools for portfolio management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all portfolio-related tools
 */
export function registerPortfolioTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Portfolio
  // ===========================================================================
  server.tool(
    'asana_create_portfolio',
    `Create a new portfolio.

Args:
  - name: Portfolio name (required)
  - workspace: Workspace GID (required)
  - color: Portfolio color
  - public: Whether portfolio is public`,
    {
      name: z.string().describe('Portfolio name'),
      workspace: z.string().describe('Workspace GID'),
      color: z.string().optional().describe('Portfolio color'),
      public: z.boolean().optional().describe('Whether portfolio is public'),
    },
    async ({ name, workspace, color, public: isPublic }) => {
      try {
        const portfolio = await client.createPortfolio({ name, workspace, color, public: isPublic });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Portfolio created', portfolio }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Portfolio
  // ===========================================================================
  server.tool(
    'asana_get_portfolio',
    `Get details of a specific portfolio.

Args:
  - portfolioGid: The portfolio's globally unique identifier`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ portfolioGid, format }) => {
      try {
        const portfolio = await client.getPortfolio(portfolioGid);
        return formatResponse(portfolio, format, 'portfolio');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Portfolio
  // ===========================================================================
  server.tool(
    'asana_update_portfolio',
    `Update a portfolio.

Args:
  - portfolioGid: The portfolio GID
  - name: New portfolio name
  - color: New portfolio color
  - public: Whether portfolio is public`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      name: z.string().optional().describe('New portfolio name'),
      color: z.string().optional().describe('New portfolio color'),
      public: z.boolean().optional().describe('Whether portfolio is public'),
    },
    async ({ portfolioGid, name, color, public: isPublic }) => {
      try {
        const portfolio = await client.updatePortfolio(portfolioGid, { name, color, public: isPublic });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Portfolio updated', portfolio }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Portfolio
  // ===========================================================================
  server.tool(
    'asana_delete_portfolio',
    `Delete a portfolio.

Args:
  - portfolioGid: The portfolio GID to delete`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
    },
    async ({ portfolioGid }) => {
      try {
        await client.deletePortfolio(portfolioGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Portfolio deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Portfolios
  // ===========================================================================
  server.tool(
    'asana_list_portfolios',
    `List portfolios in a workspace owned by a user.

Args:
  - workspaceGid: The workspace GID
  - ownerGid: The owner user GID`,
    {
      workspaceGid: z.string().describe('The workspace GID'),
      ownerGid: z.string().describe('The owner user GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workspaceGid, ownerGid, limit, offset, format }) => {
      try {
        const result = await client.listPortfolios(workspaceGid, ownerGid, { limit, offset });
        return formatResponse(result, format, 'portfolios');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Portfolio Items
  // ===========================================================================
  server.tool(
    'asana_list_portfolio_items',
    `List all projects in a portfolio.

Args:
  - portfolioGid: The portfolio GID`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ portfolioGid, limit, offset, format }) => {
      try {
        const result = await client.listPortfolioItems(portfolioGid, { limit, offset });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Item to Portfolio
  // ===========================================================================
  server.tool(
    'asana_add_item_to_portfolio',
    `Add a project to a portfolio.

Args:
  - portfolioGid: The portfolio GID
  - itemGid: The project GID to add`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      itemGid: z.string().describe('The project GID to add'),
    },
    async ({ portfolioGid, itemGid }) => {
      try {
        await client.addItemToPortfolio(portfolioGid, itemGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project added to portfolio' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Item from Portfolio
  // ===========================================================================
  server.tool(
    'asana_remove_item_from_portfolio',
    `Remove a project from a portfolio.

Args:
  - portfolioGid: The portfolio GID
  - itemGid: The project GID to remove`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      itemGid: z.string().describe('The project GID to remove'),
    },
    async ({ portfolioGid, itemGid }) => {
      try {
        await client.removeItemFromPortfolio(portfolioGid, itemGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Project removed from portfolio' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Members to Portfolio
  // ===========================================================================
  server.tool(
    'asana_add_members_to_portfolio',
    `Add members to a portfolio.

Args:
  - portfolioGid: The portfolio GID
  - memberGids: Array of user GIDs to add as members`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      memberGids: z.array(z.string()).describe('User GIDs to add'),
    },
    async ({ portfolioGid, memberGids }) => {
      try {
        const portfolio = await client.addMembersToPortfolio(portfolioGid, memberGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Members added to portfolio', portfolio }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Members from Portfolio
  // ===========================================================================
  server.tool(
    'asana_remove_members_from_portfolio',
    `Remove members from a portfolio.

Args:
  - portfolioGid: The portfolio GID
  - memberGids: Array of user GIDs to remove`,
    {
      portfolioGid: z.string().describe('The portfolio GID'),
      memberGids: z.array(z.string()).describe('User GIDs to remove'),
    },
    async ({ portfolioGid, memberGids }) => {
      try {
        const portfolio = await client.removeMembersFromPortfolio(portfolioGid, memberGids);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Members removed from portfolio', portfolio }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
