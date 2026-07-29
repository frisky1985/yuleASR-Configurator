#!/usr/bin/env bash
#
# start-pipeline-server.sh
# yuleASR-Configurator → yuleOSH Pipeline 一键启动脚本
#
# 用法:
#   ./scripts/start-pipeline-server.sh              # 默认 (源码 yuleOSH)
#   ./scripts/start-pipeline-server.sh --project /path/to/project  # 自定义 project dir
#   ./scripts/start-pipeline-server.sh --port 8080  # 自定义端口
#   ./scripts/start-pipeline-server.sh --help       # 帮助
#

set -euo pipefail

# ── 默认值 ────────────────────────────────────────────────────────────────
YULEOSH_DIR="${YULEOSH_DIR:-$HOME/.openclaw/workspace/tasks/yuleOSH}"
OSH_HOME="${OSH_HOME:-$HOME/.openclaw/workspace/yuleASR}"
DEFAULT_PORT=8080
PORT="$DEFAULT_PORT"

# ── 解析参数 ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project|-p)
      OSH_HOME="$2"
      shift 2
      ;;
    --port|-P)
      PORT="$2"
      shift 2
      ;;
    --yuleosh-dir|-y)
      YULEOSH_DIR="$2"
      shift 2
      ;;
    --help|-h)
      echo "yuleASR-Configurator → yuleOSH Pipeline 启动脚本"
      echo ""
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --project, -p <dir>     yuleOSH pipeline 项目目录 (默认: yuleASR workspace)"
      echo "  --port, -P <port>       HTTP 服务器端口 (默认: $DEFAULT_PORT)"
      echo "  --yuleosh-dir, -y <dir> yuleOSH 源码目录 (默认: \$HOME/.openclaw/workspace/tasks/yuleOSH)"
      echo "  --help, -h              显示此帮助"
      echo ""
      echo "环境变量:"
      echo "  OSH_HOME                project 目录覆盖"
      echo "  YULEOSH_DIR             yuleOSH 源码目录覆盖"
      echo "  YULEOSH_AUTH_DISABLED   设为 true 以禁用认证 (可选)"
      echo ""
      exit 0
      ;;
    *)
      echo "未知选项: $1"
      echo "使用 --help 查看帮助"
      exit 1
      ;;
  esac
done

# ── 路径校验 ──────────────────────────────────────────────────────────────
if [ ! -d "$YULEOSH_DIR" ]; then
  echo "❌ yuleOSH 目录不存在: $YULEOSH_DIR"
  echo "   请设置 YULEOSH_DIR 或 --yuleosh-dir"
  exit 1
fi

if [ ! -d "$YULEOSH_DIR/src/yuleosh" ]; then
  echo "❌ yuleOSH 源码目录不完整: $YULEOSH_DIR/src/yuleosh 不存在"
  exit 1
fi

mkdir -p "$OSH_HOME"
echo "📂 OSH_HOME: $OSH_HOME"

# ── 添加 yuleOSH 到 Python path ──────────────────────────────────────────
export PYTHONPATH="${YULEOSH_DIR}/src:${PYTHONPATH:-}"
export OSH_HOME="$OSH_HOME"

# 如果 AUTH_DISABLED 未设置但未明确启用，默认禁用 auth (dev 模式)
if [ -z "${YULEOSH_AUTH_DISABLED:-}" ]; then
  export YULEOSH_AUTH_DISABLED="true"
fi

# ── 启动 ──────────────────────────────────────────────────────────────────
echo "🚀 启动 yuleOSH Pipeline Server..."
echo "   Port:    $PORT"
echo "   Source:  $YULEOSH_DIR"
echo "   Project: $OSH_HOME"
echo "   Auth:    $([ "$YULEOSH_AUTH_DISABLED" = "true" ] && echo 'DISABLED (dev)' || echo 'ENABLED')"
echo ""
echo "   API 端点:"
echo "     POST  /api/v1/pipeline/trigger     # 触发 pipeline"
echo "     GET   /api/v1/pipeline/status/<id> # 查询状态"
echo "     GET   /api/v1/pipeline/runs        # 历史运行"
echo "     GET   /api/v1/pipeline/stats       # 统计"
echo ""
echo "   按 Ctrl+C 停止服务器"
echo ""

cd "$YULEOSH_DIR"
exec python3 -m yuleosh.ui.server 127.0.0.1 "$PORT"
