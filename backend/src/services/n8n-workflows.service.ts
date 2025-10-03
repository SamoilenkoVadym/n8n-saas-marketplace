import axios from 'axios';
import logger from '../config/logger';

const N8N_WORKFLOWS_API_URL = process.env.N8N_WORKFLOWS_API_URL || 'http://localhost:8000';

interface WorkflowMetadata {
  id: number;
  filename: string;
  name: string;
  folder: string;
  workflow_id: string;
  active: number;
  description: string;
  trigger_type: string;
  complexity: string;
  node_count: number;
  integrations: string[];
  tags: Array<{ id: string; name: string; createdAt: string; updatedAt: string }>;
  created_at: string;
  updated_at: string;
  file_hash: string;
  file_size: number;
  analyzed_at: string;
}

interface WorkflowsResponse {
  workflows: WorkflowMetadata[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  query: string;
  filters: {
    trigger: string;
    complexity: string;
    active_only: boolean;
  };
}

interface WorkflowStats {
  total: number;
  active: number;
  inactive: number;
  triggers: Record<string, number>;
  complexity: Record<string, number>;
  total_nodes: number;
  unique_integrations: number;
  last_indexed: string;
}

class N8NWorkflowsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = N8N_WORKFLOWS_API_URL;
  }

  /**
   * Get workflow statistics from n8n-workflows database
   */
  async getStats(): Promise<WorkflowStats> {
    try {
      const response = await axios.get<WorkflowStats>(`${this.baseUrl}/api/stats`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch workflow stats:', error);
      throw new Error('Failed to fetch workflow statistics');
    }
  }

  /**
   * Search workflows with filters and pagination
   */
  async searchWorkflows(params: {
    query?: string;
    trigger?: 'all' | 'Manual' | 'Scheduled' | 'Webhook';
    complexity?: 'all' | 'low' | 'medium' | 'high';
    active_only?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<WorkflowsResponse> {
    try {
      const response = await axios.get<WorkflowsResponse>(`${this.baseUrl}/api/workflows`, {
        params: {
          q: params.query || '',
          trigger: params.trigger || 'all',
          complexity: params.complexity || 'all',
          active_only: params.active_only || false,
          page: params.page || 1,
          per_page: params.per_page || 20,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to search workflows:', error);
      throw new Error('Failed to search workflows');
    }
  }

  /**
   * Get workflow detail by filename
   */
  async getWorkflowDetail(filename: string): Promise<WorkflowMetadata & { raw_workflow?: any }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/workflows/${filename}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch workflow detail for ${filename}:`, error);
      throw new Error('Failed to fetch workflow detail');
    }
  }

  /**
   * Download workflow JSON file
   * Note: Due to n8n-workflows container file structure, we use docker exec to read files directly
   */
  async downloadWorkflow(filename: string): Promise<any> {
    try {
      // First try the API endpoint
      try {
        const response = await axios.get(`${this.baseUrl}/api/workflows/${filename}/download`, {
          responseType: 'json',
        });
        return response.data;
      } catch (apiError) {
        // API endpoint failed, try docker exec approach
        logger.info(`API download failed for ${filename}, trying docker exec approach`);
      }

      // Read file directly from container using docker exec
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);

      const containerName = 'n8n-workflows'; // or 'ac64008da137...' if name not set
      const findCommand = `docker exec ${containerName} find /app/workflows -name "${filename}" 2>/dev/null | head -1`;

      const { stdout: filePath } = await execPromise(findCommand);
      const trimmedPath = filePath.trim();

      if (!trimmedPath) {
        throw new Error(`Workflow file ${filename} not found in container`);
      }

      const catCommand = `docker exec ${containerName} cat "${trimmedPath}"`;
      const { stdout: fileContent } = await execPromise(catCommand);

      return JSON.parse(fileContent);
    } catch (error) {
      logger.error(`Failed to download workflow ${filename}:`, error);
      throw new Error('Failed to download workflow file');
    }
  }

  /**
   * Get workflow diagram (Mermaid format)
   */
  async getWorkflowDiagram(filename: string): Promise<{ diagram: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/workflows/${filename}/diagram`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch workflow diagram for ${filename}:`, error);
      throw new Error('Failed to fetch workflow diagram');
    }
  }

  /**
   * Get AI-relevant workflows for context building
   * Returns workflows with AI/automation integrations
   */
  async getAIWorkflows(limit: number = 50): Promise<WorkflowMetadata[]> {
    try {
      const response = await this.searchWorkflows({
        query: 'AI Agent OpenAI',
        complexity: 'all',
        active_only: true,
        per_page: limit,
      });
      return response.workflows;
    } catch (error) {
      logger.error('Failed to fetch AI workflows:', error);
      throw new Error('Failed to fetch AI workflows');
    }
  }

  /**
   * Map workflow metadata to marketplace template format
   */
  mapToTemplateData(workflow: WorkflowMetadata) {
    // Map complexity to price tiers
    const priceMap = {
      low: 10,
      medium: 25,
      high: 50,
    };

    // Extract category from integrations
    const category = this.determineCategory(workflow.integrations);

    return {
      name: workflow.name,
      description: workflow.description,
      category,
      tags: [
        ...workflow.integrations.slice(0, 5), // First 5 integrations as tags
        workflow.trigger_type,
        workflow.complexity,
        `${workflow.node_count} nodes`,
      ],
      price: priceMap[workflow.complexity as keyof typeof priceMap] || 25,
      n8nWorkflowFilename: workflow.filename, // Store filename for download
      n8nWorkflowId: workflow.workflow_id,
      isPublished: workflow.active === 1,
    };
  }

  /**
   * Determine category based on integrations
   */
  private determineCategory(integrations: string[]): string {
    const aiKeywords = ['OpenAI', 'Gemini', 'Agent', 'Llm', 'Chat'];
    const marketingKeywords = ['Gmail', 'Email', 'Telegram', 'WhatsApp', 'Discord'];
    const dataKeywords = ['GoogleSheets', 'Supabase', 'Postgres', 'Database'];

    const hasAI = integrations.some((i) => aiKeywords.some((k) => i.includes(k)));
    const hasMarketing = integrations.some((i) => marketingKeywords.some((k) => i.includes(k)));
    const hasData = integrations.some((i) => dataKeywords.some((k) => i.includes(k)));

    if (hasAI) return 'ai';
    if (hasMarketing) return 'marketing';
    if (hasData) return 'data';
    return 'automation';
  }
}

export default new N8NWorkflowsService();
