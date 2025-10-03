import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCP() {
  console.log('Connecting to n8n-mcp server...');

  const transport = new StdioClientTransport({
    command: 'docker',
    args: ['exec', '-i', 'hungry_zhukovsky', 'node', '/app/build/index.js'],
  });

  const client = new Client(
    {
      name: 'n8n-marketplace-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  console.log('Connected to MCP server!');

  // List available tools
  console.log('\n=== Available Tools ===');
  const toolsResult = await client.listTools();
  console.log(JSON.stringify(toolsResult, null, 2));

  // List available resources (templates)
  console.log('\n=== Available Resources ===');
  try {
    const resourcesResult = await client.listResources();
    console.log(JSON.stringify(resourcesResult, null, 2));
  } catch (error) {
    console.log('Resources not available:', error);
  }

  // Try to list templates
  console.log('\n=== Listing Templates ===');
  try {
    const result = await client.callTool({
      name: 'list_community_nodes',
      arguments: {},
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('Error listing templates:', error);
  }

  await client.close();
  console.log('\nDisconnected from MCP server');
}

testMCP().catch(console.error);
