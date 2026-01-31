# @nextmavens/mcp-server

Model Context Protocol (MCP) server for NextMavens platform - enables AI assistants (Claude, Cursor, Continue.dev, etc.) to directly interact with your NextMavens backend.

## Quick Start

The MCP server is available as a hosted HTTP endpoint. No installation required!

Just get your API key from the [NextMavens Developer Portal](https://portal.nextmavens.cloud) and configure your AI tool.

## Features

- **Database Operations**: Query, insert, update, and delete data
- **Authentication**: Sign up and sign in users
- **Storage**: Get file info, download URLs, and list files
- **GraphQL**: Execute GraphQL queries and introspect schema
- **11 MCP Tools** organized by service category

## Configuration

Set your API key as an environment variable:

```bash
export NEXTMAVENS_API_KEY=nm_live_pk_your_key_here
```

## Installation

### Option 1: Hosted HTTP Endpoint (Recommended)

The MCP server is available at: `https://api.nextmavens.cloud/mcp`

#### Claude Code

```bash
claude mcp add --transport http nextmavens \
  --url https://api.nextmavens.cloud/mcp \
  --header "Authorization: Bearer $NEXTMAVENS_API_KEY"
```

#### Cursor (IDE)

Create `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "nextmavens": {
      "type": "http",
      "url": "https://api.nextmavens.cloud/mcp",
      "headers": {
        "Authorization": "Bearer ${env:NEXTMAVENS_API_KEY}"
      }
    }
  }
}
```

Then set your API key:
```bash
export NEXTMAVENS_API_KEY=nm_live_pk_your_key_here
```

### Option 2: Local Development Server

For local development, you can run the MCP server locally:

```bash
# Clone repository
git clone https://github.com/Mkid095/nextmavens-mcp-server.git
cd nextmavens-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run with your API key
NEXTMAVENS_API_KEY=your_key npm start
```

Then configure with the local URL: `http://localhost:3000/mcp`

## Available Tools

### Database Operations (4 tools)

| Tool | Description |
|------|-------------|
| `nextmavens_query` | Query data with filters (eq, neq, gt, gte, lt, lte, like, ilike, in) |
| `nextmavens_insert` | Insert new rows into a table |
| `nextmavens_update` | Update existing rows with filters |
| `nextmavens_delete` | Delete rows with filters |

### Authentication (2 tools)

| Tool | Description |
|------|-------------|
| `nextmavens_signin` | Sign in a user with email and password |
| `nextmavens_signup` | Register a new user with optional name and tenantId |

### Storage (3 tools)

| Tool | Description |
|------|-------------|
| `nextmavens_file_info` | Get file metadata by ID |
| `nextmavens_file_download_url` | Generate download URL for a file |
| `nextmavens_list_files` | List files with optional filters (tenantId, fileType) |

### GraphQL (2 tools)

| Tool | Description |
|------|-------------|
| `nextmavens_graphql` | Execute GraphQL queries |
| `nextmavens_graphql_introspect` | Explore database schema |

## Filter Operators

- `eq`: Equals
- `neq`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `like`: LIKE (case-sensitive)
- `ilike`: ILIKE (case-insensitive)
- `in`: IN array

## Example Usage

### Database Query

```
You: "Show me all users created in the last 7 days"

Claude: Uses nextmavens_query with filters
{
  "table": "users",
  "filters": [
    { "column": "created_at", "operator": "gte", "value": "2024-01-20" }
  ],
  "orderBy": { "column": "created_at", "ascending": false }
}
```

### Create Data

```
You: "Create a new post for user 123"

Claude: Uses nextmavens_insert
{
  "table": "posts",
  "data": {
    "title": "New Post",
    "content": "Post content",
    "user_id": 123
  }
}
```

### GraphQL Introspection

```
You: "What tables are available in my database?"

Claude: Uses nextmavens_graphql_introspect to retrieve schema
```

## Testing Your Setup

### Test the endpoint is accessible:

```bash
curl https://api.nextmavens.cloud/mcp
```

### Test MCP tools/list:

```bash
curl -X POST https://api.nextmavens.cloud/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nm_live_pk_your_key_here" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### Verify in Claude Code:

```bash
claude mcp list
claude mcp get nextmavens
```

## Troubleshooting

### "Server not starting"
- Ensure you have set the NEXTMAVENS_API_KEY environment variable
- Get your API key from the dashboard at portal.nextmavens.cloud

### "Tools not appearing in Claude Code"
- Run `claude mcp list` to verify the server is configured
- Try removing and re-adding: `claude mcp remove nextmavens` then add again

### "Authentication errors"
- Verify your API key is valid and has the correct permissions
- Get a new key from the dashboard if needed

### "Network connection issues"
- Check that you can reach `https://api.nextmavens.cloud/mcp`
- Verify no firewall is blocking the connection

## Security

- Always use public keys (`nm_live_pk_*`) for client-side operations
- Keep secret keys (`nm_live_sk_*`) secure and never expose them
- The MCP server requires API key authentication for all operations
- All traffic is encrypted over HTTPS

## License

MIT

## Links

- [Developer Portal](https://portal.nextmavens.cloud)
- [Documentation](https://docs.nextmavens.cloud)
- [GitHub Repository](https://github.com/Mkid095/nextmavens-mcp-server)
