#!/usr/bin/env node
/**
 * NextMavens MCP Server
 * Model Context Protocol server for AI/IDE integration with NextMavens platform
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { DatabaseTools } from './tools/database.js';
import { AuthTools } from './tools/auth.js';
import { StorageTools } from './tools/storage.js';
import { GraphQLTools } from './tools/graphql.js';
import { SchemaTools } from './tools/schema.js';
import { ProjectTools } from './tools/project.js';
import { ApiKeyTools } from './tools/apiKey.js';
import { RealtimeTools } from './tools/realtime.js';
import { StorageMgmtTools } from './tools/storageMgmt.js';

// Get API key from environment
const API_KEY = process.env.NEXTMAVENS_API_KEY || process.env.NEXTMAVENS_PUBLIC_KEY;
const API_URL = process.env.NEXTMAVENS_API_URL || 'https://api.nextmavens.cloud';
const AUTH_URL = process.env.NEXTMAVENS_AUTH_URL || 'https://api.nextmavens.cloud';
const GRAPHQL_URL = process.env.NEXTMAVENS_GRAPHQL_URL || 'https://api.nextmavens.cloud';
const STORAGE_URL = process.env.NEXTMAVENS_STORAGE_URL || 'https://telegram-api.nextmavens.cloud';

// Validate configuration
if (!API_KEY) {
  console.error('Error: NEXTMAVENS_API_KEY environment variable is required');
  console.error('Set it with: export NEXTMAVENS_API_KEY=nm_live_pk_your_key_here');
  process.exit(1);
}

// Create server
const server = new Server(
  {
    name: 'nextmavens-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Initialize tool handlers
const dbTools = new DatabaseTools(API_KEY, API_URL);
const authTools = new AuthTools(API_KEY, AUTH_URL);
const storageTools = new StorageTools(API_KEY, STORAGE_URL);
const graphqlTools = new GraphQLTools(API_KEY, GRAPHQL_URL);
const schemaTools = new SchemaTools(API_KEY, API_URL, GRAPHQL_URL);
const projectTools = new ProjectTools(API_KEY, API_URL);
const apiKeyTools = new ApiKeyTools(API_KEY, API_URL);
const realtimeTools = new RealtimeTools(API_KEY, API_URL);
const storageMgmtTools = new StorageMgmtTools(API_KEY, STORAGE_URL);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Database tools
      {
        name: 'nextmavens_query',
        description: 'Execute a database query on NextMavens. Supports SELECT operations with filters.',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to query'
            },
            filters: {
              type: 'array',
              description: 'Array of filters to apply',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: {
                    type: 'string',
                    enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in']
                  },
                  value: {}
                }
              }
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results'
            },
            offset: {
              type: 'number',
              description: 'Number of results to skip'
            },
            orderBy: {
              type: 'object',
              properties: {
                column: { type: 'string' },
                ascending: { type: 'boolean' }
              }
            }
          },
          required: ['table']
        }
      },
      {
        name: 'nextmavens_insert',
        description: 'Insert a row into a database table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to insert into'
            },
            data: {
              type: 'object',
              description: 'Data to insert (key-value pairs)'
            }
          },
          required: ['table', 'data']
        }
      },
      {
        name: 'nextmavens_update',
        description: 'Update rows in a database table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to update'
            },
            data: {
              type: 'object',
              description: 'Data to update (key-value pairs)'
            },
            filters: {
              type: 'array',
              description: 'Filters to identify rows to update',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: { type: 'string' },
                  value: {}
                }
              }
            }
          },
          required: ['table', 'data', 'filters']
        }
      },
      {
        name: 'nextmavens_delete',
        description: 'Delete rows from a database table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to delete from'
            },
            filters: {
              type: 'array',
              description: 'Filters to identify rows to delete',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  operator: { type: 'string' },
                  value: {}
                }
              }
            }
          },
          required: ['table', 'filters']
        }
      },
      // Auth tools
      {
        name: 'nextmavens_signin',
        description: 'Sign in a user with email and password',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          },
          required: ['email', 'password']
        }
      },
      {
        name: 'nextmavens_signup',
        description: 'Sign up a new user',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            name: {
              type: 'string',
              description: 'User display name'
            },
            tenantId: {
              type: 'string',
              description: 'Tenant ID for multi-tenancy'
            }
          },
          required: ['email', 'password']
        }
      },
      // Storage tools
      {
        name: 'nextmavens_file_info',
        description: 'Get information about a file by ID',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'File ID from Telegram storage'
            }
          },
          required: ['fileId']
        }
      },
      {
        name: 'nextmavens_file_download_url',
        description: 'Get a download URL for a file',
        inputSchema: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'File ID from Telegram storage'
            }
          },
          required: ['fileId']
        }
      },
      {
        name: 'nextmavens_list_files',
        description: 'List files with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            tenantId: {
              type: 'string',
              description: 'Filter by tenant ID'
            },
            fileType: {
              type: 'string',
              description: 'Filter by file type'
            },
            limit: {
              type: 'number',
              description: 'Maximum results'
            },
            offset: {
              type: 'number',
              description: 'Results offset'
            }
          }
        }
      },
      // GraphQL tools
      {
        name: 'nextmavens_graphql',
        description: 'Execute a GraphQL query',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'GraphQL query'
            },
            variables: {
              type: 'object',
              description: 'GraphQL variables'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'nextmavens_graphql_introspect',
        description: 'Get GraphQL schema introspection for exploring available types and fields',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      // Schema management tools
      {
        name: 'nextmavens_create_table',
        description: 'Create a new database table with columns',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string', description: 'Name of the table to create' },
            columns: {
              type: 'array',
              description: 'Array of column definitions',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  nullable: { type: 'boolean' },
                  unique: { type: 'boolean' },
                  default: { type: 'string' }
                }
              }
            },
            primaryKeys: {
              type: 'array',
              description: 'Primary key columns',
              items: { type: 'string' }
            }
          },
          required: ['tableName', 'columns']
        }
      },
      {
        name: 'nextmavens_add_column',
        description: 'Add a column to an existing table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            column: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                nullable: { type: 'boolean' },
                default: { type: 'string' }
              }
            }
          },
          required: ['tableName', 'column']
        }
      },
      {
        name: 'nextmavens_create_policy',
        description: 'Create or update an RLS policy on a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' },
            policyName: { type: 'string' },
            operation: {
              type: 'string',
              enum: ['select', 'insert', 'update', 'delete', 'all']
            },
            using: { type: 'string', description: 'USING expression for RLS' },
            check: { type: 'string', description: 'WITH CHECK expression for RLS' },
            roles: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['tableName', 'policyName', 'operation']
        }
      },
      {
        name: 'nextmavens_enable_rls',
        description: 'Enable Row Level Security on a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' }
          },
          required: ['tableName']
        }
      },
      {
        name: 'nextmavens_list_tables',
        description: 'List all database tables',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'nextmavens_get_table_schema',
        description: 'Get schema information for a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' }
          },
          required: ['tableName']
        }
      },
      // Project management tools
      {
        name: 'nextmavens_create_project',
        description: 'Create a new project',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            domain: { type: 'string' }
          },
          required: ['name']
        }
      },
      {
        name: 'nextmavens_list_projects',
        description: 'List all projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'nextmavens_get_project',
        description: 'Get project details',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string' }
          },
          required: ['projectId']
        }
      },
      {
        name: 'nextmavens_update_project',
        description: 'Update a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            domain: { type: 'string' }
          },
          required: ['projectId']
        }
      },
      {
        name: 'nextmavens_delete_project',
        description: 'Delete a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string' }
          },
          required: ['projectId']
        }
      },
      // API Key management tools
      {
        name: 'nextmavens_create_api_key',
        description: 'Create an API key with expiration options',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            scopes: {
              type: 'array',
              items: { type: 'string' }
            },
            expiration: {
              type: 'string',
              enum: ['1day', '1week', '2weeks', '3weeks', '30days', '1year', 'forever'],
              description: 'Key expiration period'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'nextmavens_list_api_keys',
        description: 'List all API keys',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'nextmavens_get_api_key',
        description: 'Get API key details',
        inputSchema: {
          type: 'object',
          properties: {
            keyId: { type: 'string' }
          },
          required: ['keyId']
        }
      },
      {
        name: 'nextmavens_delete_api_key',
        description: 'Delete an API key',
        inputSchema: {
          type: 'object',
          properties: {
            keyId: { type: 'string' }
          },
          required: ['keyId']
        }
      },
      // Realtime management tools
      {
        name: 'nextmavens_enable_realtime',
        description: 'Enable realtime for a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' }
          },
          required: ['tableName']
        }
      },
      {
        name: 'nextmavens_disable_realtime',
        description: 'Disable realtime for a table',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: { type: 'string' }
          },
          required: ['tableName']
        }
      },
      {
        name: 'nextmavens_list_realtime_tables',
        description: 'List tables with realtime enabled',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'nextmavens_realtime_connection_info',
        description: 'Get realtime connection information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      // Storage management tools
      {
        name: 'nextmavens_create_bucket',
        description: 'Create a storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            publicAccess: { type: 'boolean' },
            fileSizeLimit: { type: 'number' }
          },
          required: ['name']
        }
      },
      {
        name: 'nextmavens_list_buckets',
        description: 'List all storage buckets',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'nextmavens_delete_bucket',
        description: 'Delete a storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            bucketId: { type: 'string' }
          },
          required: ['bucketId']
        }
      },
      {
        name: 'nextmavens_create_folder',
        description: 'Create a folder in a bucket',
        inputSchema: {
          type: 'object',
          properties: {
            bucketId: { type: 'string' },
            folderPath: { type: 'string' }
          },
          required: ['bucketId', 'folderPath']
        }
      },
      {
        name: 'nextmavens_update_bucket',
        description: 'Update bucket settings',
        inputSchema: {
          type: 'object',
          properties: {
            bucketId: { type: 'string' },
            publicAccess: { type: 'boolean' },
            fileSizeLimit: { type: 'number' }
          },
          required: ['bucketId']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Database operations
      case 'nextmavens_query':
        return await dbTools.query(args);

      case 'nextmavens_insert':
        return await dbTools.insert(args);

      case 'nextmavens_update':
        return await dbTools.update(args);

      case 'nextmavens_delete':
        return await dbTools.delete(args);

      // Auth operations
      case 'nextmavens_signin':
        return await authTools.signIn(args);

      case 'nextmavens_signup':
        return await authTools.signUp(args);

      // Storage operations
      case 'nextmavens_file_info':
        return await storageTools.getFileInfo(args);

      case 'nextmavens_file_download_url':
        return await storageTools.getDownloadUrl(args);

      case 'nextmavens_list_files':
        return await storageTools.listFiles(args);

      // GraphQL operations
      case 'nextmavens_graphql':
        return await graphqlTools.query(args);

      case 'nextmavens_graphql_introspect':
        return await graphqlTools.introspect(args);

      // Schema management operations
      case 'nextmavens_create_table':
        return await schemaTools.createTable(args);

      case 'nextmavens_add_column':
        return await schemaTools.addColumn(args);

      case 'nextmavens_create_policy':
        return await schemaTools.createPolicy(args);

      case 'nextmavens_enable_rls':
        return await schemaTools.enableRLS(args);

      case 'nextmavens_list_tables':
        return await schemaTools.listTables(args);

      case 'nextmavens_get_table_schema':
        return await schemaTools.getTableSchema(args);

      // Project management operations
      case 'nextmavens_create_project':
        return await projectTools.createProject(args);

      case 'nextmavens_list_projects':
        return await projectTools.listProjects(args);

      case 'nextmavens_get_project':
        return await projectTools.getProject(args);

      case 'nextmavens_update_project':
        return await projectTools.updateProject(args);

      case 'nextmavens_delete_project':
        return await projectTools.deleteProject(args);

      // API Key management operations
      case 'nextmavens_create_api_key':
        return await apiKeyTools.createApiKey(args);

      case 'nextmavens_list_api_keys':
        return await apiKeyTools.listApiKeys(args);

      case 'nextmavens_get_api_key':
        return await apiKeyTools.getApiKey(args);

      case 'nextmavens_delete_api_key':
        return await apiKeyTools.deleteApiKey(args);

      // Realtime management operations
      case 'nextmavens_enable_realtime':
        return await realtimeTools.enableRealtime(args);

      case 'nextmavens_disable_realtime':
        return await realtimeTools.disableRealtime(args);

      case 'nextmavens_list_realtime_tables':
        return await realtimeTools.listRealtimeTables(args);

      case 'nextmavens_realtime_connection_info':
        return await realtimeTools.getConnectionInfo(args);

      // Storage management operations
      case 'nextmavens_create_bucket':
        return await storageMgmtTools.createBucket(args);

      case 'nextmavens_list_buckets':
        return await storageMgmtTools.listBuckets(args);

      case 'nextmavens_delete_bucket':
        return await storageMgmtTools.deleteBucket(args);

      case 'nextmavens_create_folder':
        return await storageMgmtTools.createFolder(args);

      case 'nextmavens_update_bucket':
        return await storageMgmtTools.updateBucket(args);

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${error.message || error}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('NextMavens MCP Server running');
  console.error('Connected to:', API_URL);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
