/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Goal,
  PaginatedResponse,
  Portfolio,
  Project,
  ResponseFormat,
  Section,
  Story,
  Tag,
  Task,
  Team,
  User,
  Webhook,
  Workspace,
} from '../types/entities.js';
import { AsanaApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof AsanaApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).data)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');
  lines.push(`**Showing:** ${data.data.length} items`);

  if (data.nextPage) {
    lines.push(`**More available:** Yes (offset: \`${data.nextPage.offset}\`)`);
  }
  lines.push('');

  if (data.data.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'tasks':
      lines.push(formatTasksTable(data.data as Task[]));
      break;
    case 'projects':
      lines.push(formatProjectsTable(data.data as Project[]));
      break;
    case 'workspaces':
      lines.push(formatWorkspacesTable(data.data as Workspace[]));
      break;
    case 'teams':
      lines.push(formatTeamsTable(data.data as Team[]));
      break;
    case 'users':
      lines.push(formatUsersTable(data.data as User[]));
      break;
    case 'tags':
      lines.push(formatTagsTable(data.data as Tag[]));
      break;
    case 'sections':
      lines.push(formatSectionsTable(data.data as Section[]));
      break;
    case 'stories':
      lines.push(formatStoriesTable(data.data as Story[]));
      break;
    case 'portfolios':
      lines.push(formatPortfoliosTable(data.data as Portfolio[]));
      break;
    case 'goals':
      lines.push(formatGoalsTable(data.data as Goal[]));
      break;
    case 'webhooks':
      lines.push(formatWebhooksTable(data.data as Webhook[]));
      break;
    default:
      lines.push(formatGenericTable(data.data));
  }

  return lines.join('\n');
}

/**
 * Format tasks as Markdown table
 */
function formatTasksTable(tasks: Task[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Assignee | Due | Completed |');
  lines.push('|---|---|---|---|---|');

  for (const task of tasks) {
    lines.push(
      `| ${task.gid} | ${task.name || '-'} | ${task.assignee?.name || '-'} | ${task.due_on || task.due_at || '-'} | ${task.completed ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format projects as Markdown table
 */
function formatProjectsTable(projects: Project[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Team | Archived | Due |');
  lines.push('|---|---|---|---|---|');

  for (const project of projects) {
    lines.push(
      `| ${project.gid} | ${project.name} | ${project.team?.name || '-'} | ${project.archived ? 'Yes' : 'No'} | ${project.due_on || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format workspaces as Markdown table
 */
function formatWorkspacesTable(workspaces: Workspace[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Organization |');
  lines.push('|---|---|---|');

  for (const ws of workspaces) {
    lines.push(
      `| ${ws.gid} | ${ws.name} | ${ws.is_organization ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format teams as Markdown table
 */
function formatTeamsTable(teams: Team[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Visibility |');
  lines.push('|---|---|---|');

  for (const team of teams) {
    lines.push(
      `| ${team.gid} | ${team.name} | ${team.visibility || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format users as Markdown table
 */
function formatUsersTable(users: User[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Email |');
  lines.push('|---|---|---|');

  for (const user of users) {
    lines.push(
      `| ${user.gid} | ${user.name} | ${user.email || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format tags as Markdown table
 */
function formatTagsTable(tags: Tag[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Color |');
  lines.push('|---|---|---|');

  for (const tag of tags) {
    lines.push(
      `| ${tag.gid} | ${tag.name} | ${tag.color || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format sections as Markdown table
 */
function formatSectionsTable(sections: Section[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Project |');
  lines.push('|---|---|---|');

  for (const section of sections) {
    lines.push(
      `| ${section.gid} | ${section.name} | ${section.project?.name || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format stories as Markdown table
 */
function formatStoriesTable(stories: Story[]): string {
  const lines: string[] = [];
  lines.push('| GID | Type | Author | Created |');
  lines.push('|---|---|---|---|');

  for (const story of stories) {
    lines.push(
      `| ${story.gid} | ${story.resource_subtype} | ${story.created_by?.name || '-'} | ${story.created_at || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format portfolios as Markdown table
 */
function formatPortfoliosTable(portfolios: Portfolio[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Owner |');
  lines.push('|---|---|---|');

  for (const portfolio of portfolios) {
    lines.push(
      `| ${portfolio.gid} | ${portfolio.name} | ${portfolio.owner?.name || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format goals as Markdown table
 */
function formatGoalsTable(goals: Goal[]): string {
  const lines: string[] = [];
  lines.push('| GID | Name | Owner | Status |');
  lines.push('|---|---|---|---|');

  for (const goal of goals) {
    lines.push(
      `| ${goal.gid} | ${goal.name} | ${goal.owner?.name || '-'} | ${goal.status || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format webhooks as Markdown table
 */
function formatWebhooksTable(webhooks: Webhook[]): string {
  const lines: string[] = [];
  lines.push('| GID | Target | Active | Resource |');
  lines.push('|---|---|---|---|');

  for (const webhook of webhooks) {
    lines.push(
      `| ${webhook.gid} | ${webhook.target || '-'} | ${webhook.active ? 'Yes' : 'No'} | ${webhook.resource?.name || webhook.resource?.gid || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  const wrapper: PaginatedResponse<unknown> = {
    data,
  };
  return formatPaginatedAsMarkdown(wrapper, entityType);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (snake_case to Title Case)
 */
function formatKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
