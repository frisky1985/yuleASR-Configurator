#!/bin/bash
# prepare-review.sh
# Collect all generated artifacts + docs into a review package
set -e

CONFIGURATOR_DIR="$HOME/.openclaw/workspace/yuleASR-Configurator"
CORE_DIR="$CONFIGURATOR_DIR/packages/@yuletech/core"
REVIEW_DIR="/tmp/ecuc-review-package"
TEST_DIR="/tmp/ecuc-integration-test"

rm -rf "$REVIEW_DIR"
mkdir -p "$REVIEW_DIR/generated"
mkdir -p "$REVIEW_DIR/docs"
mkdir -p "$REVIEW_DIR/tests"

echo "=== Generating code for all modules ==="

cd "$CORE_DIR"

# Generate Can
npx tsx -e "
const fs = require('fs'); const { EcucCodeGenerator } = require('./src/generator/ecuc-generator');
const gen = new EcucCodeGenerator();
gen.generate({
  module: 'Can', version: '4.4.0',
  parameters: { canBaudrate: 500000, canDevErrorDetect: false },
  containers: { CanController: [{ id: 'c0', parameters: { canBaudrate: 500000, canControllerId: 0 } }] },
}, {
  name: 'Can', label: 'CAN Driver', layer: 'MCAL', version: '4.4.0',
  parameters: [{ name: 'canBaudrate', type: 'integer', required: true }, { name: 'canDevErrorDetect', type: 'boolean', required: false }],
  containers: [{ name: 'CanController', label: 'CAN Controller', multiple: true, minInstances: 1, maxInstances: 4, parameters: ['canBaudrate', 'canControllerId'] }],
}, { outputDir: '$REVIEW_DIR/generated', generateComments: true }).then(r => {
  for (const f of r.files) fs.writeFileSync(f.path, f.content);
  console.log('  Can: ' + r.files.map(f => f.path.replace('$REVIEW_DIR/generated/', '')).join(', '));
});
" 2>&1

# Generate Mcu
npx tsx -e "
const fs = require('fs'); const { EcucCodeGenerator } = require('./src/generator/ecuc-generator');
const gen = new EcucCodeGenerator();
gen.generate({
  module: 'Mcu', version: '4.4.0',
  parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4 },
  containers: { McuClockSettingConfig: [{ id: 'clk0', parameters: { clockId: 0, clockFrequency: 16000000 } }] },
}, {
  name: 'Mcu', label: 'MCU Driver', layer: 'MCAL', version: '4.4.0',
  parameters: [{ name: 'mcuClockSetting', type: 'integer', required: true }, { name: 'mcuRamSectors', type: 'integer', required: false }],
  containers: [{ name: 'McuClockSettingConfig', label: 'Clock Setting', multiple: true, minInstances: 1, maxInstances: 8, parameters: ['clockId', 'clockFrequency'] }],
}, { outputDir: '$REVIEW_DIR/generated', generateComments: true }).then(r => {
  for (const f of r.files) fs.writeFileSync(f.path, f.content);
  console.log('  Mcu: ' + r.files.map(f => f.path.replace('$REVIEW_DIR/generated/', '')).join(', '));
});
" 2>&1

# Generate Port
npx tsx -e "
const fs = require('fs'); const { EcucCodeGenerator } = require('./src/generator/ecuc-generator');
const gen = new EcucCodeGenerator();
gen.generate({
  module: 'Port', version: '4.4.0',
  parameters: { portDevErrorDetect: true, portPinCount: 8 },
  containers: { PortPin: [{ id: 'p0', parameters: { pinId: 0, pinDirection: 1 } }, { id: 'p1', parameters: { pinId: 1, pinDirection: 0 } }] },
}, {
  name: 'Port', label: 'PORT Driver', layer: 'MCAL', version: '4.4.0',
  parameters: [{ name: 'portDevErrorDetect', type: 'boolean', required: false }, { name: 'portPinCount', type: 'integer', required: true }],
  containers: [{ name: 'PortPin', label: 'Port Pin', multiple: true, minInstances: 1, maxInstances: 64, parameters: ['pinId', 'pinDirection'] }],
}, { outputDir: '$REVIEW_DIR/generated', generateComments: true }).then(r => {
  for (const f of r.files) fs.writeFileSync(f.path, f.content);
  console.log('  Port: ' + r.files.map(f => f.path.replace('$REVIEW_DIR/generated/', '')).join(', '));
});
" 2>&1

# Copy docs
echo ""
echo "=== Collecting docs ==="
cp "$CONFIGURATOR_DIR/docs/plans/2026-07-12-sprint-2-compile-verify.md" "$REVIEW_DIR/docs/" 2>/dev/null
cp "$CONFIGURATOR_DIR/docs/analysis/generated-vs-handwritten-can.md" "$REVIEW_DIR/docs/" 2>/dev/null
echo "  Docs: sprint plan, gap analysis"

# Show generated files
echo ""
echo "=== Generated artifacts ==="
ls -la "$REVIEW_DIR/generated/"
echo ""
echo "=== Review package ready at $REVIEW_DIR ==="
