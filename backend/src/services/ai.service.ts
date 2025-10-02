import { AzureOpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Azure OpenAI client
const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
});

const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

// System prompt for n8n workflow generation
const SYSTEM_PROMPT = `You are an expert n8n workflow architect. Generate complex, production-ready n8n workflows based on user descriptions.

Requirements:
- Use 5-15 nodes for comprehensive automation
- Include error handling nodes (IF nodes for checks)
- Add proper node connections with correct port mappings
- Use realistic node types from n8n (HTTP Request, Code, Set, IF, Merge, etc.)
- Include metadata: node positions (x, y coordinates) in a logical left-to-right, top-to-bottom layout
- Return ONLY valid JSON, no explanations

Response format:
{
  "nodes": [
    {
      "id": "unique_id",
      "name": "Node Name",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [x, y],
      "parameters": {
        "url": "https://example.com/api",
        "method": "GET"
      }
    }
  ],
  "connections": {
    "node_id": {
      "main": [[{"node": "target_node_id", "type": "main", "index": 0}]]
    }
  }
}

Important:
- Node IDs must be unique
- Connections reference node IDs (not names)
- Position coordinates: start at [0, 0], increment by ~300 horizontally, ~200 vertically
- Include realistic parameters for each node type
- Always add at least one error handling path (IF node checking for errors)`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WorkflowGenerationResult {
  conversationId: string;
  workflow: any;
  isValid: boolean;
  message: string;
  validationErrors?: string[];
  creditsUsed?: number;
  creditsRemaining?: number;
}

// Credit cost for AI workflow generation
export const AI_GENERATION_CREDIT_COST = 5;

/**
 * Validate n8n workflow structure
 */
function validateWorkflow(workflow: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if workflow has required fields
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Workflow must have a "nodes" array');
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push('Workflow must have a "connections" object');
  }

  // Check nodes
  if (workflow.nodes) {
    if (workflow.nodes.length < 5 || workflow.nodes.length > 15) {
      errors.push('Workflow must have between 5 and 15 nodes');
    }

    // Validate each node
    workflow.nodes.forEach((node: any, index: number) => {
      if (!node.id) {
        errors.push(`Node at index ${index} is missing "id"`);
      }
      if (!node.name) {
        errors.push(`Node at index ${index} is missing "name"`);
      }
      if (!node.type) {
        errors.push(`Node at index ${index} is missing "type"`);
      }
      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Node at index ${index} has invalid "position"`);
      }
    });

    // Check for duplicate IDs
    const ids = workflow.nodes.map((n: any) => n.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Workflow has duplicate node IDs');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate n8n workflow using Azure OpenAI
 */
export async function generateWorkflow(
  userId: string,
  userMessage: string,
  conversationId?: string
): Promise<WorkflowGenerationResult> {
  const maxRetries = 2;
  let retryCount = 0;

  // Load existing conversation or create new one
  let conversation;
  let messages: Message[] = [];

  if (conversationId) {
    conversation = await prisma.aiConversation.findUnique({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Load previous messages
    messages = conversation.messages as unknown as Message[];
  }

  // Add new user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  while (retryCount <= maxRetries) {
    try {
      // Call Azure OpenAI (gpt-4o)
      console.log('Calling Azure OpenAI with deployment:', DEPLOYMENT_NAME);
      console.log('Messages count:', messages.length + 1); // +1 for system prompt

      const response = await client.chat.completions.create({
        model: DEPLOYMENT_NAME,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      console.log('Azure OpenAI response:', JSON.stringify(response, null, 2));
      console.log('Response choices:', response.choices?.length || 0);
      console.log('First choice:', response.choices?.[0]);

      const assistantMessage = response.choices[0]?.message?.content;

      console.log('Assistant message content:', assistantMessage ? `${assistantMessage.substring(0, 100)}...` : 'NULL/UNDEFINED');

      if (!assistantMessage) {
        console.error('Empty response from AI. Full response:', JSON.stringify(response, null, 2));
        throw new Error('No response from AI');
      }

      // Parse workflow JSON
      let workflow;
      try {
        // Extract JSON from response (in case AI adds explanations)
        const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        workflow = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error('Failed to parse workflow JSON');
      }

      // Validate workflow
      const validation = validateWorkflow(workflow);

      if (validation.isValid) {
        // Add assistant message to conversation
        messages.push({
          role: 'assistant',
          content: assistantMessage,
        });

        // Save conversation
        if (conversation) {
          conversation = await prisma.aiConversation.update({
            where: { id: conversation.id },
            data: {
              messages: messages as any,
              workflow: workflow as any,
            },
          });
        } else {
          conversation = await prisma.aiConversation.create({
            data: {
              userId,
              messages: messages as any,
              workflow: workflow as any,
            },
          });
        }

        // Deduct credits from user (ONLY after successful generation)
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { decrement: AI_GENERATION_CREDIT_COST },
          },
          select: { credits: true },
        });

        console.log(`Credits deducted: ${AI_GENERATION_CREDIT_COST}, Remaining: ${updatedUser.credits}`);

        return {
          conversationId: conversation.id,
          workflow,
          isValid: true,
          message: 'Workflow generated successfully',
          creditsUsed: AI_GENERATION_CREDIT_COST,
          creditsRemaining: updatedUser.credits,
        };
      }

      // Validation failed, retry
      retryCount++;
      if (retryCount > maxRetries) {
        return {
          conversationId: conversation?.id || '',
          workflow,
          isValid: false,
          message: 'Workflow validation failed after retries',
          validationErrors: validation.errors,
        };
      }

      // Add validation errors to messages for retry
      messages.push({
        role: 'assistant',
        content: assistantMessage,
      });
      messages.push({
        role: 'user',
        content: `The workflow has validation errors: ${validation.errors.join(', ')}. Please fix these issues and generate a valid workflow.`,
      });
    } catch (error) {
      console.error('AI generation error:', error);

      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate valid workflow after retries');
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string) {
  const conversations = await prisma.aiConversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      messages: true,
      workflow: true,
    },
  });

  return conversations;
}

/**
 * Regenerate workflow from existing conversation
 */
export async function regenerateWorkflow(
  userId: string,
  conversationId: string
): Promise<WorkflowGenerationResult> {
  const conversation = await prisma.aiConversation.findUnique({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const messages = conversation.messages as unknown as Message[];

  if (messages.length === 0) {
    throw new Error('No messages in conversation');
  }

  // Get the last user message
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  if (!lastUserMessage) {
    throw new Error('No user message found');
  }

  // Regenerate with the same prompt
  return generateWorkflow(userId, lastUserMessage.content, conversationId);
}
