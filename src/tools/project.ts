/**
 * Project Management Tools for NextMavens MCP Server
 */

export class ProjectTools {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Create a new project
   */
  async createProject(args: any) {
    const { name, description, domain } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          name,
          description,
          domain
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to create project' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            project: data.data || data.project || data
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
   * List all projects for the authenticated user
   */
  async listProjects(args: any = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/api/projects`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to list projects' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            projects: data.data || data.projects || []
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
   * Get project details
   */
  async getProject(args: any) {
    const { projectId } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/projects/${projectId}`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to get project' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project: data.data || data.project || data
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
   * Update project
   */
  async updateProject(args: any) {
    const { projectId, name, description, domain } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          name,
          description,
          domain
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: data.error || 'Failed to update project' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            project: data.data || data.project || data
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
   * Delete project
   */
  async deleteProject(args: any) {
    const { projectId } = args;

    try {
      const response = await fetch(`${this.apiUrl}/api/projects/${projectId}`, {
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
            text: JSON.stringify({ error: data.error || 'Failed to delete project' }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Project ${projectId} deleted successfully`
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
