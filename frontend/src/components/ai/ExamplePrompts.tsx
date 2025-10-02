'use client';

import { Sparkles } from 'lucide-react';

interface ExamplePromptsProps {
  onSelectExample: (prompt: string) => void;
}

const examples = [
  {
    title: 'Website Monitoring',
    prompt: 'Monitor my website uptime every 5 minutes and send me an email alert if it goes down',
  },
  {
    title: 'Daily Data Sync',
    prompt: 'Sync data from Google Sheets to PostgreSQL database every day at 9 AM',
  },
  {
    title: 'Weekly Analytics Report',
    prompt: 'Generate a weekly analytics report from Google Analytics API and send it via email every Monday',
  },
  {
    title: 'GitHub Automation',
    prompt: 'Send a Slack notification when a new pull request is created in my GitHub repository',
  },
  {
    title: 'Lead Processing',
    prompt: 'When a form is submitted on my website, validate the data, add it to Airtable, and send a welcome email',
  },
  {
    title: 'Social Media Automation',
    prompt: 'Post to Twitter and LinkedIn when I publish a new blog post on WordPress',
  },
];

export default function ExamplePrompts({ onSelectExample }: ExamplePromptsProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Solid Turquoise Icon Background */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0D9488]/10 mb-6">
          <Sparkles className="w-10 h-10 text-[#0D9488]" />
        </div>

        <h2 className="text-3xl font-bold mb-3 text-white">
          Start Building with AI
        </h2>

        <p className="text-[#94A3B8] mb-8">
          Describe your automation workflow in natural language, and AI will generate a complete n8n workflow for you.
        </p>

        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium text-[#94A3B8]">Try asking for:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => onSelectExample(example.prompt)}
                className="group text-left px-4 py-3 bg-[#2A3441] hover:bg-[#2A3441]/80 border border-[#94A3B8]/10 hover:border-[#0D9488]/50 rounded-xl transition-all"
              >
                <p className="text-sm font-medium mb-1 text-white group-hover:text-[#0D9488] transition-colors">
                  {example.title}
                </p>
                <p className="text-xs text-[#94A3B8] line-clamp-2">
                  {example.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="text-[#0D9488]">✓</span>
            5-15 nodes with error handling
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#0D9488]">✓</span>
            Production-ready workflows
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#0D9488]">✓</span>
            JSON format for n8n
          </div>
        </div>
      </div>
    </div>
  );
}
