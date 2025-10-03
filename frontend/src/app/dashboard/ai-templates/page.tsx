'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAIConversations } from '@/lib/api';
import api from '@/lib/api';
import { Download, Trash2, Eye, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: string; content: string }>;
  workflow: {
    nodes: any[];
    connections: any;
  };
}

export default function AITemplatesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AIConversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getAIConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch AI templates:', error);
      toast.error('Failed to load AI templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (conversation: AIConversation) => {
    const userMessage = conversation.messages.find(m => m.role === 'user');
    const templateName = userMessage?.content.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_') || 'ai_workflow';

    const blob = new Blob([JSON.stringify(conversation.workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Workflow downloaded!');
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this AI template?')) return;

    try {
      await api.delete(`/api/ai/conversations/${conversationId}`);
      setConversations(conversations.filter(c => c.id !== conversationId));
      toast.success('AI template deleted');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete template');
    }
  };

  const getUserPrompt = (conversation: AIConversation) => {
    const userMessage = conversation.messages.find(m => m.role === 'user');
    return userMessage?.content || 'No description';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#FF6B35]" />
            AI Generated Templates
          </h1>
          <p className="text-muted-foreground">
            Manage your AI-generated workflow templates
          </p>
        </div>
      </div>

      {/* Templates List */}
      {conversations.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No AI templates yet</h3>
          <p className="text-muted-foreground mb-6">
            Start creating workflows with AI Builder to see them here
          </p>
          <button
            onClick={() => router.push('/dashboard/ai-builder')}
            className="btn-gradient px-6 py-3"
          >
            Go to AI Builder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="card-premium p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title - User's prompt */}
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {getUserPrompt(conversation)}
                  </h3>

                  {/* Workflow Info */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {conversation.workflow?.nodes?.length || 0} nodes
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(conversation.createdAt)}
                    </div>
                  </div>

                  {/* Nodes Preview */}
                  {conversation.workflow?.nodes && conversation.workflow.nodes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {conversation.workflow.nodes.slice(0, 5).map((node: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20"
                        >
                          {node.name}
                        </span>
                      ))}
                      {conversation.workflow.nodes.length > 5 && (
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          +{conversation.workflow.nodes.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedWorkflow(conversation)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(conversation)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-primary"
                    title="Download JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(conversation.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Workflow Details</h2>
                  <p className="text-muted-foreground">
                    {getUserPrompt(selectedWorkflow)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Conversation History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conversation</h3>
                <div className="space-y-3">
                  {selectedWorkflow.messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Nodes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Workflow Nodes ({selectedWorkflow.workflow?.nodes?.length || 0})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedWorkflow.workflow?.nodes?.map((node: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-card border border-border rounded-lg"
                    >
                      <div className="font-medium text-sm mb-1">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{node.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownload(selectedWorkflow)}
                  className="btn-gradient flex-1 py-3"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download Workflow
                </button>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
