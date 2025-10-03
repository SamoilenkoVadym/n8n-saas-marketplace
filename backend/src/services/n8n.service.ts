import axios, { AxiosError } from 'axios';
import { prisma } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  tags?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface N8nApiError {
  message: string;
  code?: string;
}

/**
 * Test connection to user's n8n instance
 */
export async function testConnection(baseUrl: string, apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    // Normalize URL - remove trailing slash
    const normalizedUrl = baseUrl.replace(/\/$/, '');

    // Test connection by fetching workflows
    const response = await axios.get(`${normalizedUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
      },
      timeout: 10000,
    });

    if (response.status === 200) {
      return { success: true, message: 'Connection successful' };
    }

    return { success: false, message: 'Invalid response from n8n instance' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<N8nApiError>;

      if (axiosError.response?.status === 401) {
        return { success: false, message: 'Invalid API key' };
      }

      if (axiosError.code === 'ECONNREFUSED') {
        return { success: false, message: 'Cannot connect to n8n instance. Check the URL.' };
      }

      if (axiosError.code === 'ETIMEDOUT') {
        return { success: false, message: 'Connection timeout. Check the URL and try again.' };
      }

      return {
        success: false,
        message: axiosError.response?.data?.message || 'Connection failed'
      };
    }

    return { success: false, message: 'Connection failed. Please check your credentials.' };
  }
}

/**
 * Save user's n8n connection credentials
 */
export async function saveConnection(
  userId: string,
  baseUrl: string,
  apiKey: string
): Promise<void> {
  // Encrypt the API key before storing
  const encryptedApiKey = encrypt(apiKey);

  // Normalize URL
  const normalizedUrl = baseUrl.replace(/\/$/, '');

  await prisma.userN8nConnection.upsert({
    where: { userId },
    update: {
      apiKey: encryptedApiKey,
      baseUrl: normalizedUrl,
      isActive: true,
    },
    create: {
      userId,
      apiKey: encryptedApiKey,
      baseUrl: normalizedUrl,
      isActive: true,
    },
  });
}

/**
 * Remove user's n8n connection
 */
export async function disconnectN8n(userId: string): Promise<void> {
  await prisma.userN8nConnection.delete({
    where: { userId },
  });
}

/**
 * Get user's n8n connection status
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  baseUrl?: string;
  maskedApiKey?: string;
}> {
  const connection = await prisma.userN8nConnection.findUnique({
    where: { userId },
  });

  if (!connection || !connection.isActive) {
    return { connected: false };
  }

  // Mask the API key for display (show first 4 and last 4 characters)
  const decryptedKey = decrypt(connection.apiKey);
  const maskedKey = decryptedKey.length > 8
    ? `${decryptedKey.substring(0, 4)}${'*'.repeat(decryptedKey.length - 8)}${decryptedKey.substring(decryptedKey.length - 4)}`
    : '****';

  return {
    connected: true,
    baseUrl: connection.baseUrl,
    maskedApiKey: maskedKey,
  };
}

/**
 * Get user's n8n connection
 */
async function getUserConnection(userId: string): Promise<{ baseUrl: string; apiKey: string }> {
  const connection = await prisma.userN8nConnection.findUnique({
    where: { userId, isActive: true },
  });

  if (!connection) {
    throw new Error('n8n instance not connected. Please connect your n8n instance first.');
  }

  const apiKey = decrypt(connection.apiKey);

  return {
    baseUrl: connection.baseUrl,
    apiKey,
  };
}

/**
 * Deploy workflow to user's n8n instance
 */
export async function deployWorkflow(
  userId: string,
  workflow: any,
  name: string
): Promise<{ success: boolean; workflowId?: string; message?: string; workflowUrl?: string }> {
  try {
    const { baseUrl, apiKey } = await getUserConnection(userId);

    // Prepare workflow for n8n
    const n8nWorkflow = {
      name,
      nodes: workflow.nodes || [],
      connections: workflow.connections || {},
      active: false, // Don't activate automatically
      settings: workflow.settings || {},
      staticData: workflow.staticData || null,
      tags: [],
    };

    const response = await axios.post<N8nWorkflow>(
      `${baseUrl}/api/v1/workflows`,
      n8nWorkflow,
      {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.status === 200 || response.status === 201) {
      const workflowUrl = `${baseUrl}/workflow/${response.data.id}`;
      return {
        success: true,
        workflowId: response.data.id,
        message: 'Workflow deployed successfully',
        workflowUrl,
      };
    }

    return { success: false, message: 'Failed to deploy workflow' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<N8nApiError>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Deployment failed',
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return { success: false, message: 'Deployment failed' };
  }
}

/**
 * Get workflows from user's n8n instance
 */
export async function getWorkflows(userId: string): Promise<N8nWorkflow[]> {
  try {
    const { baseUrl, apiKey } = await getUserConnection(userId);

    const response = await axios.get<{ data: N8nWorkflow[] }>(
      `${baseUrl}/api/v1/workflows`,
      {
        headers: {
          'X-N8N-API-KEY': apiKey,
        },
        timeout: 10000,
      }
    );

    return response.data.data || [];
  } catch (error) {
    if (error instanceof Error && error.message.includes('not connected')) {
      throw error;
    }

    console.error('Error fetching workflows:', error);
    throw new Error('Failed to fetch workflows from n8n');
  }
}

/**
 * Delete workflow from user's n8n instance
 */
export async function deleteWorkflow(
  userId: string,
  workflowId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { baseUrl, apiKey } = await getUserConnection(userId);

    await axios.delete(`${baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
      },
      timeout: 10000,
    });

    return { success: true, message: 'Workflow deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<N8nApiError>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Deletion failed',
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return { success: false, message: 'Deletion failed' };
  }
}

/**
 * Activate/deactivate workflow in user's n8n instance
 */
export async function toggleWorkflowActivation(
  userId: string,
  workflowId: string,
  active: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const { baseUrl, apiKey } = await getUserConnection(userId);

    await axios.patch(
      `${baseUrl}/api/v1/workflows/${workflowId}`,
      { active },
      {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      message: `Workflow ${active ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<N8nApiError>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Activation toggle failed',
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return { success: false, message: 'Activation toggle failed' };
  }
}
