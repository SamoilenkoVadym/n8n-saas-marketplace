'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Check, Workflow } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WorkflowCardProps {
  workflow: any;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!workflow) return null;

  const nodeCount = workflow.nodes?.length || 0;
  const connectionCount = Object.keys(workflow.connections || {}).length;

  const nodeTypes = workflow.nodes?.map((node: any) => {
    const typeName = node.type?.replace('n8n-nodes-base.', '') || 'Unknown';
    return {
      name: node.name || typeName,
      type: typeName,
    };
  }) || [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
      setCopied(true);
      toast.success('Workflow JSON copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-[#2A3441] border border-[#94A3B8]/10 rounded-2xl shadow-lg overflow-hidden">
      {/* Header - Solid Turquoise Background */}
      <div className="bg-[#0D9488]/10 border-b border-[#0D9488]/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0D9488]/20 rounded-lg">
            <Workflow className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Generated Workflow</h3>
            <p className="text-sm text-[#94A3B8]">
              {nodeCount} nodes, {connectionCount} connections
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Node List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#94A3B8]">Workflow Nodes:</h4>
          <div className="space-y-2">
            {nodeTypes.slice(0, isExpanded ? nodeTypes.length : 5).map((node: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-2 bg-[#1A2332] rounded-lg border border-[#94A3B8]/10"
              >
                <div className="w-8 h-8 rounded-full bg-[#0D9488]/20 flex items-center justify-center text-xs font-semibold text-[#0D9488]">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{node.name}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{node.type}</p>
                </div>
              </div>
            ))}
          </div>

          {nodeTypes.length > 5 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-[#0D9488] hover:text-[#14B8A6] transition-colors flex items-center gap-1"
            >
              Show {nodeTypes.length - 5} more nodes
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible JSON */}
        <details className="mt-6 group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1A2332] rounded-lg hover:bg-[#1A2332]/80 transition-colors border border-[#94A3B8]/10">
              <span className="text-sm font-medium flex items-center gap-2 text-white">
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-[#0D9488]" />
                View JSON
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleCopy();
                }}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-[#2A3441] hover:bg-[#1A2332] rounded-md transition-colors text-[#94A3B8] hover:text-[#0D9488]"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </summary>
          <div className="mt-3">
            <pre className="text-xs bg-[#1A2332] p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-[#94A3B8] border border-[#94A3B8]/10">
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </div>
        </details>

        {/* Action Buttons - Solid Colors */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#E55A2B] rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl">
            <Workflow className="w-4 h-4" />
            Save as Template
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0B7A6F] rounded-xl font-medium transition-colors flex items-center gap-2 text-white shadow-lg hover:shadow-xl"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}
