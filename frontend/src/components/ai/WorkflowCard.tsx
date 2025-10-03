'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Check, Workflow, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface WorkflowCardProps {
  workflow: any;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('');

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

  const handleDeployClick = async () => {
    // Check if n8n is connected
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/api/n8n/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const status = await response.json();

      if (!status.connected) {
        toast.error(
          <div>
            <p className="font-semibold">n8n not connected</p>
            <p className="text-sm">
              <Link href="/dashboard/settings" className="underline">
                Connect your n8n instance
              </Link>
              {' '}first to deploy workflows.
            </p>
          </div>,
          { duration: 5000 }
        );
        return;
      }

      setShowDeployModal(true);
    } catch (error) {
      toast.error('Failed to check n8n connection');
    }
  };

  const handleDeploy = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setDeploying(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/n8n/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          workflow,
          name: workflowName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          <div>
            <p className="font-semibold">Workflow deployed!</p>
            {data.workflowUrl && (
              <a
                href={data.workflowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                Open in n8n →
              </a>
            )}
          </div>,
          { duration: 5000 }
        );
        setShowDeployModal(false);
        setWorkflowName('');
      } else {
        toast.error(data.error || 'Failed to deploy workflow');
      }
    } catch (error) {
      toast.error('Failed to deploy workflow');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="bg-[#2F3E46] border border-[#D3DDDE]/10 rounded-2xl shadow-lg overflow-hidden">
      {/* Header - Aqua Green Background */}
      <div className="bg-[#075D56]/10 border-b border-[#075D56]/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#075D56]/20 rounded-lg">
            <Workflow className="w-5 h-5 text-[#075D56]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Generated Workflow</h3>
            <p className="text-sm text-[#D3DDDE]">
              {nodeCount} nodes, {connectionCount} connections
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Node List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#D3DDDE]">Workflow Nodes:</h4>
          <div className="space-y-2">
            {nodeTypes.slice(0, isExpanded ? nodeTypes.length : 5).map((node: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-2 bg-[#243037] rounded-lg border border-[#D3DDDE]/10"
              >
                <div className="w-8 h-8 rounded-full bg-[#075D56]/20 flex items-center justify-center text-xs font-semibold text-[#075D56]">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{node.name}</p>
                  <p className="text-xs text-[#D3DDDE] truncate">{node.type}</p>
                </div>
              </div>
            ))}
          </div>

          {nodeTypes.length > 5 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-[#075D56] hover:text-[#FF8B05] transition-colors flex items-center gap-1"
            >
              Show {nodeTypes.length - 5} more nodes
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible JSON */}
        <details className="mt-6 group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between px-4 py-3 bg-[#243037] rounded-lg hover:bg-[#243037]/80 transition-colors border border-[#D3DDDE]/10">
              <span className="text-sm font-medium flex items-center gap-2 text-white">
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-[#075D56]" />
                View JSON
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleCopy();
                }}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-[#2F3E46] hover:bg-[#243037] rounded-md transition-colors text-[#D3DDDE] hover:text-[#075D56]"
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
            <pre className="text-xs bg-[#243037] p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto text-[#D3DDDE] border border-[#D3DDDE]/10">
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </div>
        </details>

        {/* Action Buttons - Exact Figma Colors */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDeployClick}
            className="flex-1 px-4 py-2.5 bg-[#FF8B05] hover:bg-[#E67A00] rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl"
          >
            <Upload className="w-4 h-4" />
            Deploy to n8n
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-[#075D56] hover:bg-[#064A45] rounded-xl font-medium transition-colors flex items-center gap-2 text-white shadow-lg hover:shadow-xl"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2F3E46] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#D3DDDE]/20">
            <h3 className="text-xl font-semibold text-white mb-4">Deploy Workflow to n8n</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#D3DDDE] mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="w-full px-4 py-2 bg-[#E8EEEF] border border-[#D3DDDE] text-[#243037] rounded-lg placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF8B05]/50 focus:border-[#FF8B05]"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeployModal(false);
                  setWorkflowName('');
                }}
                disabled={deploying}
                className="flex-1 px-4 py-2 bg-[#243037] hover:bg-[#243037]/80 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                disabled={deploying || !workflowName.trim()}
                className="flex-1 px-4 py-2 bg-[#FF8B05] hover:bg-[#E67A00] rounded-lg font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying ? 'Deploying...' : 'Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
