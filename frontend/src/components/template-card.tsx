import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface TemplateCardProps {
  template: Template;
}

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

export default function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/marketplace/${template.id}`);
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant={template.price === 0 ? 'default' : 'secondary'} className={template.price === 0 ? 'bg-green-500' : 'bg-orange-500'}>
            {template.price === 0 ? 'Free' : `${template.price} credits`}
          </Badge>
        </div>
        <div className="flex gap-2 mb-2">
          <Badge className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
        </div>
        <CardDescription>{truncateDescription(template.description)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>By {template.author.name || template.author.email}</span>
          <span>{template.downloads} downloads</span>
        </div>
      </CardContent>
    </Card>
  );
}