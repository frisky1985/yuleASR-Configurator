#!/bin/bash
# =============================================================================
# linkage-regression.sh — yuleASR ↔ yuleASR-Configurator 双向联动回归门禁
#
# 用途（老板 2026-08-13 钦定：代码到工具完整闭环）：
#   schema 改动后一键验证「Configurator 生成产物 ↔ yuleASR 手写头 / 构建」
#   全链路无漂移。任何一步失败 → exit 1，禁止放行。
#
# 用法：
#   scripts/linkage-regression.sh [--skip-build] [--yuleasr-dir <path>]
#
# 步骤：
#   1. replace-cfgh dry-run — 110 模块生成对比（ok 判定 + 宏数一致）
#   2. 宏级实质差异扫描 — 生成产物 vs yuleASR 手写头（0 差异才算绿）
#   3. yuleASR 全量构建 + ctest（--skip-build 跳过）
#
# 环境要求：yuleASR 与 yuleASR-Configurator 为兄弟目录（默认）
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKSPACE="$(cd "${CONFIG_DIR}/.." && pwd)"
YULEASR_DIR="${YULEASR_DIR:-${WORKSPACE}/yuleASR}"
SKIP_BUILD="${SKIP_BUILD:-0}"

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --yuleasr-dir=*) YULEASR_DIR="${arg#*=}" ;;
  esac
done

PASS=0
FAIL=1

echo "============================================================"
echo " yuleASR ↔ Configurator 联动回归"
echo " Configurator: ${CONFIG_DIR}"
echo " yuleASR:      ${YULEASR_DIR}"
echo "============================================================"

# ---- 0. 前置检查 -----------------------------------------------------------
if [ ! -d "${YULEASR_DIR}/.git" ]; then
  echo "❌ yuleASR 目录无效: ${YULEASR_DIR}（可用 --yuleasr-dir= 指定）"
  exit ${FAIL}
fi

# ---- 1. replace-cfgh dry-run（110 模块生成对比）---------------------------
echo ""
echo "=== [1/3] replace-cfgh dry-run（110 模块生成对比）==="
cd "${CONFIG_DIR}"
RUN_OUT="$(REPLACE_MODE=dry-run npx vitest run \
  apps/yuleasr-web/src/services/__tests__/replace-cfgh-run.test.ts 2>&1 || true)"

RESULT_LINE="$(echo "${RUN_OUT}" | grep -o 'REPLACE_CFGH_RESULT=.*' | tail -1 || true)"
if [ -z "${RESULT_LINE}" ]; then
  echo "❌ dry-run 未产出结果（vitest 失败？）"
  echo "${RUN_OUT}" | tail -20
  exit ${FAIL}
fi

TOTAL="$(echo "${RESULT_LINE}" | python3 -c "import json,sys; d=json.loads(sys.stdin.read().split('=',1)[1]); print(d['total'])" 2>/dev/null || echo 0)"
OK_N="$(echo "${RESULT_LINE}" | python3 -c "import json,sys; d=json.loads(sys.stdin.read().split('=',1)[1]); print(d['ok'])" 2>/dev/null || echo 0)"
FAILED_N="$(echo "${RESULT_LINE}" | python3 -c "import json,sys; d=json.loads(sys.stdin.read().split('=',1)[1]); print(d['failed'])" 2>/dev/null || echo -1)"

echo "  total=${TOTAL} ok=${OK_N} failed=${FAILED_N}"
if [ "${FAILED_N}" != "0" ] || [ "${OK_N}" != "${TOTAL}" ]; then
  echo "❌ 生成对比未全绿（failed=${FAILED_N}）"
  exit ${FAIL}
fi
PKG_DIR="$(echo "${RESULT_LINE}" | python3 -c "import json,sys; d=json.loads(sys.stdin.read().split('=',1)[1]); print(d['pkgDir'])" 2>/dev/null || echo '')"
echo "  ✅ 生成产物包: ${PKG_DIR}"

# ---- 2. 宏级实质差异扫描（生成产物 vs yuleASR 手写头）---------------------
echo ""
echo "=== [2/3] 宏级实质差异扫描 ==="
MANIFEST="${PKG_DIR}/manifest.json"
if [ ! -f "${MANIFEST}" ]; then
  echo "❌ manifest 缺失: ${MANIFEST}"
  exit ${FAIL}
fi

DIFF_COUNT="$(YULEASR_DIR="${YULEASR_DIR}" PKG_DIR="${PKG_DIR}" python3 << 'PYEOF'
import json, os, re, sys

PKG = os.environ["PKG_DIR"]
YDIR = os.environ["YULEASR_DIR"]
manifest = json.load(open(f"{PKG}/manifest.json"))

def macro_map(path):
    src = open(path).read()
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
    src = re.sub(r'//.*', '', src)
    m = {}
    for ln in src.splitlines():
        ln = ln.strip()
        if ln.startswith('#define'):
            parts = ln.split(None, 2)
            if len(parts) >= 2:
                m[parts[1]] = parts[2] if len(parts) > 2 else ''
    return m

diffs = []
for mod in manifest:
    src_path = os.path.join(YDIR, mod["sourcePath"])
    gen_path = os.path.join(PKG, "generated", mod["sourcePath"])
    if not os.path.exists(src_path) or not os.path.exists(gen_path):
        diffs.append((mod["module"], "MISSING"))
        continue
    sm, gm = macro_map(src_path), macro_map(gen_path)
    only_src = set(sm) - set(gm)
    only_gen = set(gm) - set(sm)
    val_diff = {k: (sm[k], gm[k]) for k in set(sm) & set(gm) if sm[k] != gm[k]}
    if only_src or only_gen or val_diff:
        diffs.append((mod["module"], f"src_only={len(only_src)} gen_only={len(only_gen)} val_diff={len(val_diff)}"))

if diffs:
    for d in diffs:
        print(f"  ⚠️  {d[0]}: {d[1]}", file=sys.stderr)
print(len(diffs))
PYEOF
)"

if [ "${DIFF_COUNT}" != "0" ]; then
  echo "❌ 存在 ${DIFF_COUNT} 个宏级实质差异（见上）"
  exit ${FAIL}
fi
echo "  ✅ 110 模块宏级完全一致（0 实质差异）"

# ---- 3. yuleASR 全量构建 + ctest -------------------------------------------
if [ "${SKIP_BUILD}" = "1" ]; then
  echo ""
  echo "=== [3/3] yuleASR 构建/测试（--skip-build 已跳过）==="
  echo "  ✅ 跳过（如需完整验证去掉 --skip-build）"
else
  echo ""
  echo "=== [3/3] yuleASR 全量构建 + ctest ==="
  cd "${YULEASR_DIR}"
  cmake -S . -B build -DBUILD_TESTING=ON > /dev/null 2>&1 || { echo "❌ cmake 配置失败"; exit ${FAIL}; }
  cmake --build build -j "$(sysctl -n hw.ncpu 2>/dev/null || echo 4)" > /tmp/linkage-build.log 2>&1 \
    || { echo "❌ 构建失败（/tmp/linkage-build.log）"; tail -20 /tmp/linkage-build.log; exit ${FAIL}; }
  CTEST_OUT="$(cd build && ctest 2>&1 || true)"
  CTEST_SUMMARY="$(echo "${CTEST_OUT}" | grep -E "tests passed|tests failed" | tail -1 || echo '')"
  echo "  ${CTEST_SUMMARY}"
  if echo "${CTEST_OUT}" | grep -q "tests failed"; then
    FAILED_CNT="$(echo "${CTEST_OUT}" | grep -oE '[0-9]+ tests failed' | grep -oE '^[0-9]+' || echo 1)"
    if [ "${FAILED_CNT}" != "0" ]; then
      echo "❌ ctest 存在失败"
      echo "${CTEST_OUT}" | grep -E "Failed|FAILED" | head -20
      exit ${FAIL}
    fi
  fi
  echo "  ✅ ctest 全绿"
fi

echo ""
echo "============================================================"
echo " ✅ 联动回归全部通过：生成对比 110/110 + 宏级 0 差异 + 构建测试全绿"
echo "============================================================"
exit ${PASS}
