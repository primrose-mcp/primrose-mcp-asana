# Asana MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with Asana. Manage workspaces, projects, tasks, teams, portfolios, goals, and more with comprehensive project management capabilities.

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-6366f1)](https://primrose.dev/mcp/asana)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[View on Primrose](https://primrose.dev/mcp/asana)** | **[Documentation](https://primrose.dev/docs)**

---

## Features

- **Workspaces** - List and manage Asana workspaces
- **Teams** - Create and manage team memberships
- **Projects** - Full CRUD operations for projects
- **Sections** - Organize tasks into sections
- **Tasks** - Create, update, assign, and track tasks
- **Tags** - Organize work with tags
- **Stories** - Access task comments and activity
- **Attachments** - Manage file attachments
- **Custom Fields** - Work with custom field definitions
- **Portfolios** - Manage project portfolios
- **Goals** - Track organizational goals
- **Webhooks** - Configure real-time notifications
- **Typeahead** - Search and autocomplete functionality

## Quick Start

### Using Primrose SDK (Recommended)

The fastest way to get started is with the [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk), which handles authentication and provides tool definitions formatted for your LLM provider.

```bash
npm install primrose-mcp
```

```typescript
import { Primrose } from 'primrose-mcp';

const primrose = new Primrose({
  apiKey: 'prm_xxxxx',
  provider: 'anthropic', // or 'openai', 'google', 'amazon', etc.
});

// List available Asana tools
const tools = await primrose.listTools({ mcpServer: 'asana' });

// Call a tool
const result = await primrose.callTool('asana_create_task', {
  name: 'Review Q4 report',
  projects: ['1234567890'],
  assignee: 'me',
  dueOn: '2024-12-31'
});
```

[Get your Primrose API key](https://primrose.dev) to start building.

### Manual Installation

If you prefer to self-host, you can deploy this MCP server directly to Cloudflare Workers.

```bash
git clone https://github.com/primrose-mcp/primrose-mcp-asana.git
cd primrose-mcp-asana
bun install
bun run deploy
```

## Configuration

This server uses a multi-tenant architecture where credentials are passed via request headers.

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Asana-Access-Token` | Asana Personal Access Token or OAuth access token |

### Getting Credentials

1. Log in to your [Asana account](https://app.asana.com/)
2. Navigate to [Developer Console](https://app.asana.com/0/developer-console)
3. Create a Personal Access Token or set up OAuth

## Available Tools

### Workspaces
- `asana_list_workspaces` - List all workspaces
- `asana_get_workspace` - Get workspace details

### Teams
- `asana_list_teams` - List teams in a workspace
- `asana_create_team` - Create a new team

### Projects
- `asana_list_projects` - List projects
- `asana_get_project` - Get project details
- `asana_create_project` - Create a new project
- `asana_update_project` - Update a project
- `asana_delete_project` - Delete a project

### Tasks
- `asana_list_tasks` - List tasks in a project
- `asana_get_task` - Get task details
- `asana_create_task` - Create a new task
- `asana_update_task` - Update a task
- `asana_delete_task` - Delete a task

### Sections
- `asana_list_sections` - List sections in a project
- `asana_create_section` - Create a section

### Tags
- `asana_list_tags` - List tags
- `asana_create_tag` - Create a tag

### Goals
- `asana_list_goals` - List goals
- `asana_get_goal` - Get goal details

### Webhooks
- `asana_list_webhooks` - List webhooks
- `asana_create_webhook` - Create a webhook

## Development

```bash
bun run dev
bun run typecheck
bun run lint
bun run inspector
```

## Related Resources

- [Primrose SDK](https://github.com/primrose-mcp/primrose-sdk)
- [Asana API Documentation](https://developers.asana.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT License - see [LICENSE](LICENSE) for details.
