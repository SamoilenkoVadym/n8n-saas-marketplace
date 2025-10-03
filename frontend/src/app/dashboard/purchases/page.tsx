'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserPurchases } from '@/lib/api';
import api from '@/lib/api';
import { Download, Eye, ShoppingBag, Calendar, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Purchase {
  id: string;
  templateId: string;
  price: number;
  status: string;
  createdAt: string;
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    downloads: number;
    workflowJson: any;
    author: {
      name: string | null;
      email: string;
    };
  };
}

export default function PurchasedTemplatesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const data = await getUserPurchases();
      setPurchases(data || []);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      toast.error('Failed to load purchased templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchase: Purchase) => {
    try {
      // Download the template workflow
      const response = await api.post(`/api/templates/${purchase.templateId}/download`);
      const workflow = response.data;

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

      toast.success('Template downloaded!');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download template');
    }
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ai: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      marketing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      data: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      automation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      integration: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      productivity: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      communication: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      business: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
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
            <ShoppingBag className="w-8 h-8 text-[#FF6B35]" />
            Purchased Templates
          </h1>
          <p className="text-muted-foreground">
            Manage templates you've purchased from the marketplace
          </p>
        </div>
      </div>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse the marketplace to find templates that fit your needs
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="btn-gradient px-6 py-3"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="card-premium p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title */}
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold flex-1">
                      {purchase.template.name}
                    </h3>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                      Purchased
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {purchase.template.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {purchase.price === 0 ? 'Free' : `${purchase.price} credits`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(purchase.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {purchase.template.downloads} downloads
                    </div>
                  </div>

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(purchase.template.category)}`}>
                      {purchase.template.category}
                    </span>
                    {purchase.template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                    {purchase.template.tags.length > 3 && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        +{purchase.template.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTemplate(purchase)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(purchase)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-primary"
                    title="Download JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedTemplate.template.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedTemplate.template.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Purchase Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Purchase Date</div>
                  <div className="font-medium">{formatDate(selectedTemplate.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Price Paid</div>
                  <div className="font-medium">
                    {selectedTemplate.price === 0 ? 'Free' : `${selectedTemplate.price} credits`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Created By</div>
                  <div className="font-medium">
                    {selectedTemplate.template.author.name || selectedTemplate.template.author.email}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(selectedTemplate.template.category)}`}>
                      {selectedTemplate.template.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Nodes */}
              {selectedTemplate.template.workflowJson?.nodes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Workflow Nodes ({selectedTemplate.template.workflowJson.nodes.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTemplate.template.workflowJson.nodes.map((node: any, idx: number) => (
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
              )}

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownload(selectedTemplate)}
                  className="btn-gradient flex-1 py-3"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download Workflow
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
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
