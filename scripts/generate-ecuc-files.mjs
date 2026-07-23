/**
 * Generate ECUC files from ecuc-generator and write to yuleASR config/generated/
 * 
 * Usage: node scripts/generate-ecuc-files.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Dynamically import from core package
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreDist = join(__dirname, '../packages/@yuletech/core');

// Use tsx to run TypeScript directly
const { execSync } = await import('child_process');

// Build a Node.js script that uses the generator
const script = `
const { EcucCodeGenerator } = require('${coreDist}/src/generator/ecuc-generator');
const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const generator = new EcucCodeGenerator();

// Can module config
const canConfig = {
  module: 'Can',
  version: '4.4.0',
  parameters: {
    canBaudrate: 500000,
    canDevErrorDetect: true,
    canVersionInfoApi: true,
    numControllers: 2,
    numHoh: 16,
    numBaudrateConfigs: 3,
    timeoutDuration: 10000,
    mainFunctionPeriodMs: 10
  },
  containers: {
    CanHardwareObject: [
      { id: 'hoh_rx_0', parameters: { hohType: 'CAN_RX', hohId: 0 } },
      { id: 'hoh_rx_1', parameters: { hohType: 'CAN_RX', hohId: 1 } },
      { id: 'hoh_rx_2', parameters: { hohType: 'CAN_RX', hohId: 2 } },
      { id: 'hoh_rx_3', parameters: { hohType: 'CAN_RX', hohId: 3 } },
      { id: 'hoh_tx_0', parameters: { hohType: 'CAN_TX', hohId: 4 } },
      { id: 'hoh_tx_1', parameters: { hohType: 'CAN_TX', hohId: 5 } },
      { id: 'hoh_tx_2', parameters: { hohType: 'CAN_TX', hohId: 6 } },
      { id: 'hoh_tx_3', parameters: { hohType: 'CAN_TX', hohId: 7 } },
    ]
  }
};

const canSchema = {
  name: 'Can',
  label: 'CAN Driver',
  layer: 'MCAL',
  version: '4.4.0',
  parameters: [
    { name: 'canBaudrate', type: 'integer', required: true },
    { name: 'canDevErrorDetect', type: 'boolean', required: false },
    { name: 'canVersionInfoApi', type: 'boolean', required: false },
    { name: 'numControllers', type: 'integer', required: false },
    { name: 'numHoh', type: 'integer', required: false },
    { name: 'numBaudrateConfigs', type: 'integer', required: false },
    { name: 'timeoutDuration', type: 'integer', required: false },
    { name: 'mainFunctionPeriodMs', type: 'integer', required: false }
  ],
  containers: [{
    name: 'CanHardwareObject',
    label: 'CAN Hardware Object',
    multiple: true,
    minInstances: 1,
    maxInstances: 64,
    parameters: ['hohType', 'hohId']
  }]
};

async function main() {
  // Generate for Can
  const outputDir = '${process.cwd()}/yuleasr-output';
  mkdirSync(outputDir, { recursive: true });
  
  const result = await generator.generate(canConfig, canSchema, {
    outputDir,
    generateComments: true,
  });
  
  console.log('Generation success:', result.success);
  if (result.errors) console.error('Errors:', result.errors);
  if (result.warnings) console.warn('Warnings:', result.warnings);
  
  for (const f of result.files) {
    writeFileSync(f.path, f.content);
    console.log('  ✓', f.path);
  }
}

main().catch(console.error);
`;

// Write temp runner
const runnerPath = join(__dirname, '_runner.mjs');
writeFileSync(runnerPath, script);

// Run with tsx / ts-node
try {
  execSync(`npx tsx ${runnerPath}`, {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    timeout: 30000,
  });
} catch (e) {
  console.error('Generation failed:', e.message);
} finally {
  // Cleanup temp runner
  try { require('fs').unlinkSync(runnerPath); } catch {}
}
