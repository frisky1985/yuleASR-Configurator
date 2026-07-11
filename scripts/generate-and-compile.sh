#!/bin/bash
# generate-and-compile.sh
# Generate Can_Cfg.h via ecuc-generator and verify with yuleASR toolchain
set -e

YULE_ASR_DIR="$HOME/.openclaw/workspace/yuleASR"
CONFIGURATOR_DIR="$HOME/.openclaw/workspace/yuleASR-Configurator"
TEST_DIR="/tmp/ecuc-integration-test"

echo "=============================================="
echo " yuleASR-Configurator: Generate & Compile"
echo "=============================================="

# Clean test dir
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo ""
echo "=== Step 1: Generate Can_Cfg.h via ecuc-generator ==="
echo ""

cd "$CONFIGURATOR_DIR/packages/@yuletech/core"

npx tsx -e "
const fs = require('fs');
const { EcucCodeGenerator } = require('./src/generator/ecuc-generator');
const gen = new EcucCodeGenerator();

const config = {
  module: 'Can', version: '4.4.0',
  parameters: { canBaudrate: 500000, canDevErrorDetect: false },
  containers: {
    CanController: [
      { id: 'c0', parameters: { canBaudrate: 500000, canControllerId: 0 } },
    ],
  },
};

const schema = {
  name: 'Can', label: 'CAN Driver', layer: 'MCAL', version: '4.4.0',
  parameters: [
    { name: 'canBaudrate', type: 'integer', required: true },
    { name: 'canDevErrorDetect', type: 'boolean', required: false },
  ],
  containers: [{
    name: 'CanController', label: 'CAN Controller', multiple: true,
    parameters: ['canBaudrate', 'canControllerId'],
  }],
};

gen.generate(config, schema, { outputDir: '$TEST_DIR', generateComments: true })
  .then(result => {
    for (const f of result.files) {
      fs.writeFileSync(f.path, f.content);
      console.log('  WROTE', f.path.replace('$TEST_DIR/', ''));
    }
    console.log('');
    console.log('  Files:', result.files.length);
    console.log('  Status:', result.success ? 'OK' : 'FAILED');
    if (!result.success) console.log('  Errors:', result.errors);
  });
" 2>&1

echo ""
echo "=== Step 2: Set up AUTOSAR stubs for compilation ==="
echo ""

# Copy AUTOSAR stubs from the yuleASR project
cp "$YULE_ASR_DIR/src/bsw/os/include/Std_Types.h" "$TEST_DIR/" 2>/dev/null || {
  # Create minimal stub if not found
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
#define NULL_PTR ((void*)0)
typedef uint16 Std_ReturnType;
#define E_OK ((Std_ReturnType)0u)
#define E_NOT_OK ((Std_ReturnType)1u)
typedef struct { uint16 vendorID; uint16 moduleID; uint8 sw_major_version; uint8 sw_minor_version; uint8 sw_patch_version; } Std_VersionInfoType;
#endif
STUB
  echo "  Created minimal Std_Types.h stub"
}

cat > "$TEST_DIR/Ecuc.h" << 'STUB'
#ifndef ECUC_H
#define ECUC_H
#include "Std_Types.h"
#endif
STUB
echo "  Created Ecuc.h stub"

echo ""
echo "=== Step 3: Syntax check with GCC ==="
echo ""

cd "$TEST_DIR"
ls -la *.h *.c 2>/dev/null

echo ""
PASS=0
FAIL=0
for f in *.h; do
  if gcc -fsyntax-only -x c -I "$TEST_DIR" "$f" 2>/dev/null; then
    echo "  ✅ $f — syntax OK"
    PASS=$((PASS+1))
  else
    # Show actual errors
    echo "  ⚠️  $f — errors (show on next line):"
    gcc -fsyntax-only -x c -I "$TEST_DIR" "$f" 2>&1 | sed 's/^/    /'
    FAIL=$((FAIL+1))
  fi
done

for f in *.c; do
  if gcc -fsyntax-only -I "$TEST_DIR" -include "$TEST_DIR/Std_Types.h" "$f" 2>/dev/null; then
    echo "  ✅ $f — syntax OK"
    PASS=$((PASS+1))
  else
    echo "  ⚠️  $f — errors (show on next line):"
    gcc -fsyntax-only -I "$TEST_DIR" -include "$TEST_DIR/Std_Types.h" "$f" 2>&1 | sed 's/^/    /'
    FAIL=$((FAIL+1))
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
