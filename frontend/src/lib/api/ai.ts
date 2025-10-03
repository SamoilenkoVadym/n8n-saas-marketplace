const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface AiChatResponse {
  conversationId: string;
  workflow: any;
  isValid: boolean;
  message: string;
  validationErrors?: string[];
  creditsUsed?: number;
  creditsRemaining?: number;
}

export interface AiConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  workflow: any;
}

export interface InsufficientCreditsError {
  error: string;
  message: string;
  creditsRequired: number;
  creditsAvailable: number;
}

/**
 * Send a message to AI and generate workflow
 * Costs 5 credits per generation
 */
export const sendMessage = async (
  message: string,
  conversationId?: string
): Promise<AiChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate workflow' }));

    // Special handling for insufficient credits
    if (response.status === 400 && error.error === 'Insufficient credits') {
      const insufficientError = new Error(error.message || 'Insufficient credits') as Error & InsufficientCreditsError;
      insufficientError.error = error.error;
      insufficientError.message = error.message;
      insufficientError.creditsRequired = error.creditsRequired;
      insufficientError.creditsAvailable = error.creditsAvailable;
      throw insufficientError;
    }

    // Special handling for AI service unavailable
    if (response.status === 503) {
      throw new Error('AI service is currently unavailable. Please contact support if Azure OpenAI credentials are not configured.');
    }

    throw new Error(error.error || 'Failed to generate workflow');
  }

  return response.json();
};

/**
 * Get user's conversation history
 */
export const getConversations = async (): Promise<{ conversations: AiConversation[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/conversations`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch conversations' }));
    throw new Error(error.error || 'Failed to fetch conversations');
  }

  return response.json();
};

/**
 * Regenerate workflow from existing conversation
 * Costs 5 credits per generation
 */
export const regenerateWorkflow = async (conversationId: string): Promise<AiChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/ai/conversations/${conversationId}/regenerate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to regenerate workflow' }));

    // Special handling for insufficient credits
    if (response.status === 400 && error.error === 'Insufficient credits') {
      const insufficientError = new Error(error.message || 'Insufficient credits') as Error & InsufficientCreditsError;
      insufficientError.error = error.error;
      insufficientError.message = error.message;
      insufficientError.creditsRequired = error.creditsRequired;
      insufficientError.creditsAvailable = error.creditsAvailable;
      throw insufficientError;
    }

    throw new Error(error.error || 'Failed to regenerate workflow');
  }

  return response.json();
};
