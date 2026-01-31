/**
 * Storage Management Tools for NextMavens MCP Server
 * Manages buckets, folders, and upload settings
 */

export class StorageMgmtTools {
  private apiKey: string;
  private storageUrl: string;

  constructor(apiKey: string, storageUrl: string) {
    this.apiKey = apiKey;
    this.storageUrl = storageUrl;
  }

  /**
   * Create a new storage bucket
   */
  async createBucket(args: any) {
    const { name, publicAccess = false, fileSizeLimit = 52428800 } = args;

    try {
      const response = await fetch(`${this.storageUrl}/api/buckets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          name,
          public: publicAccess,
          fileSizeLimit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create bucket' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            bucket: data.data || data.bucket || data
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
   * List all storage buckets
   */
  async listBuckets(args: any = {}) {
    try {
      const response = await fetch(`${this.storageUrl}/api/buckets`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to list buckets' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            buckets: data.data || data.buckets || []
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
   * Delete a storage bucket
   */
  async deleteBucket(args: any) {
    const { bucketId } = args;

    try {
      const response = await fetch(`${this.storageUrl}/api/buckets/${bucketId}`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to delete bucket' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Bucket ${bucketId} deleted successfully`
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
   * Create a folder in a bucket
   */
  async createFolder(args: any) {
    const { bucketId, folderPath } = args;

    try {
      const response = await fetch(`${this.storageUrl}/api/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          bucketId,
          path: folderPath
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create folder' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            folder: data.data || data.folder || data
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
   * Update bucket settings
   */
  async updateBucket(args: any) {
    const { bucketId, publicAccess, fileSizeLimit } = args;

    try {
      const response = await fetch(`${this.storageUrl}/api/buckets/${bucketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          public: publicAccess,
          fileSizeLimit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to update bucket' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            bucket: data.data || data.bucket || data
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
