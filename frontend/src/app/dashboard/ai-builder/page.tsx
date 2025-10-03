'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { sendMessage, AiChatResponse, InsufficientCreditsError } from '@/lib/api/ai';
import { Send, Loader2, AlertCircle, Coins } from 'lucide-react';
import WorkflowCard from '@/components/ai/WorkflowCard';
import ExamplePrompts from '@/components/ai/ExamplePrompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  workflow?: any;
}

const AI_CREDIT_COST = 5;

export default function AiBuilderPage() {
  const { user, updateCredits } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasEnoughCredits = (user?.credits ?? 0) >= AI_CREDIT_COST;
  const isDisabled = loading || !input.trim() || !hasEnoughCredits;

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (isDisabled) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response: AiChatResponse = await sendMessage(userMessage, conversationId);

      // Update conversation ID
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Update user credits
      if (response.creditsRemaining !== undefined) {
        updateCredits(response.creditsRemaining);
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
          workflow: response.workflow,
        },
      ]);

      // Update current workflow for preview
      setCurrentWorkflow(response.workflow);

      // Show success toast with credit info
      toast.success(
        `Workflow generated! ${response.creditsUsed || AI_CREDIT_COST} credits used, ${response.creditsRemaining ?? user?.credits} remaining`,
        { duration: 4000 }
      );
    } catch (error) {
      const err = error as Error & Partial<InsufficientCreditsError>;

      if (err.creditsRequired !== undefined) {
        // Insufficient credits error
        toast.error(
          <div>
            <p className="font-semibold">Not enough credits</p>
            <p className="text-sm">
              You need {err.creditsRequired} credits. You have {err.creditsAvailable}.
            </p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to generate workflow');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectExample = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
            AI Workflow Builder
          </h1>
          <p className="text-lg text-[#D3DDDE]">
            Describe your automation needs and let AI build the workflow for you
          </p>
        </div>

        {/* Credit Badge - Bright Orange */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF8B05]/10 border border-[#FF8B05]/30">
            <Coins className="w-4 h-4 text-[#FF8B05]" />
            <span className="text-sm font-medium text-[#FF8B05]">
              {AI_CREDIT_COST} credits
            </span>
            <div className="h-4 w-px bg-[#FF8B05]/30" />
            <span className="text-sm text-[#D3DDDE]">
              <span className="font-semibold text-white">{user?.credits ?? 0}</span> available
            </span>
          </div>
        </div>
      </div>

      {/* Insufficient Credits Warning */}
      {!hasEnoughCredits && (
        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FF8B05]/10 border border-[#FF8B05]/30">
            <AlertCircle className="w-5 h-5 text-[#FF8B05] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#FF8B05] mb-1">
                You need {AI_CREDIT_COST} credits to generate workflows
              </p>
              <p className="text-sm text-[#D3DDDE]">
                You currently have {user?.credits ?? 0} credits.{' '}
                <Link
                  href="/dashboard/credits"
                  className="font-semibold text-[#075D56] hover:text-[#FF8B05] underline transition-colors"
                >
                  Buy credits →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Left Column - Chat (40%) */}
        <div className="w-2/5 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-aimpress">
            {messages.length === 0 ? (
              <ExamplePrompts onSelectExample={handleSelectExample} />
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[#FF8B05] text-white'
                          : 'bg-[#2F3E46] border border-[#D3DDDE]/10 text-[#D3DDDE]'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#2F3E46] border border-[#D3DDDE]/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#075D56]" />
                        <span className="text-sm text-[#D3DDDE]">
                          Generating workflow...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  hasEnoughCredits
                    ? 'Describe your workflow... (e.g., "Send Slack message when GitHub PR is created")'
                    : `You need ${AI_CREDIT_COST} credits to generate workflows`
                }
                disabled={!hasEnoughCredits || loading}
                className="flex-1 resize-none rounded-xl bg-[#2F3E46] border border-[#D3DDDE]/20 px-4 py-3 text-white placeholder:text-[#D3DDDE]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8B05]/50 focus:border-[#FF8B05] disabled:opacity-50 disabled:cursor-not-allowed"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#D3DDDE]">
                {hasEnoughCredits ? 'Press Enter to send, Shift+Enter for new line' : ''}
              </p>
              <button
                onClick={handleSend}
                disabled={isDisabled}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Workflow Preview (60%) */}
        <div className="w-3/5 flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-aimpress">
            {currentWorkflow ? (
              <WorkflowCard workflow={currentWorkflow} />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#2F3E46]/50 rounded-2xl border-2 border-dashed border-[#D3DDDE]/20">
                <div className="text-center max-w-md px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#075D56]/10 flex items-center justify-center">
                    <Send className="w-8 h-8 text-[#075D56]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Workflow Preview</h3>
                  <p className="text-sm text-[#D3DDDE]">
                    Your generated workflow will appear here with a detailed preview, node list, and JSON export
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
