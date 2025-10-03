import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: 'Email Automation Workflow',
    description: 'Automatically process incoming emails and create tasks in your project management tool. Perfect for customer support teams.',
    category: 'productivity',
    price: 0, // Free template
    workflow: {
      nodes: [
        {
          parameters: {},
          name: 'Email Trigger',
          type: 'n8n-nodes-base.emailReadImap',
          typeVersion: 2,
          position: [250, 300]
        },
        {
          parameters: {
            values: {
              string: [
                {
                  name: 'subject',
                  value: '={{$json["subject"]}}'
                }
              ]
            }
          },
          name: 'Set Task Data',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        'Email Trigger': {
          main: [[{ node: 'Set Task Data', type: 'main', index: 0 }]]
        }
      }
    },
    tags: ['email', 'automation', 'productivity'],
    isPublished: true,
    downloads: 0
  },
  {
    name: 'Slack Notification Bot',
    description: 'Send automated Slack notifications based on external triggers like webhooks, schedules, or database changes.',
    category: 'communication',
    price: 500, // 5 credits
    workflow: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'webhook',
            responseMode: 'lastNode'
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            channel: '#general',
            text: '={{$json["message"]}}',
            attachments: []
          },
          name: 'Slack',
          type: 'n8n-nodes-base.slack',
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Slack', type: 'main', index: 0 }]]
        }
      }
    },
    tags: ['slack', 'notifications', 'webhooks'],
    isPublished: true,
    downloads: 0
  },
  {
    name: 'Data Sync: Google Sheets to Database',
    description: 'Automatically sync data from Google Sheets to your database. Keep your data synchronized in real-time.',
    category: 'data',
    price: 1000, // 10 credits
    workflow: {
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'minutes', value: 15 }]
            }
          },
          name: 'Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            operation: 'read',
            sheetId: 'your-sheet-id',
            range: 'A:Z'
          },
          name: 'Google Sheets',
          type: 'n8n-nodes-base.googleSheets',
          typeVersion: 2,
          position: [450, 300]
        },
        {
          parameters: {
            operation: 'insert',
            table: 'your_table'
          },
          name: 'Postgres',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 1,
          position: [650, 300]
        }
      ],
      connections: {
        'Schedule': {
          main: [[{ node: 'Google Sheets', type: 'main', index: 0 }]]
        },
        'Google Sheets': {
          main: [[{ node: 'Postgres', type: 'main', index: 0 }]]
        }
      }
    },
    tags: ['google-sheets', 'database', 'sync', 'automation'],
    isPublished: true,
    downloads: 0
  },
  {
    name: 'AI Content Generator',
    description: 'Generate content using AI (OpenAI GPT) based on prompts. Perfect for blog posts, social media, and marketing copy.',
    category: 'ai',
    price: 1500, // 15 credits
    workflow: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'generate-content'
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            model: 'gpt-4',
            prompt: '={{$json["prompt"]}}'
          },
          name: 'OpenAI',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'OpenAI', type: 'main', index: 0 }]]
        }
      }
    },
    tags: ['ai', 'openai', 'content', 'generation'],
    isPublished: true,
    downloads: 0
  },
  {
    name: 'Customer Onboarding Automation',
    description: 'Automate your customer onboarding process. Send welcome emails, create accounts, and set up initial data.',
    category: 'business',
    price: 2000, // 20 credits
    workflow: {
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'new-customer'
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            operation: 'send',
            to: '={{$json["email"]}}',
            subject: 'Welcome to Our Service!',
            html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
          },
          name: 'Send Welcome Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 2,
          position: [450, 300]
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Send Welcome Email', type: 'main', index: 0 }]]
        }
      }
    },
    tags: ['onboarding', 'email', 'automation', 'business'],
    isPublished: true,
    downloads: 0
  }
];

async function main() {
  console.log('🌱 Seeding templates...');

  // Get the first admin user to be the author
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please create an admin user first.');
    process.exit(1);
  }

  console.log(`📝 Using admin user: ${adminUser.email} as template author`);

  for (const template of sampleTemplates) {
    const { workflow, ...templateData } = template;
    const created = await prisma.template.create({
      data: {
        ...templateData,
        workflowJson: workflow,
        authorId: adminUser.id
      }
    });
    console.log(`✅ Created template: ${created.name} (${created.price === 0 ? 'Free' : `${created.price / 100} credits`})`);
  }

  console.log('✨ Seeding complete!');
  console.log(`📊 Total templates created: ${sampleTemplates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
