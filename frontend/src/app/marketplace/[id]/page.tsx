'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTemplate, downloadTemplate } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const { token } = useAuthStore();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [downloadedWorkflow, setDownloadedWorkflow] = useState<any>(null);

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
      setDownloadedWorkflow(workflow);
      setShowSuccessDialog(true);

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

      // Refresh template to update download count
      fetchTemplate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to download template');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/marketplace')} className="mb-6">
          ← Back to Marketplace
        </Button>

        {/* Template Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{template.name}</CardTitle>
                <CardDescription className="text-base">{template.description}</CardDescription>
              </div>
              <Badge
                variant={template.price === 0 ? 'default' : 'secondary'}
                className={`${template.price === 0 ? 'bg-green-500' : 'bg-orange-500'} text-lg px-4 py-2`}
              >
                {template.price === 0 ? 'Free' : `${template.price} credits`}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Author & Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
              <span>
                By <span className="font-semibold">{template.author.name || template.author.email}</span>
              </span>
              <span className="font-semibold">{template.downloads} downloads</span>
            </div>

            {/* Workflow Preview */}
            {workflowNodes.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Workflow Nodes ({workflowNodes.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workflowNodes.map((node: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-50 border rounded px-3 py-2 text-sm"
                    >
                      {node.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="border-t pt-4">
              {template.price === 0 ? (
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full"
                  size="lg"
                >
                  {isDownloading ? 'Downloading...' : 'Download Workflow'}
                </Button>
              ) : template.hasAccess ? (
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full"
                  size="lg"
                >
                  {isDownloading ? 'Downloading...' : 'Download Workflow'}
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg">
                  Buy for {template.price} credits (Coming Soon)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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