import { PrismaClient } from '@prisma/client';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);
const prisma = new PrismaClient();

async function updateWorkflowJSON(templateId?: string) {
  try {
    let templates;

    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        select: { id: true, name: true, n8nWorkflowFilename: true, sourceType: true },
      });
      templates = template ? [template] : [];
    } else {
      templates = await prisma.template.findMany({
        where: { sourceType: 'n8n-workflows' },
        select: { id: true, name: true, n8nWorkflowFilename: true, sourceType: true },
      });
    }

    console.log(`Found ${templates.length} templates to update\n`);

    let updated = 0;
    let failed = 0;

    for (const template of templates) {
      try {
        if (!template.n8nWorkflowFilename) {
          console.log(`⏭️  Skipped: ${template.name} (no filename)`);
          continue;
        }

        const containerName = 'n8n-workflows';
        const findCmd = `docker exec ${containerName} find /app/workflows -name "${template.n8nWorkflowFilename}" 2>/dev/null | head -1`;
        const { stdout: filePath } = await exec(findCmd);
        const trimmedPath = filePath.trim();

        if (!trimmedPath) {
          console.log(`❌ Failed: ${template.name} (file not found)`);
          failed++;
          continue;
        }

        const catCmd = `docker exec ${containerName} cat "${trimmedPath}"`;
        const { stdout: fileContent } = await exec(catCmd);
        const workflowJson = JSON.parse(fileContent);

        await prisma.template.update({
          where: { id: template.id },
          data: { workflowJson },
        });

        console.log(`✅ Updated: ${template.name} (${workflowJson.nodes?.length || 0} nodes)`);
        updated++;
      } catch (error) {
        console.log(`❌ Failed: ${template.name} - ${error}`);
        failed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const templateId = process.argv[2];
updateWorkflowJSON(templateId);
