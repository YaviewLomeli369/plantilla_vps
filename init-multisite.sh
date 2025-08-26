
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

echo -e "${BLUE}🚀 Multi-Site Deployment System${NC}"
echo -e "${BLUE}================================${NC}"

# Validate input
if [ -z "$PROJECT_NAME" ] || [ -z "$PORT" ]; then
    echo -e "${RED}❌ Usage: ./init-multisite.sh <project_name> <port> [storage_type] [db_port]${NC}"
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./init-multisite.sh proyecto_1 3000 memory"
    echo "  ./init-multisite.sh proyecto_2 3002 database 5433"
    echo -e "${YELLOW}Storage types: memory (default) | database${NC}"
    echo -e "${YELLOW}Available ports: 3000, 3002, 3004, 3006, 3008...${NC}"
    exit 1
fi

# Validate port is not in use
if docker ps --format '{{.Ports}}' | grep -q ":${PORT}->" 2>/dev/null; then
    echo -e "${RED}❌ Error: Port $PORT is already in use${NC}"
    echo -e "${YELLOW}💡 Use './manage-sites.sh ports' to check available ports${NC}"
    exit 1
fi

PROJECT_DIR="/root/www/$PROJECT_NAME"

echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo "   Project: $PROJECT_NAME"
echo "   Port: $PORT"
echo "   Storage: $STORAGE_TYPE"
if [ "$STORAGE_TYPE" = "database" ]; then
    echo "   DB Port: $DB_PORT"
fi
echo "   Directory: $PROJECT_DIR"
echo ""

# Step 1: Create project directory
echo -e "${BLUE}=== STEP 1: Project Setup ===${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory $PROJECT_DIR already exists${NC}"
    read -p "Continue with existing directory? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
else
    echo "📁 Creating project directory..."
    mkdir -p "$PROJECT_DIR"
fi

# Step 2: Copy source code
echo "📋 Copying source code..."
cp -r client server shared migrations *.json *.js *.ts *.md Dockerfile .dockerignore "$PROJECT_DIR/"

# Step 3: Database setup (if needed)
if [ "$STORAGE_TYPE" = "database" ]; then
    echo -e "${BLUE}=== STEP 2: Database Setup ===${NC}"
    
    # Check if PostgreSQL is available
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL not found. Installing...${NC}"
        sudo apt update && sudo apt install -y postgresql postgresql-contrib
    fi
    
    # Start PostgreSQL service
    if ! systemctl is-active --quiet postgresql; then
        echo "🔄 Starting PostgreSQL service..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Configure database
    ./setup-database.sh "$PROJECT_NAME" "$DB_PORT"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Database setup failed${NC}"
        echo -e "${YELLOW}💡 Falling back to memory storage${NC}"
        STORAGE_TYPE="memory"
    fi
fi

# Step 4: Create environment configuration
echo -e "${BLUE}=== STEP 3: Environment Configuration ===${NC}"
cd "$PROJECT_DIR"

cat > .env << EOF
NODE_ENV=production
PORT=3000
STORAGE_TYPE=$STORAGE_TYPE
SITE_NAME=$PROJECT_NAME
EOF

if [ "$STORAGE_TYPE" = "database" ]; then
    echo "DATABASE_URL=postgresql://${PROJECT_NAME}_user:${PROJECT_NAME}_pass@localhost:${DB_PORT}/db_${PROJECT_NAME}" >> .env
fi

echo "✅ Environment file created"

# Step 5: Create Docker configuration
echo -e "${BLUE}=== STEP 4: Docker Configuration ===${NC}"

cat > docker-compose.yml << EOF
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

echo "✅ Docker configuration created"

# Step 6: Create deployment scripts
cat > deploy.sh << EOF
#!/bin/bash
echo "🚀 Deploying $PROJECT_NAME on port $PORT..."
docker-compose down --remove-orphans
docker-compose up --build -d
echo "✅ $PROJECT_NAME deployed successfully!"
echo "🌐 Access at: http://localhost:$PORT"
echo "📋 Logs: docker-compose logs -f app"
EOF

chmod +x deploy.sh

cat > manage.sh << EOF
#!/bin/bash
case \$1 in
    "start"|"up")
        docker-compose up -d
        ;;
    "stop"|"down")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f app
        ;;
    "status")
        docker-compose ps
        ;;
    "rebuild")
        docker-compose down --remove-orphans
        docker-compose up --build -d
        ;;
    *)
        echo "Usage: ./manage.sh {start|stop|restart|logs|status|rebuild}"
        ;;
esac
EOF

chmod +x manage.sh

echo "✅ Management scripts created"

# Step 7: Deploy
echo -e "${BLUE}=== STEP 5: Deployment ===${NC}"
echo "🚀 Building and starting containers..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: $PROJECT_NAME deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Deployment Summary:${NC}"
    echo "   🌐 URL: http://localhost:$PORT"
    echo "   📁 Directory: $PROJECT_DIR"
    echo "   💾 Storage: $STORAGE_TYPE"
    if [ "$STORAGE_TYPE" = "database" ]; then
        echo "   🗄️  Database: db_$PROJECT_NAME on port $DB_PORT"
    fi
    echo ""
    echo -e "${YELLOW}🔧 Management Commands:${NC}"
    echo "   View logs: cd $PROJECT_DIR && ./manage.sh logs"
    echo "   Restart: cd $PROJECT_DIR && ./manage.sh restart"
    echo "   Stop: cd $PROJECT_DIR && ./manage.sh stop"
    echo ""
    echo -e "${YELLOW}🌐 Multi-Site Management:${NC}"
    echo "   List sites: ./manage-sites.sh list"
    echo "   Check ports: ./manage-sites.sh ports"
else
    echo -e "${RED}❌ Deployment failed. Check the logs:${NC}"
    echo "docker-compose logs"
fi
