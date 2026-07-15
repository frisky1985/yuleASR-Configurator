#!/bin/bash
# generate-and-compile.sh
# Generate AUTOSAR configuration headers for Can, Mcu, Port
# and verify all pass gcc -fsyntax-only with AUTOSAR stubs
set -e

CONFIGURATOR_DIR="$HOME/.openclaw/workspace/yuleASR-Configurator"
CORE_DIR="$CONFIGURATOR_DIR/packages/@yuletech/core"
TEST_DIR="/tmp/ecuc-integration-test"

echo "=============================================="
echo " yuleASR-Configurator: Generate & Compile"
echo "=============================================="

rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo ""
echo "=== Step 1: Set up AUTOSAR stubs ==="
echo ""

cat > "$TEST_DIR/Std_Types.h" << 'STUB'
#ifndef STD_TYPES_H
#define STD_TYPES_H
typedef unsigned char boolean;
typedef unsigned char uint8;
typedef unsigned short uint16;
typedef unsigned int uint32;
typedef signed char sint8;
typedef signed short sint16;
typedef signed int sint32;
typedef float float32;
typedef double float64;
#define TRUE 1
#define FALSE 0
#define STD_ON 1
#define STD_OFF 0
#define STD_HIGH 1
#define STD_LOW 0
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
STUB

cat > "$TEST_DIR/Ecuc.h" << 'STUB'
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
STUB

echo "  Stubs ready: Std_Types.h, Ecuc.h"
echo ""
echo "=== Step 2: Generate files via ecuc-generator ==="
echo ""

cd "$CORE_DIR"

PASS=0
FAIL=0

generate_and_check() {
  local MODULE="$1"

  npx tsx -e "
const fs = require('fs');
const { EcucCodeGenerator } = require('./src/generator/ecuc-generator');
const gen = new EcucCodeGenerator();
const opts = { outputDir: '$TEST_DIR', generateComments: true };

$2

gen.generate(config, schema, opts).then(r => {
  for (const f of r.files) fs.writeFileSync(f.path, f.content);
  if (!r.success) { console.log('ERR:' + r.errors.join(', ')); process.exit(1); }
  console.log('  Files: ' + r.files.length + ' (' + r.files.map(f => f.path.replace('$TEST_DIR/', '')).join(', ') + ')');
});
" 2>&1
}

echo "  --- Can (CAN Driver) ---"
generate_and_check "Can" '
const config = {
  module: "Can", version: "4.4.0",
  parameters: { canBaudrate: 500000, canDevErrorDetect: false },
  containers: {
    CanController: [{ id: "c0", parameters: { canBaudrate: 500000, canControllerId: 0 } }],
  },
};
const schema = {
  name: "Can", label: "CAN Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "canBaudrate", type: "integer", required: true },
    { name: "canDevErrorDetect", type: "boolean", required: false },
  ],
  containers: [{
    name: "CanController", label: "CAN Controller", multiple: true,
    minInstances: 1, maxInstances: 4,
    parameters: ["canBaudrate", "canControllerId"],
  }],
};
'

echo ""
echo "  --- Mcu (MCU Driver) ---"
generate_and_check "Mcu" '
const config = {
  module: "Mcu", version: "4.4.0",
  parameters: { mcuClockSetting: 16000000, mcuRamSectors: 4 },
  containers: {
    McuClockSettingConfig: [{ id: "clk0", parameters: { clockId: 0, clockFrequency: 16000000 } }],
  },
};
const schema = {
  name: "Mcu", label: "MCU Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "mcuClockSetting", type: "integer", required: true },
    { name: "mcuRamSectors", type: "integer", required: false },
  ],
  containers: [{
    name: "McuClockSettingConfig", label: "Clock Setting", multiple: true,
    minInstances: 1, maxInstances: 8,
    parameters: ["clockId", "clockFrequency"],
  }],
};
'

echo ""
echo "  --- Port (PORT Driver) ---"
generate_and_check "Port" '
const config = {
  module: "Port", version: "4.4.0",
  parameters: { portDevErrorDetect: true, portPinCount: 8 },
  containers: {
    PortPin: [
      { id: "p0", parameters: { pinId: 0, pinDirection: 1 } },
      { id: "p1", parameters: { pinId: 1, pinDirection: 0 } },
    ],
  },
};
const schema = {
  name: "Port", label: "PORT Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "portDevErrorDetect", type: "boolean", required: false },
    { name: "portPinCount", type: "integer", required: true },
  ],
  containers: [{
    name: "PortPin", label: "Port Pin", multiple: true,
    minInstances: 1, maxInstances: 64,
    parameters: ["pinId", "pinDirection"],
  }],
};
'

echo ""
echo "  --- Adc (ADC Driver) ---"
generate_and_check "Adc" '
const config = {
  module: "Adc", version: "4.4.0",
  parameters: { adcDevErrorDetect: false, adcVersionInfoApi: true },
  containers: {
    AdcHwUnit: [
      { id: "hwu0", parameters: { clockId: 0, adcResolution: 12 } },
    ],
  },
};
const schema = {
  name: "Adc", label: "ADC Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "adcDevErrorDetect", type: "boolean", required: false },
    { name: "adcVersionInfoApi", type: "boolean", required: false },
  ],
  containers: [{
    name: "AdcHwUnit", label: "ADC HW Unit", multiple: true,
    minInstances: 1, maxInstances: 8,
    parameters: ["clockId", "adcResolution"],
  }],
};
'

echo ""
echo "  --- Dio (DIO Driver) ---"
generate_and_check "Dio" '
const config = {
  module: "Dio", version: "4.4.0",
  parameters: { dioDevErrorDetect: false, dioChannelCount: 16 },
  containers: {},
};
const schema = {
  name: "Dio", label: "DIO Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "dioDevErrorDetect", type: "boolean", required: false },
    { name: "dioChannelCount", type: "integer", required: true },
  ],
  containers: [],
};
'

echo ""
echo "  --- Gpt (GPT Driver) ---"
generate_and_check "Gpt" '
const config = {
  module: "Gpt", version: "4.4.0",
  parameters: { gptDevErrorDetect: false },
  containers: {
    GptChannel: [
      { id: "ch0", parameters: { channelId: 0, tickFrequency: 1000 } },
    ],
  },
};
const schema = {
  name: "Gpt", label: "GPT Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "gptDevErrorDetect", type: "boolean", required: false },
  ],
  containers: [{
    name: "GptChannel", label: "GPT Channel", multiple: true,
    minInstances: 1, maxInstances: 32,
    parameters: ["channelId", "tickFrequency"],
  }],
};
'

echo ""
echo "  --- Spi (SPI Driver) ---"
generate_and_check "Spi" '
const config = {
  module: "Spi", version: "4.4.0",
  parameters: { spiDevErrorDetect: false, spiChannelCount: 4 },
  containers: {},
};
const schema = {
  name: "Spi", label: "SPI Driver", layer: "MCAL", version: "4.4.0",
  parameters: [
    { name: "spiDevErrorDetect", type: "boolean", required: false },
    { name: "spiChannelCount", type: "integer", required: true },
  ],
  containers: [],
};
'

echo ""
echo "=== Step 3: Syntax check with GCC ==="
echo ""

cd "$TEST_DIR"
ls -1 *.h *.c 2>/dev/null

echo ""
for f in *.h; do
  if gcc -fsyntax-only -x c -I "$TEST_DIR" "$f" 2>/dev/null; then
    echo "  ✅ $f — syntax OK"; PASS=$((PASS+1))
  else
    echo "  ⚠️  $f — errors:"; gcc -fsyntax-only -x c -I "$TEST_DIR" "$f" 2>&1 | sed 's/^/    /'; FAIL=$((FAIL+1))
  fi
done

for f in *.c; do
  if gcc -fsyntax-only -I "$TEST_DIR" -include "$TEST_DIR/Std_Types.h" "$f" 2>/dev/null; then
    echo "  ✅ $f — syntax OK"; PASS=$((PASS+1))
  else
    echo "  ⚠️  $f — errors:"; gcc -fsyntax-only -I "$TEST_DIR" -include "$TEST_DIR/Std_Types.h" "$f" 2>&1 | sed 's/^/    /'; FAIL=$((FAIL+1))
  fi
done

echo ""
echo "=============================================="
echo " RESULTS"
echo "  ✅ Passed: $PASS"
echo "  ⚠️  Failed: $FAIL"
echo "=============================================="

if [ "$FAIL" -eq 0 ]; then
  echo "  All generated files pass syntax check!"
  exit 0
else
  echo "  Some files have issues — see above for details."
  exit 1
fi
