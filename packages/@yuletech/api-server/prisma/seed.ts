/**
 * Seed script for BSW Templates — adds sample template data.
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: 'MCU Base',
    description:
      'Microcontroller driver with clock configuration, core settings and basic MCU initialization',
    category: 'mcal',
    tags: ['MCAL', 'MCU', 'base'],
    moduleType: 'MCAL',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
    ],
    isOfficial: true,
  },
  {
    name: 'CAN Communication',
    description:
      'CAN driver with baudrate configuration, message objects and communication settings',
    category: 'ecual',
    tags: ['ECUAL', 'CAN', 'communication'],
    moduleType: 'ECUAL',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
    ],
    isOfficial: true,
  },
  {
    name: 'NVRAM Storage',
    description: 'Non-Volatile Memory Manager for persistent data storage and memory management',
    category: 'service',
    tags: ['Service', 'NvM', 'storage'],
    moduleType: 'Service',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
      { id: 'nvm', name: 'NvM', layer: 'Service' },
    ],
    isOfficial: true,
  },
  {
    name: 'Full Autosar',
    description: 'Complete AUTOSAR configuration with all layers and common services',
    category: 'full',
    tags: ['full', 'AUTOSAR', 'complete'],
    moduleType: 'RTE',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
      { id: 'gpt', name: 'Gpt', layer: 'MCAL' },
      { id: 'pwm', name: 'Pwm', layer: 'MCAL' },
      { id: 'adc', name: 'Adc', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
      { id: 'eth', name: 'Eth', layer: 'ECUAL' },
      { id: 'nvm', name: 'NvM', layer: 'Service' },
      { id: 'com', name: 'Com', layer: 'Service' },
      { id: 'dcm', name: 'Dcm', layer: 'Service' },
    ],
    isOfficial: true,
  },
  {
    name: 'Port & DIO',
    description: 'Port and Digital I/O configuration for GPIO control',
    category: 'mcal',
    tags: ['MCAL', 'Port', 'DIO'],
    moduleType: 'MCAL',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'dio', name: 'Dio', layer: 'MCAL' },
    ],
    isOfficial: false,
  },
  {
    name: 'Ethernet Stack',
    description: 'Ethernet driver configuration for TCP/IP communication and network interface',
    category: 'ecual',
    tags: ['ECUAL', 'Ethernet', 'TCP/IP'],
    moduleType: 'ECUAL',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'eth', name: 'Eth', layer: 'ECUAL' },
    ],
    isOfficial: false,
  },
  {
    name: 'Diagnostic Stack',
    description: 'DCM (Diagnostic Communication Manager) for UDS diagnostic services',
    category: 'service',
    tags: ['Service', 'DCM', 'diagnostic'],
    moduleType: 'Service',
    modules: [
      { id: 'mcu', name: 'Mcu', layer: 'MCAL' },
      { id: 'port', name: 'Port', layer: 'MCAL' },
      { id: 'can', name: 'Can', layer: 'ECUAL' },
      { id: 'dcm', name: 'Dcm', layer: 'Service' },
    ],
    isOfficial: false,
  },
];

async function main() {
  // Find or create a system user for official templates
  let systemUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!systemUser) {
    systemUser = await prisma.user.findFirst();
  }
  if (!systemUser) {
    console.error('No user found. Please run auth seed first.');
    process.exit(1);
  }

  console.log(`Using user: ${systemUser.username} (id: ${systemUser.id})`);

  for (const tpl of sampleTemplates) {
    const existing = await prisma.bSWTemplate.findFirst({ where: { name: tpl.name } });
    if (existing) {
      console.log(`  Skipping existing template: ${tpl.name}`);
      continue;
    }

    const template = await prisma.bSWTemplate.create({
      data: {
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        tags: JSON.stringify(tpl.tags),
        moduleType: tpl.moduleType,
        modules: JSON.stringify(tpl.modules),
        isPublic: true,
        isOfficial: tpl.isOfficial,
        status: 'published',
        visibility: 'public',
        minTier: 'free',
        authorId: systemUser.id,
        version: 1,
        downloadCount: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 500),
      },
    });

    await prisma.bSWTemplateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        name: tpl.name,
        description: tpl.description,
        modules: JSON.stringify(tpl.modules),
        changelog: 'Initial version',
      },
    });

    console.log(`  Created template: ${tpl.name}`);
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
