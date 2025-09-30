'use client';

import { useState, useEffect } from 'react';
import { getTemplates, TemplateFilters } from '@/lib/api';
import TemplateCard from '@/components/template-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  downloads: number;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFree, setOnlyFree] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'AI', label: 'AI' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Data', label: 'Data' },
    { value: 'Automation', label: 'Automation' },
    { value: 'Integration', label: 'Integration' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, onlyFree]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const filters: TemplateFilters = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        onlyFree: onlyFree || undefined,
      };

      const data = await getTemplates(filters);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Workflow Marketplace <span className="text-gradient-aimpress">by Aimpress</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Curated AI-powered automation templates for every business need
          </p>
        </div>

        {/* Filters */}
        <div className="card-premium p-6 mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  id="onlyFree"
                  type="checkbox"
                  checked={onlyFree}
                  onChange={(e) => setOnlyFree(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="onlyFree" className="cursor-pointer">
                  Free only
                </Label>
              </div>
            </div>
          </div>

          {(searchQuery || selectedCategory !== 'all' || onlyFree) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyFree(false);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading templates...</div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">No templates found</div>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}