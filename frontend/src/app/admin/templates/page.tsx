'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, Edit, Trash2, Eye, Download } from 'lucide-react';
import api from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  downloads: number;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/admin/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/api/admin/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.patch(`/api/admin/templates/${id}/reject`);
      } else {
        await api.patch(`/api/admin/templates/${id}/approve`);
      }
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card rounded-xl animate-pulse"></div>
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
          <h1 className="text-3xl font-bold mb-2">Template Management</h1>
          <p className="text-muted-foreground">Upload and manage marketplace templates</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-gradient flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first template to get started</p>
            <button onClick={() => setShowUploadModal(true)} className="btn-gradient">
              Upload Template
            </button>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card-premium p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.isPublished
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}>
                      {template.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {template.downloads} downloads
                    </div>
                    <div>
                      {template.price === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                      ) : (
                        <span className="font-medium">{template.price} credits</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(template.id, template.isPublished)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title={template.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchTemplates();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={() => {
            setEditingTemplate(null);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'productivity',
    price: 0,
    isFree: true,
    workflowFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create form data for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.isFree ? '0' : String(formData.price));
      data.append('isPublished', 'true');

      if (formData.workflowFile) {
        data.append('workflow', formData.workflowFile);
      }

      await api.post('/api/admin/templates/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Upload New Template</h2>
          <p className="text-sm text-muted-foreground mt-1">Add a new workflow template to the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Template Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Email Automation Workflow"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe what this template does..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="productivity">Productivity</option>
              <option value="communication">Communication</option>
              <option value="data">Data & Analytics</option>
              <option value="ai">AI & Automation</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium mb-2">Pricing</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isFree}
                  onChange={() => setFormData({ ...formData, isFree: true, price: 0 })}
                  className="w-4 h-4"
                />
                <span>Free (No credits required)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!formData.isFree}
                  onChange={() => setFormData({ ...formData, isFree: false })}
                  className="w-4 h-4"
                />
                <span>Paid (Requires credits)</span>
              </label>
              {!formData.isFree && (
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Price in credits (e.g., 20)"
                />
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Workflow File (JSON) *</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept=".json"
                required
                onChange={(e) => setFormData({ ...formData, workflowFile: e.target.files?.[0] || null })}
                className="hidden"
                id="workflow-file"
              />
              <label htmlFor="workflow-file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {formData.workflowFile ? formData.workflowFile.name : 'Click to upload workflow JSON'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Export your n8n workflow as JSON
                </p>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-gradient px-6 py-2 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Template Modal Component
function EditTemplateModal({
  template,
  onClose,
  onSuccess
}: {
  template: Template;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description,
    category: template.category,
    price: template.price,
    isFree: template.price === 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/api/admin/templates/${template.id}`, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.isFree ? 0 : formData.price,
      });

      onSuccess();
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Edit Template</h2>
          <p className="text-sm text-muted-foreground mt-1">Update template information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Template Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="productivity">Productivity</option>
              <option value="communication">Communication</option>
              <option value="data">Data & Analytics</option>
              <option value="ai">AI & Automation</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium mb-2">Pricing</label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isFree}
                  onChange={() => setFormData({ ...formData, isFree: true, price: 0 })}
                  className="w-4 h-4"
                />
                <span>Free (No credits required)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!formData.isFree}
                  onChange={() => setFormData({ ...formData, isFree: false })}
                  className="w-4 h-4"
                />
                <span>Paid (Requires credits)</span>
              </label>
              {!formData.isFree && (
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Price in credits (e.g., 20)"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient px-6 py-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
