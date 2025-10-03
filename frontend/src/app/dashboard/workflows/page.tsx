'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Workflow, ExternalLink, Trash2, Power, PowerOff, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  createdAt?: string;
  updatedAt?: string;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [n8nConnected, setN8nConnected] = useState(false);
  const [n8nBaseUrl, setN8nBaseUrl] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkN8nConnection();
  }, []);

  const checkN8nConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/n8n/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const status = await response.json();

      if (status.connected) {
        setN8nConnected(true);
        setN8nBaseUrl(status.baseUrl || '');
        fetchWorkflows();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking n8n connection:', error);
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/n8n/workflows', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch workflows');
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (workflowId: string, currentStatus: boolean) => {
    setActionLoading(workflowId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/n8n/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchWorkflows();
      } else {
        toast.error(data.error || 'Failed to toggle workflow');
      }
    } catch (error) {
      toast.error('Failed to toggle workflow');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(workflowId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/n8n/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchWorkflows();
      } else {
        toast.error(data.error || 'Failed to delete workflow');
      }
    } catch (error) {
      toast.error('Failed to delete workflow');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!n8nConnected) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-8">My Workflows</h1>

          <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                <Workflow className="w-8 h-8 text-[#FF9500]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">
                n8n Instance Not Connected
              </h2>
              <p className="text-sm text-[#86868B] mb-6">
                Connect your n8n instance to view and manage your workflows directly from here.
              </p>
              <Link
                href="/dashboard/settings"
                className="inline-block px-6 py-3 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5] transition-colors font-medium"
              >
                Connect n8n Instance
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#1D1D1F]">My Workflows</h1>
          <button
            onClick={() => fetchWorkflows()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-colors text-[#1D1D1F]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {workflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                <Workflow className="w-8 h-8 text-[#007AFF]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">No Workflows Yet</h2>
              <p className="text-sm text-[#86868B] mb-6">
                Deploy your first AI-generated workflow to see it here.
              </p>
              <Link
                href="/dashboard/ai-builder"
                className="inline-block px-6 py-3 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5] transition-colors font-medium"
              >
                Create Workflow
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#1D1D1F]">{workflow.name}</h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workflow.active
                            ? 'bg-[#34C759]/10 text-[#34C759]'
                            : 'bg-[#86868B]/10 text-[#86868B]'
                        }`}
                      >
                        {workflow.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <p className="text-sm text-[#86868B]">
                      {workflow.nodes?.length || 0} nodes
                      {workflow.updatedAt && ` · Updated ${new Date(workflow.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`${n8nBaseUrl}/workflow/${workflow.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors"
                      title="Edit in n8n"
                    >
                      <ExternalLink className="w-5 h-5 text-[#007AFF]" />
                    </a>

                    <button
                      onClick={() => handleToggleActivation(workflow.id, workflow.active)}
                      disabled={actionLoading === workflow.id}
                      className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors disabled:opacity-50"
                      title={workflow.active ? 'Deactivate' : 'Activate'}
                    >
                      {workflow.active ? (
                        <PowerOff className="w-5 h-5 text-[#FF9500]" />
                      ) : (
                        <Power className="w-5 h-5 text-[#34C759]" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(workflow.id, workflow.name)}
                      disabled={actionLoading === workflow.id}
                      className="p-2 hover:bg-[#FF3B30]/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-[#FF3B30]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
