/**
 * Realtime Management Tools for NextMavens MCP Server
 */

export class RealtimeTools {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Enable realtime for a table
   */
  async enableRealtime(args: any) {
    const { tableName } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/realtime/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          table: tableName,
          enabled: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to enable realtime' }, null, 2)
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
            message: `Realtime enabled for table ${tableName}`
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
   * Disable realtime for a table
   */
  async disableRealtime(args: any) {
    const { tableName } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/realtime/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          table: tableName,
          enabled: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to disable realtime' }, null, 2)
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
            message: `Realtime disabled for table ${tableName}`
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
   * List tables with realtime enabled
   */
  async listRealtimeTables(args: any = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/api/realtime/tables`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to list realtime tables' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tables: data.data || data.tables || []
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
   * Get realtime connection info
   */
  async getConnectionInfo(args: any = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/realtime/health`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to get connection info' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'connected',
            websocketUrl: 'wss://api.nextmavens.cloud/realtime',
            info: data
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
