import { PrismaClient } from '@prisma/client';
import n8nWorkflowsService from '../src/services/n8n-workflows.service';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);
const prisma = new PrismaClient();

/**
 * Import workflows from n8n-workflows database to marketplace
 * This script imports metadata only - actual workflow JSON is downloaded on purchase
 */
async function importWorkflows() {
  try {
    console.log('🚀 Starting n8n workflows import...\n');

    // Get or create system admin user for n8n workflows
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@aimpress.co.uk' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    console.log(`✅ Using admin user: ${adminUser.email}\n`);

    // Fetch workflow statistics
    const stats = await n8nWorkflowsService.getStats();
    console.log('📊 Workflow Statistics:');
    console.log(`   Total workflows: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Inactive: ${stats.inactive}`);
    console.log(`   Total nodes: ${stats.total_nodes}`);
    console.log(`   Unique integrations: ${stats.unique_integrations}\n`);

    // Import workflows
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📥 Fetching workflows...\n');

    // Fetch all active workflows
    const response = await n8nWorkflowsService.searchWorkflows({
      active_only: true,
      per_page: 100,
      page: 1,
    });

    const totalPages = response.pages;
    console.log(`Found ${response.total} active workflows across ${totalPages} pages\n`);

    // Process first 100 workflows for now
    const workflows = response.workflows;

    for (const workflow of workflows) {
      try {
        // Check if workflow already imported
        const existing = await prisma.template.findFirst({
          where: { n8nWorkflowFilename: workflow.filename },
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${workflow.name} (already imported)`);
          skipped++;
          continue;
        }

        // Map workflow to template format
        const templateData = n8nWorkflowsService.mapToTemplateData(workflow);

        // Download workflow JSON from container
        let workflowJson = {};
        try {
          const containerName = 'n8n-workflows';
          const findCmd = `docker exec ${containerName} find /app/workflows -name "${workflow.filename}" 2>/dev/null | head -1`;
          const { stdout: filePath } = await exec(findCmd);
          const trimmedPath = filePath.trim();

          if (trimmedPath) {
            const catCmd = `docker exec ${containerName} cat "${trimmedPath}"`;
            const { stdout: fileContent } = await exec(catCmd);
            workflowJson = JSON.parse(fileContent);
            console.log(`   📦 Downloaded workflow JSON (${Object.keys(workflowJson).length} keys)`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not download workflow JSON: ${error}`);
        }

        // Create template with workflow JSON
        await prisma.template.create({
          data: {
            ...templateData,
            workflowJson,
            authorId: adminUser.id,
            sourceType: 'n8n-workflows',
            isPublished: true, // Publish active workflows
          },
        });

        console.log(`✅ Imported: ${workflow.name} (${workflow.complexity}, ${workflow.node_count} nodes)`);
        imported++;
      } catch (error) {
        console.error(`❌ Error importing ${workflow.name}:`, error);
        errors++;
      }
    }

    console.log('\n📈 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n✨ Import complete!');
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importWorkflows();
