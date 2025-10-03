'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectionStatus {
  connected: boolean;
  baseUrl?: string;
  maskedApiKey?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    baseUrl: '',
    apiKey: '',
  });
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
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

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.baseUrl || !formData.apiKey) {
      setMessage({ type: 'error', text: 'Please enter both URL and API key' });
      return;
    }

    setTestLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/n8n/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!formData.baseUrl || !formData.apiKey) {
      setMessage({ type: 'error', text: 'Please enter both URL and API key' });
      return;
    }

    setSaveLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/n8n/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ baseUrl: '', apiKey: '' });
        fetchConnectionStatus();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save connection' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your n8n instance?')) {
      return;
    }

    setDisconnectLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/n8n/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchConnectionStatus();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect' });
    } finally {
      setDisconnectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg p-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-8">Settings</h1>

        {/* Connection Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-8 mb-6">
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-4">n8n Instance Connection</h2>

          {connectionStatus.connected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#34C759] rounded-full"></div>
                <span className="text-sm font-medium text-[#34C759]">Connected</span>
              </div>

              <div className="bg-[#F5F5F7] rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-[#86868B]">Instance URL:</span>
                  <p className="text-sm font-medium text-[#1D1D1F]">{connectionStatus.baseUrl}</p>
                </div>
                <div>
                  <span className="text-sm text-[#86868B]">API Key:</span>
                  <p className="text-sm font-mono text-[#1D1D1F]">{connectionStatus.maskedApiKey}</p>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={disconnectLoading}
                className="px-4 py-2 bg-[#FF3B30] text-white rounded-lg hover:bg-[#FF2D20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disconnectLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#FF9500] rounded-full"></div>
                <span className="text-sm font-medium text-[#FF9500]">Not Connected</span>
              </div>
              <p className="text-sm text-[#86868B]">
                Connect your n8n instance to deploy AI-generated workflows directly.
              </p>
            </div>
          )}
        </div>

        {/* Connection Form */}
        {!connectionStatus.connected && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-8 mb-6">
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Connect n8n Instance</h3>

            {message && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  message.type === 'success'
                    ? 'bg-[#34C759]/10 text-[#34C759]'
                    : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  n8n Instance URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-n8n-instance.com"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your n8n API key"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testLoading}
                  className="px-4 py-2 border border-[#007AFF] text-[#007AFF] rounded-lg hover:bg-[#007AFF]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={handleSaveConnection}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? 'Saving...' : 'Save Connection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E7] p-8">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-[#1D1D1F]">How to get your n8n API key</h3>
            <svg
              className={`w-5 h-5 text-[#86868B] transition-transform ${
                showInstructions ? 'transform rotate-180' : ''
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {showInstructions && (
            <div className="mt-4 space-y-3 text-sm text-[#1D1D1F]">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log in to your n8n instance</li>
                <li>Go to <span className="font-medium">Settings → API</span></li>
                <li>Click <span className="font-medium">Create API Key</span></li>
                <li>Give your key a name (e.g., "Marketplace Integration")</li>
                <li>Copy the generated API key</li>
                <li>Paste it here along with your n8n instance URL</li>
              </ol>
              <div className="mt-4 p-4 bg-[#F5F5F7] rounded-lg">
                <p className="text-xs text-[#86868B]">
                  <strong>Note:</strong> Your API key is encrypted and stored securely. We only use it to
                  deploy workflows to your n8n instance. You can disconnect at any time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
