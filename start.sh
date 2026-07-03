#!/bin/bash

# AI Oil & Gas Well Production Forecaster - Startup Script
# ========================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${PURPLE}⛽ PetroAI Forecaster - Production Intelligence${CYAN}     ║${NC}"
echo -e "${CYAN}║     ${BLUE}AI Oil & Gas Well Production Forecaster${CYAN}              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

kill_port_tree() {
  local port="$1"
  local pids
  pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  [ -z "$pids" ] && return 0

  for pid in $pids; do
    local ppid
    ppid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)
    [ -n "$ppid" ] && [ "$ppid" != "1" ] && kill "$ppid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
  done

  sleep 0.6

  pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  for pid in $pids; do
    local ppid
    ppid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)
    [ -n "$ppid" ] && [ "$ppid" != "1" ] && kill -9 "$ppid" 2>/dev/null || true
    kill -9 "$pid" 2>/dev/null || true
  done
}

wait_for_port_free() {
  local port="$1"
  local attempts=10

  while [ "$attempts" -gt 0 ]; do
    if ! lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
    kill_port_tree "$port"
    attempts=$((attempts - 1))
    sleep 0.5
  done

  echo -e "${RED}✗ Port ${port} is still in use:${NC}"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN || true
  exit 1
}

# Kill processes on used ports
echo -e "${YELLOW}→ Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"
kill_port_tree "$BACKEND_PORT"
kill_port_tree "$FRONTEND_PORT"
wait_for_port_free "$BACKEND_PORT"
wait_for_port_free "$FRONTEND_PORT"
echo -e "${GREEN}✓ Ports cleaned${NC}"

# Check PostgreSQL
echo -e "${YELLOW}→ Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL not found. Please install PostgreSQL.${NC}"
  exit 1
fi

if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
  echo -e "${YELLOW}→ Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo -e "${RED}✗ Could not start PostgreSQL. Please start it manually.${NC}"
    exit 1
  }
  sleep 2
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Create database if not exists
echo -e "${YELLOW}→ Setting up database...${NC}"
if [ -n "$DATABASE_URL" ]; then
  DB_FROM_URL=$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.pathname.replace(/^\\//,''));")
  psql postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_FROM_URL}'" 2>/dev/null | grep -q 1 || \
    createdb "${DB_FROM_URL}" 2>/dev/null || true
else
  psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-oilgas_forecaster}'" 2>/dev/null | grep -q 1 || \
    createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} ${DB_NAME:-oilgas_forecaster} 2>/dev/null || true
fi
echo -e "${GREEN}✓ Database ready${NC}"

# Install backend dependencies
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Seed database
echo -e "${YELLOW}→ Seeding database with sample data...${NC}"
cd "$PROJECT_DIR/backend"
node src/seed.js
echo -e "${GREEN}✓ Database seeded successfully${NC}"

# Start backend with nodemon (hot reload)
echo -e "${YELLOW}→ Starting backend server on port ${BACKEND_PORT}...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!
sleep 2
echo -e "${GREEN}✓ Backend running (PID: ${BACKEND_PID})${NC}"

# Start frontend with hot reload (built-in with react-scripts)
echo -e "${YELLOW}→ Starting frontend on port ${FRONTEND_PORT}...${NC}"
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=${FRONTEND_PORT} npm start &
FRONTEND_PID=$!
sleep 3
echo -e "${GREEN}✓ Frontend running (PID: ${FRONTEND_PID})${NC}"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${GREEN}Application is running!${CYAN}                                 ║${NC}"
echo -e "${CYAN}║                                                          ║${NC}"
echo -e "${CYAN}║  ${BLUE}Frontend:${NC}  http://localhost:${FRONTEND_PORT}${CYAN}                        ║${NC}"
echo -e "${CYAN}║  ${BLUE}Backend:${NC}   http://localhost:${BACKEND_PORT}/api/health${CYAN}              ║${NC}"
echo -e "${CYAN}║                                                          ║${NC}"
echo -e "${CYAN}║  ${YELLOW}Login:${NC}     admin@oilgas.com / admin123${CYAN}                  ║${NC}"
echo -e "${CYAN}║                                                          ║${NC}"
echo -e "${CYAN}║  ${PURPLE}Hot reload enabled - changes auto-refresh${CYAN}               ║${NC}"
echo -e "${CYAN}║  ${RED}Press Ctrl+C to stop all services${CYAN}                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}→ Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill_port_tree "$BACKEND_PORT"
  kill_port_tree "$FRONTEND_PORT"
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
