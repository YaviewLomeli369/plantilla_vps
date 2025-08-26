#!/bin/bash

# Multi-site initialization and deployment script
# Usage: ./init-multisite.sh <project_name> <port> [storage_type] [db_port]

PROJECT_NAME=$1
PORT=$2
STORAGE_TYPE=${3:-"memory"}
DB_PORT=${4:-"5433"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for logging with timestamps and log levels
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level^^}] ${message}${NC}"
}

log "info" "${BLUE}🚀 Multi-Site Deployment System${NC}"
log "info" "${BLUE}================================${NC}"

# Validate input
if [ -z "$PROJECT_NAME" ] || [ -z "$PORT" ]; then
    log "error" "${RED}❌ Usage: ./init-multisite.sh <project_name> <port> [storage_type] [db_port]${NC}"
    log "info" "${YELLOW}Examples:${NC}"
    log "  ./init-multisite.sh proyecto_1 3000 memory"
    log "  ./init-multisite.sh proyecto_2 3002 database 5433"
    log "info" "${YELLOW}Storage types: memory (default) | database${NC}"
    log "info" "${YELLOW}Available ports: 3000, 3002, 3004, 3006, 3008...${NC}"
    exit 1
fi

# Validate port is not in use
if docker ps --format '{{.Ports}}' | grep -q ":${PORT}->" 2>/dev/null; then
    log "error" "${RED}❌ Error: Port $PORT is already in use${NC}"
    log "info" "${YELLOW}💡 Use './manage-sites.sh ports' to check available ports${NC}"
    exit 1
fi

PROJECT_DIR="/root/www/$PROJECT_NAME"

log "info" "${YELLOW}📋 Configuration Summary:${NC}"
log "info" "   Project: $PROJECT_NAME"
log "info" "   Port: $PORT"
log "info" "   Storage: $STORAGE_TYPE"
if [ "$STORAGE_TYPE" = "database" ]; then
    log "info" "   DB Port: $DB_PORT"
fi
log "info" "   Directory: $PROJECT_DIR"
log "info" ""

# Step 1: Create project directory
log "info" "${BLUE}=== STEP 1: Project Setup ===${NC}"
if [ -d "$PROJECT_DIR" ]; then
    log "warn" "${YELLOW}⚠️  Directory $PROJECT_DIR already exists${NC}"
    read -p "Continue with existing directory? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "info" "❌ Aborted"
        exit 1
    fi
else
    log "info" "📁 Creating project directory..."
    mkdir -p "$PROJECT_DIR"
    if [ $? -ne 0 ]; then
        log "error" "${RED}❌ Failed to create project directory: $PROJECT_DIR${NC}"
        exit 1
    fi
fi

# Step 2: Copy source code
log "info" "📋 Copying source code..."
# Ensure all necessary files are copied. Add more specific files if needed.
cp -r client server shared migrations *.json *.js *.ts *.md Dockerfile .dockerignore "$PROJECT_DIR/"
if [ $? -ne 0 ]; then
    log "error" "${RED}❌ Failed to copy source code to $PROJECT_DIR${NC}"
    exit 1
fi

# Step 3: Database setup (if needed)
if [ "$STORAGE_TYPE" = "database" ]; then
    log "info" "${BLUE}=== STEP 2: Database Setup ===${NC}"

    # Check if PostgreSQL is available
    if ! command -v psql &> /dev/null; then
        log "warn" "${YELLOW}❌ PostgreSQL client not found. Attempting to install...${NC}"
        sudo apt update && sudo apt install -y postgresql postgresql-contrib
        if [ $? -ne 0 ]; then
            log "error" "${RED}❌ Failed to install PostgreSQL. Falling back to memory storage.${NC}"
            STORAGE_TYPE="memory"
        fi
    fi

    # Start PostgreSQL service if not running
    if command -v systemctl &> /dev/null && ! systemctl is-active --quiet postgresql; then
        log "info" "🔄 Starting PostgreSQL service..."
        sudo systemctl start postgresql
        if [ $? -ne 0 ]; then
            log "error" "${RED}❌ Failed to start PostgreSQL service. Falling back to memory storage.${NC}"
            STORAGE_TYPE="memory"
        else
            sudo systemctl enable postgresql # Enable on boot if started successfully
        fi
    fi

    # Configure database only if we are proceeding with database storage
    if [ "$STORAGE_TYPE" = "database" ]; then
        log "info" "⚙️ Configuring database for project '$PROJECT_NAME' on port $DB_PORT..."
        # Assuming setup-database.sh exists and handles user/db creation
        if [ -f "./setup-database.sh" ]; then
            ./setup-database.sh "$PROJECT_NAME" "$DB_PORT"
            if [ $? -ne 0 ]; then
                log "error" "${RED}❌ Database setup script failed.${NC}"
                log "warn" "${YELLOW}💡 Falling back to memory storage.${NC}"
                STORAGE_TYPE="memory"
            else
                log "info" "✅ Database setup successful."
            fi
        else
            log "error" "${RED}❌ setup-database.sh script not found. Falling back to memory storage.${NC}"
            STORAGE_TYPE="memory"
        fi
    fi
fi

# Step 4: Create environment configuration
log "info" "${BLUE}=== STEP 3: Environment Configuration ===${NC}"
cd "$PROJECT_DIR" || exit 1 # Exit if cd fails

log "info" "📝 Creating .env file..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
STORAGE_TYPE=$STORAGE_TYPE
SITE_NAME=$PROJECT_NAME
EOF

if [ "$STORAGE_TYPE" = "database" ]; then
    # Ensure the DB_PORT is correctly substituted
    echo "DATABASE_URL=postgresql://${PROJECT_NAME}_user:${PROJECT_NAME}_pass@localhost:${DB_PORT}/db_${PROJECT_NAME}" >> .env
fi

if [ $? -ne 0 ]; then
    log "error" "${RED}❌ Failed to create .env file${NC}"
    exit 1
fi
log "info" "✅ Environment file created."

# Step 5: Create Docker configuration
log "info" "${BLUE}=== STEP 4: Docker Configuration ===${NC}"

# Create docker-compose.yml
log "info" "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << EOF
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: ${PROJECT_NAME}_app
    restart: unless-stopped
    ports:
      - "${PORT}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - STORAGE_TYPE=$STORAGE_TYPE
      - SITE_NAME=$PROJECT_NAME
EOF

if [ "$STORAGE_TYPE" = "database" ]; then
    # Ensure the DB_PORT is correctly substituted and use host.docker.internal for DB connection
    cat >> docker-compose.yml << EOF
      - DATABASE_URL=postgresql://${PROJECT_NAME}_user:${PROJECT_NAME}_pass@host.docker.internal:${DB_PORT}/db_${PROJECT_NAME}
EOF
fi

cat >> docker-compose.yml << EOF
    env_file:
      - .env
    extra_hosts:
      - "host.docker.internal:host-gateway"
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - ${PROJECT_NAME}_network

networks:
  ${PROJECT_NAME}_network:
    driver: bridge
EOF

if [ $? -ne 0 ]; then
    log "error" "${RED}❌ Failed to create docker-compose.yml${NC}"
    exit 1
fi
log "info" "✅ Docker configuration created."

# Step 6: Create deployment scripts
log "info" "📝 Creating deployment scripts..."

# deploy.sh
cat > deploy.sh << EOF
#!/bin/bash
log() {
    local level=\$1
    local message=\$2
    local timestamp=\$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "\${timestamp} [\${level^^}] \${message}\${NC}"
}
log "info" "🚀 Deploying $PROJECT_NAME on port $PORT..."
docker-compose down --remove-orphans || log "warn" "No previous containers to remove."
docker-compose up --build -d
if [ \$? -eq 0 ]; then
    log "info" "✅ $PROJECT_NAME deployed successfully!"
    log "info" "🌐 Access at: http://localhost:$PORT"
    log "info" "📋 Logs: docker-compose logs -f app"
else
    log "error" "${RED}❌ Deployment failed. Check logs.${NC}"
fi
EOF
chmod +x deploy.sh

# manage.sh
cat > manage.sh << EOF
#!/bin/bash
log() {
    local level=\$1
    local message=\$2
    local timestamp=\$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "\${timestamp} [\${level^^}] \${message}\${NC}"
}
case \$1 in
    "start"|"up")
        log "info" "Starting containers..."
        docker-compose up -d
        ;;
    "stop"|"down")
        log "info" "Stopping containers..."
        docker-compose down
        ;;
    "restart")
        log "info" "Restarting containers..."
        docker-compose restart
        ;;
    "logs")
        log "info" "Showing logs (press Ctrl+C to stop)..."
        docker-compose logs -f app
        ;;
    "status")
        log "info" "Showing container status..."
        docker-compose ps
        ;;
    "rebuild")
        log "info" "Rebuilding and starting containers..."
        docker-compose down --remove-orphans || log "warn" "No previous containers to remove."
        docker-compose up --build -d
        ;;
    *)
        log "error" "Usage: ./manage.sh {start|stop|restart|logs|status|rebuild}"
        ;;
esac
EOF
chmod +x manage.sh

if [ $? -ne 0 ]; then
    log "error" "${RED}❌ Failed to create management scripts${NC}"
    exit 1
fi
log "info" "✅ Management scripts created."

# Step 7: Deploy
log "info" "${BLUE}=== STEP 5: Deployment ===${NC}"
log "info" "🚀 Building and starting containers..."

# Use the deploy script for consistency
./deploy.sh

if [ $? -eq 0 ]; then
    log "success" "${GREEN}✅ SUCCESS: $PROJECT_NAME deployed successfully!${NC}"
    log "info" ""
    log "info" "${YELLOW}📋 Deployment Summary:${NC}"
    log "info" "   🌐 URL: http://localhost:$PORT"
    log "info" "   📁 Directory: $PROJECT_DIR"
    log "info" "   💾 Storage: $STORAGE_TYPE"
    if [ "$STORAGE_TYPE" = "database" ]; then
        log "info" "   🗄️  Database: db_$PROJECT_NAME on port $DB_PORT"
    fi
    log "info" ""
    log "info" "${YELLOW}🔧 Management Commands:${NC}"
    log "info" "   View logs: cd $PROJECT_DIR && ./manage.sh logs"
    log "info" "   Restart: cd $PROJECT_DIR && ./manage.sh restart"
    log "info" "   Stop: cd $PROJECT_DIR && ./manage.sh stop"
    log "info" ""
    log "info" "${YELLOW}🌐 Multi-Site Management:${NC}"
    log "info" "   List sites: ./manage-sites.sh list"
    log "info" "   Check ports: ./manage-sites.sh ports"
else
    log "error" "${RED}❌ Deployment failed. Please check the logs above for details.${NC}"
    # Attempt to show logs if deployment failed
    log "info" "Attempting to show logs:"
    docker-compose logs || log "warn" "Could not retrieve logs."
    exit 1
fi