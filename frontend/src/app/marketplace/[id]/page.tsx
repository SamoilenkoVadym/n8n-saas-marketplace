'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTemplate, downloadTemplate } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  downloads: number;
  previewImage?: string;
  workflowJson?: any;
  hasAccess: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, fetchMe } = useAuthStore();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [downloadedWorkflow, setDownloadedWorkflow] = useState<any>(null);
  const [purchasedNow, setPurchasedNow] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    setIsLoading(true);
    try {
      const data = await getTemplate(params.id as string);
      setTemplate(data);
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setIsDownloading(true);
    try {
      const workflow = await downloadTemplate(params.id as string);

      // Check if this was a purchase (template wasn't free and user didn't have access)
      const wasPurchase = template && template.price > 0 && !template.hasAccess;

      if (wasPurchase) {
        setPurchasedNow(true);
        toast.success(`Template purchased for ${template.price} credits! Go to "My Purchases" to download.`, {
          duration: 6000
        });
        // Refresh user credits
        await fetchMe();
        // Refresh template to update access
        await fetchTemplate();

        // Redirect to purchases page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/purchases');
        }, 2000);
      } else {
        // Only auto-download for free templates or already purchased
        setDownloadedWorkflow(workflow);

        // Download as JSON file
        const blob = new Blob([JSON.stringify(workflow.workflowJson, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workflow.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (template?.price === 0) {
          toast.success('Free template downloaded!');
        } else {
          toast.success('Template downloaded!');
        }

        setShowSuccessDialog(true);

        // Refresh template to update download count
        await fetchTemplate();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to download template';
      toast.error(errorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ai: 'bg-purple-100 text-purple-800',
      marketing: 'bg-blue-100 text-blue-800',
      data: 'bg-green-100 text-green-800',
      automation: 'bg-yellow-100 text-yellow-800',
      integration: 'bg-pink-100 text-pink-800',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Template not found</div>
          <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const workflowNodes = template.workflowJson?.nodes || [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/marketplace')}
          className="mb-6 text-[#94A3B8] hover:text-[#FF6B35] transition-colors flex items-center gap-2"
        >
          ← Back to Marketplace
        </button>

        {/* Template Header */}
        <div className="card-premium mb-6 overflow-hidden">
          <div className="bg-gradient-aimpress p-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{template.name}</h1>
                <p className="text-xl text-white/90">{template.description}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                <div className="text-sm text-white/80 mb-1">Price</div>
                <div className="text-2xl font-bold">
                  {template.price === 0 ? 'Free' : `${template.price} credits`}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                {template.category}
              </span>
              {template.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  {tag}
                </span>
              ))}
            </div>

            {/* Author & Stats */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20 text-white/90">
              <span>
                Created by <span className="font-semibold text-white">{template.author.name || template.author.email}</span>
              </span>
              <span className="font-semibold">{template.downloads} downloads</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Description Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About this template</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Workflow Preview */}
            {workflowNodes.length > 0 && (
              <div className="border-t border-border/40 pt-6">
                <h2 className="text-2xl font-bold mb-4">Workflow Nodes ({workflowNodes.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {workflowNodes.map((node: any, index: number) => (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-medium hover:border-primary/50 transition-colors"
                    >
                      {node.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download/Purchase Button */}
            <div className="border-t border-border/40 pt-6">
              {template.price === 0 ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn-gradient w-full py-4 text-lg font-semibold disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : '↓ Download Workflow (Free)'}
                </button>
              ) : template.hasAccess ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn-gradient w-full py-4 text-lg font-semibold disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : '↓ Download Workflow'}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn-gradient w-full py-4 text-lg font-semibold disabled:opacity-50"
                >
                  {isDownloading ? 'Processing...' : `Purchase & Download for ${template.price} credits`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Successful!</DialogTitle>
              <DialogDescription>
                Your workflow has been downloaded. Import it into your n8n instance to start using it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm font-semibold mb-2">How to import:</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Open your n8n instance</li>
                  <li>Click on "Import from File"</li>
                  <li>Select the downloaded JSON file</li>
                  <li>Configure your credentials and settings</li>
                </ol>
              </div>
              <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}