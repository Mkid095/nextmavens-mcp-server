/**
 * API Key Management Tools for NextMavens MCP Server
 */

export class ApiKeyTools {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Create a new API key with expiration options
   */
  async createApiKey(args: any) {
    const { name, scopes = [], expiration = 'forever' } = args;

    try {
      // Map expiration to days
      const expirationMap: Record<string, number | null> = {
        '1day': 1,
        '1week': 7,
        '2weeks': 14,
        '3weeks': 21,
        '30days': 30,
        '1year': 365,
        'forever': null
      };

      const expiresAt = expirationMap[expiration];

      const response = await fetch(`${this.apiUrl}/api/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          name,
          scopes,
          expiresAt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create API key' }, null, 2)
          }],
          isError: true
        };
      }

      const keyData = data.data || data.key || data;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            name: keyData.name,
            keyPrefix: keyData.key_prefix || keyData.keyPrefix,
            scopes: keyData.scopes,
            expiresAt: keyData.expires_at || keyData.expiresAt,
            // Include full key on creation (only time it's shown)
            fullKey: keyData.key || keyData.fullKey || keyData.api_key,
            warning: expiration !== 'forever' ? `This key will expire in ${expiration}` : null
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
   * List all API keys
   */
  async listApiKeys(args: any = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/api/keys`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to list API keys' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            keys: data.data || data.keys || []
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
   * Delete an API key
   */
  async deleteApiKey(args: any) {
    const { keyId } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to delete API key' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `API key ${keyId} deleted successfully`
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
   * Get API key details
   */
  async getApiKey(args: any) {
    const { keyId } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/keys/${keyId}`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to get API key' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            key: data.data || data.key || data
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
