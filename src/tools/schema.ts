/**
 * Schema Management Tools for NextMavens MCP Server
 * Provides database schema operations similar to Supabase MCP
 */

export class SchemaTools {
  private apiKey: string;
  private apiUrl: string;
  private graphqlUrl: string;

  constructor(apiKey: string, apiUrl: string, graphqlUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.graphqlUrl = graphqlUrl;
  }

  /**
   * Create a new table with columns
   */
  async createTable(args: any) {
    const { tableName, columns, primaryKeys = ['id'] } = args;

    try {
      const columnDefs = columns.map((col: any) => {
        const nullable = col.nullable === false ? 'NOT NULL' : '';
        const unique = col.unique ? 'UNIQUE' : '';
        const defaultVal = col.default ? `DEFAULT ${col.default}` : '';
        return `${col.name} ${col.type} ${nullable} ${unique} ${defaultVal}`.trim();
      }).join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs}, PRIMARY KEY (${primaryKeys.join(', ')}));`;

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create table' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            tableName,
            message: `Table ${tableName} created successfully`,
            columns: columns.map((c: any) => c.name)
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Add a column to an existing table
   */
  async addColumn(args: any) {
    const { tableName, column } = args;

    try {
      const nullable = column.nullable === false ? 'NOT NULL' : '';
      const defaultVal = column.default ? `DEFAULT ${column.default}` : '';
      const columnDef = `${column.name} ${column.type} ${nullable} ${defaultVal}`.trim();

      const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnDef};`;

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to add column' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            tableName,
            column: column.name,
            message: `Column ${column.name} added to ${tableName}`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Create or update RLS policy
   */
  async createPolicy(args: any) {
    const { tableName, policyName, operation, using, check, roles = ['authenticated'] } = args;

    try {
      const operationMap: Record<string, string> = {
        'select': 'SELECT',
        'insert': 'INSERT',
        'update': 'UPDATE',
        'delete': 'DELETE',
        'all': 'ALL'
      };

      const op = operationMap[operation.toLowerCase()] || 'ALL';

      let sql = `DROP POLICY IF EXISTS ${policyName} ON ${tableName};`;
      sql += `CREATE POLICY ${policyName} ON ${tableName} FOR ${op} TO ${roles.join(', ')}`;

      if (using) {
        sql += ` USING (${using})`;
      }

      if (check) {
        sql += ` WITH CHECK (${check})`;
      }

      sql += ';';

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create policy' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            tableName,
            policyName,
            operation: op,
            message: `Policy ${policyName} created on ${tableName}`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Enable RLS on a table
   */
  async enableRLS(args: any) {
    const { tableName } = args;

    try {
      const sql = `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`;

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to enable RLS' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            tableName,
            message: `RLS enabled on ${tableName}`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Get table schema information
   */
  async getTableSchema(args: any) {
    const { tableName } = args;

    try {
      const sql = `SELECT column_name, data_type, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position;`;

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to get schema' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tableName,
            columns: data.data || data.results || []
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * List all tables
   */
  async listTables(args: any = {}) {
    try {
      const sql = `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;

      const response = await fetch(`${this.apiUrl}/api/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to list tables' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tables: data.data || data.results || []
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message || 'Network error' }, null, 2)
        }],
        isError: true
      };
    }
  }
}
