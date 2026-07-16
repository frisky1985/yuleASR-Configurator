#!/usr/bin/env bash
# =============================================================================
# yuleASR Configurator — One-Click Deploy Script
# =============================================================================
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
# =============================================================================

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ── Configuration ──────────────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# ── Step 1: Check system dependencies ──────────────────────────────────────
info "Checking system dependencies..."

if ! command -v docker &>/dev/null; then
  err "Docker is not installed. Please install Docker first."
  err "  https://docs.docker.com/engine/install/"
  exit 1
fi
ok "Docker found: $(docker --version)"

# Check for docker compose (v2)
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker compose"
  ok "Docker Compose v2 found"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
  ok "Docker Compose v1 found (consider upgrading to v2)"
else
  err "Docker Compose is not installed."
  err "  https://docs.docker.com/compose/install/"
  exit 1
fi

# ── Step 2: Git pull latest code ────────────────────────────────────────────
info "Updating code from git..."

if [ -d ".git" ]; then
  # Check if there are local changes
  if [ -n "$(git status --porcelain)" ]; then
    warn "Local changes detected. Stashing them before pulling..."
    git stash push -m "deploy-script-auto-stash-$(date +%s)"
  fi

  git fetch origin
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
    warn "Could not pull from remote. Continuing with local code."
  }

  # Restore stash if any
  if git stash list | grep -q "deploy-script-auto-stash"; then
    git stash pop || true
  fi
  ok "Code updated"
else
  warn "Not a git repository or .git missing. Skipping git pull."
fi

# ── Step 3: Set up .env ─────────────────────────────────────────────────────
info "Setting up environment configuration..."

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    warn ".env file created from .env.example"
    warn "Please review and update .env with your actual configuration values!"
    warn "  Edit file: $PROJECT_DIR/.env"
    echo ""
    echo -e "${YELLOW}Contents of .env:${NC}"
    grep -v '^#' .env | grep -v '^\s*$' | sed 's/^/  /'
    echo ""
  else
    warn ".env.example not found. Creating minimal .env..."
    cat > .env << 'EOF'
DATABASE_URL="postgres://yuleasr:***@postgres:5432/yuleasr"
DB_PASSWORD=changeme
JWT_SECRET=change-this-in-production
FRONTEND_URL=http://localhost:5173
PAYMENT_MODE=mock
PORT=3000
HOST=0.0.0.0
API_PORT=3000
EOF
    warn "Minimal .env created. Please update with your actual values!"
  fi
else
  ok ".env file already exists"
fi

# ── Step 4: Build Docker images ────────────────────────────────────────────
info "Building Docker images..."
$DOCKER_COMPOSE build
ok "Docker images built successfully"

# ── Step 5: Start services ─────────────────────────────────────────────────
info "Starting services with Docker Compose..."
$DOCKER_COMPOSE up -d
ok "Services started"

# ── Step 6: Health check wait ──────────────────────────────────────────────
info "Waiting for services to become healthy..."
MAX_RETRIES=30
RETRY_INTERVAL=5
SERVICES=$($DOCKER_COMPOSE ps --services 2>/dev/null || echo "api")

for i in $(seq 1 $MAX_RETRIES); do
  ALL_HEALTHY=true

  for service in $SERVICES; do
    STATUS=$($DOCKER_COMPOSE ps "$service" --format "{{.Status}}" 2>/dev/null || echo "")
    HEALTH=$($DOCKER_COMPOSE ps "$service" --format "{{.Health}}" 2>/dev/null || echo "")

    # Services without healthcheck show as empty or no status
    if [ -z "$STATUS" ] || echo "$STATUS" | grep -qi "exit\|unhealthy"; then
      ALL_HEALTHY=false
      break
    fi

    # If service has a healthcheck, wait for it
    if [ -n "$HEALTH" ] && [ "$HEALTH" != "healthy" ]; then
      ALL_HEALTHY=false
      break
    fi
  done

  if [ "$ALL_HEALTHY" = true ]; then
    ok "All services are healthy!"
    break
  fi

  if [ "$i" -eq "$MAX_RETRIES" ]; then
    warn "Some services may not be healthy yet after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
    warn "Run '$DOCKER_COMPOSE ps' to check status."
    $DOCKER_COMPOSE ps
  else
    sleep "$RETRY_INTERVAL"
  fi
done

# ── Step 7: Verify API health endpoint ─────────────────────────────────────
info "Verifying API health endpoint..."
API_PORT=${API_PORT:-3000}
for i in $(seq 1 10); do
  if curl -sf "http://localhost:${API_PORT}/health" &>/dev/null; then
    HEALTH_DATA=$(curl -sf "http://localhost:${API_PORT}/health" 2>/dev/null || true)
    ok "API is responding!"
    echo "  Health data: $HEALTH_DATA"
    break
  fi
  if [ "$i" -eq 10 ]; then
    warn "API health check did not respond in time."
    warn "You can check logs with: $DOCKER_COMPOSE logs api"
  fi
  sleep 3
done

# ── Output summary ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀  yuleASR Configurator deployed successfully!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}API:${NC}         http://localhost:${API_PORT:-3000}"
echo -e "  ${CYAN}API Docs:${NC}    http://localhost:${API_PORT:-3000}/docs"
echo -e "  ${CYAN}Health:${NC}      http://localhost:${API_PORT:-3000}/health"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo "    $DOCKER_COMPOSE logs -f api    # Follow API logs"
echo "    $DOCKER_COMPOSE ps             # Service status"
echo "    $DOCKER_COMPOSE down           # Stop all services"
echo "    $DOCKER_COMPOSE restart api    # Restart API only"
echo ""
echo -e "  ${YELLOW}Payment mode:${NC}  $(grep '^PAYMENT_MODE=' .env 2>/dev/null | cut -d= -f2 || echo 'mock')"
echo ""

# ── Check if payment is in mock mode ────────────────────────────────────────
PAYMENT_MODE_VAL=$(grep '^PAYMENT_MODE=' .env 2>/dev/null | cut -d= -f2 || echo "mock")
if [ "$PAYMENT_MODE_VAL" = "mock" ]; then
  echo -e "  ${YELLOW}⚠  Payment is in MOCK mode.${NC}"
  echo -e "  ${YELLOW}   To enable real payments via LemonSqueezy:${NC}"
  echo "    1. Set PAYMENT_MODE=live in .env"
  echo "    2. Set LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID"
  echo "    3. Set LEMON_VARIANT_ID_MONTHLY and LEMON_VARIANT_ID_YEARLY"
  echo "    4. Run: $DOCKER_COMPOSE up -d api"
  echo ""
fi
