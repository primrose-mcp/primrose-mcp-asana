/**
 * Custom Field Tools
 *
 * MCP tools for managing custom fields.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AsanaClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all custom field-related tools
 */
export function registerCustomFieldTools(server: McpServer, client: AsanaClient): void {
  // ===========================================================================
  // Create Custom Field
  // ===========================================================================
  server.tool(
    'asana_create_custom_field',
    `Create a new custom field in a workspace.

Args:
  - name: Custom field name (required)
  - workspace: Workspace GID (required)
  - resourceSubtype: Field type (text, enum, multi_enum, number, date, people)
  - description: Field description
  - precision: Number precision (for number fields)
  - enumOptions: Array of enum options (for enum fields)`,
    {
      name: z.string().describe('Custom field name'),
      workspace: z.string().describe('Workspace GID'),
      resourceSubtype: z.enum(['text', 'enum', 'multi_enum', 'number', 'date', 'people']).describe('Field type'),
      description: z.string().optional().describe('Field description'),
      precision: z.number().optional().describe('Number precision'),
      enumOptions: z.array(z.object({
        name: z.string(),
        color: z.string().optional(),
        enabled: z.boolean().optional(),
      })).optional().describe('Enum options'),
    },
    async ({ name, workspace, resourceSubtype, description, precision, enumOptions }) => {
      try {
        const customField = await client.createCustomField({
          name,
          workspace,
          resource_subtype: resourceSubtype,
          description,
          precision,
          enum_options: enumOptions,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Custom field created', customField }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Custom Field
  // ===========================================================================
  server.tool(
    'asana_get_custom_field',
    `Get details of a specific custom field.

Args:
  - customFieldGid: The custom field's globally unique identifier`,
    {
      customFieldGid: z.string().describe('The custom field GID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customFieldGid, format }) => {
      try {
        const customField = await client.getCustomField(customFieldGid);
        return formatResponse(customField, format, 'custom_field');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Custom Field
  // ===========================================================================
  server.tool(
    'asana_update_custom_field',
    `Update a custom field.

Args:
  - customFieldGid: The custom field GID
  - name: New field name
  - description: New field description
  - enabled: Whether the field is enabled`,
    {
      customFieldGid: z.string().describe('The custom field GID'),
      name: z.string().optional().describe('New field name'),
      description: z.string().optional().describe('New field description'),
      enabled: z.boolean().optional().describe('Whether the field is enabled'),
    },
    async ({ customFieldGid, name, description, enabled }) => {
      try {
        const customField = await client.updateCustomField(customFieldGid, { name, description, enabled });
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Custom field updated', customField }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Custom Field
  // ===========================================================================
  server.tool(
    'asana_delete_custom_field',
    `Delete a custom field.

Args:
  - customFieldGid: The custom field GID to delete`,
    {
      customFieldGid: z.string().describe('The custom field GID'),
    },
    async ({ customFieldGid }) => {
      try {
        await client.deleteCustomField(customFieldGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Custom field deleted' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Workspace Custom Fields
  // ===========================================================================
  server.tool(
    'asana_list_custom_fields',
    `List all custom fields in a workspace.

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
        const result = await client.listWorkspaceCustomFields(workspaceGid, { limit, offset });
        return formatResponse(result, format, 'custom_fields');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Custom Field to Project
  // ===========================================================================
  server.tool(
    'asana_add_custom_field_to_project',
    `Add a custom field to a project.

Args:
  - projectGid: The project GID
  - customFieldGid: The custom field GID
  - isImportant: Whether the field is important (shown in list view)`,
    {
      projectGid: z.string().describe('The project GID'),
      customFieldGid: z.string().describe('The custom field GID'),
      isImportant: z.boolean().optional().describe('Whether the field is important'),
    },
    async ({ projectGid, customFieldGid, isImportant }) => {
      try {
        await client.addCustomFieldToProject(projectGid, customFieldGid, isImportant);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Custom field added to project' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Custom Field from Project
  // ===========================================================================
  server.tool(
    'asana_remove_custom_field_from_project',
    `Remove a custom field from a project.

Args:
  - projectGid: The project GID
  - customFieldGid: The custom field GID`,
    {
      projectGid: z.string().describe('The project GID'),
      customFieldGid: z.string().describe('The custom field GID'),
    },
    async ({ projectGid, customFieldGid }) => {
      try {
        await client.removeCustomFieldFromProject(projectGid, customFieldGid);
        return {
          content: [
            { type: 'text', text: JSON.stringify({ success: true, message: 'Custom field removed from project' }, null, 2) },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
