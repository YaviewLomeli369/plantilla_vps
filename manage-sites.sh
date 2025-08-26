
#!/bin/bash

# Enhanced multi-site management script
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}🚀 Multi-Site Manager${NC}"
    echo -e "${BLUE}====================${NC}"
    echo -e "${YELLOW}Commands:${NC}"
    echo "  create <name> <port> [storage]     - Create and deploy new site"
    echo "  list                              - List all running sites" 
    echo "  stop <name>                       - Stop a project"
    echo "  start <name>                      - Start a project"
    echo "  restart <name>                    - Restart a project"
    echo "  logs <name>                       - View project logs"
    echo "  status <name>                     - Show project status"
    echo "  remove <name>                     - Remove project completely"
    echo "  cleanup                           - Clean unused containers/images"
    echo "  ports                             - Show port usage"
    echo "  health                            - Check all sites health"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./manage-sites.sh create proyecto_1 3000 memory"
    echo "  ./manage-sites.sh create proyecto_2 3002 database"
    echo "  ./manage-sites.sh list"
    echo "  ./manage-sites.sh logs proyecto_1"
}

check_port() {
    local port=$1
    if docker ps --format '{{.Ports}}' | grep -q ":${port}->" 2>/dev/null; then
        return 1  # Port in use
    fi
    return 0  # Port available
}

get_project_status() {
    local project_name=$1
    local project_dir="/root/www/$project_name"
    
    if [ ! -d "$project_dir" ]; then
        echo "not_found"
        return
    fi
    
    cd "$project_dir"
    if docker-compose ps --services --filter "status=running" | grep -q .; then
        echo "running"
    else
        echo "stopped"
    fi
}

case $1 in
    "create")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh create <project_name> <port> [storage_type]${NC}"
            echo -e "${YELLOW}Example: ./manage-sites.sh create proyecto_1 3000 memory${NC}"
            echo -e "${YELLOW}Storage types: memory (default) | database${NC}"
            exit 1
        fi
        
        PROJECT_NAME=$2
        PORT=$3
        STORAGE_TYPE=${4:-"memory"}
        
        # Check if port is available
        if ! check_port $PORT; then
            echo -e "${RED}❌ Error: Port $PORT is already in use${NC}"
            ./manage-sites.sh ports
            exit 1
        fi
        
        echo -e "${BLUE}🚀 Creating new site: $PROJECT_NAME on port $PORT${NC}"
        ./init-multisite.sh "$PROJECT_NAME" "$PORT" "$STORAGE_TYPE"
        ;;
        
    "list")
        echo -e "${BLUE}=== Active Sites ===${NC}"
        echo -e "${YELLOW}$(printf "%-15s %-8s %-10s %-20s" "NAME" "PORT" "STATUS" "STORAGE")${NC}"
        echo "================================================================"
        
        for project_dir in /root/www/*/; do
            if [ -d "$project_dir" ] && [ -f "$project_dir/docker-compose.yml" ]; then
                project_name=$(basename "$project_dir")
                
                # Get port from docker-compose.yml
                port=$(grep -E "ports:" -A1 "$project_dir/docker-compose.yml" | grep -o '[0-9]\+:3000' | cut -d: -f1)
                
                # Get storage type from .env
                storage="unknown"
                if [ -f "$project_dir/.env" ]; then
                    storage=$(grep "STORAGE_TYPE=" "$project_dir/.env" | cut -d= -f2)
                    [ -z "$storage" ] && storage="memory"
                fi
                
                # Get status
                status=$(get_project_status "$project_name")
                
                # Color code status
                case $status in
                    "running") status_color="${GREEN}$status${NC}" ;;
                    "stopped") status_color="${YELLOW}$status${NC}" ;;
                    "not_found") status_color="${RED}$status${NC}" ;;
                esac
                
                printf "%-15s %-8s %-19s %-20s\n" "$project_name" "$port" "$status_color" "$storage"
            fi
        done
        ;;
        
    "stop")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh stop <project_name>${NC}"
            exit 1
        fi
        PROJECT_DIR="/root/www/$2"
        if [ -d "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR" && docker-compose down
            echo -e "${GREEN}✅ $2 stopped${NC}"
        else
            echo -e "${RED}❌ Project $2 not found${NC}"
        fi
        ;;
        
    "start")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh start <project_name>${NC}"
            exit 1
        fi
        PROJECT_DIR="/root/www/$2"
        if [ -d "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR" && docker-compose up -d
            echo -e "${GREEN}✅ $2 started${NC}"
        else
            echo -e "${RED}❌ Project $2 not found${NC}"
        fi
        ;;
        
    "restart")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh restart <project_name>${NC}"
            exit 1
        fi
        PROJECT_DIR="/root/www/$2"
        if [ -d "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR" && docker-compose restart
            echo -e "${GREEN}✅ $2 restarted${NC}"
        else
            echo -e "${RED}❌ Project $2 not found${NC}"
        fi
        ;;
        
    "logs")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh logs <project_name>${NC}"
            exit 1
        fi
        PROJECT_DIR="/root/www/$2"
        if [ -d "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR" && docker-compose logs -f app
        else
            echo -e "${RED}❌ Project $2 not found${NC}"
        fi
        ;;
        
    "status")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh status <project_name>${NC}"
            exit 1
        fi
        PROJECT_DIR="/root/www/$2"
        if [ -d "$PROJECT_DIR" ]; then
            echo -e "${YELLOW}Status for $2:${NC}"
            cd "$PROJECT_DIR" && docker-compose ps
        else
            echo -e "${RED}❌ Project $2 not found${NC}"
        fi
        ;;
        
    "remove")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: ./manage-sites.sh remove <project_name>${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}⚠️  This will completely remove project $2 and all its data!${NC}"
        read -p "Are you sure? Type 'yes' to confirm: " -r
        if [[ $REPLY == "yes" ]]; then
            PROJECT_DIR="/root/www/$2"
            if [ -d "$PROJECT_DIR" ]; then
                cd "$PROJECT_DIR"
                docker-compose down --remove-orphans
                cd ..
                rm -rf "$PROJECT_DIR"
                echo -e "${GREEN}✅ Project $2 removed completely${NC}"
            else
                echo -e "${RED}❌ Project $2 not found${NC}"
            fi
        else
            echo "❌ Cancelled"
        fi
        ;;
        
    "cleanup")
        echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
        echo "Removing stopped containers..."
        docker container prune -f
        echo "Removing unused images..."
        docker image prune -f
        echo "Removing unused networks..."
        docker network prune -f
        echo -e "${GREEN}✅ Cleanup complete${NC}"
        ;;
        
    "ports")
        echo -e "${BLUE}=== Port Usage Report ===${NC}"
        echo -e "${YELLOW}$(printf "%-8s %-15s %-10s" "PORT" "PROJECT" "STATUS")${NC}"
        echo "=================================="
        
        # Common ports to check
        for port in 3000 3002 3004 3006 3008 3010 3012; do
            container=$(docker ps --format '{{.Names}}' --filter "publish=$port" 2>/dev/null | head -1)
            if [ ! -z "$container" ]; then
                project=$(echo "$container" | sed 's/_app$//')
                printf "%-8s %-15s ${GREEN}%-10s${NC}\n" "$port" "$project" "USED"
            else
                printf "%-8s %-15s ${GREEN}%-10s${NC}\n" "$port" "-" "AVAILABLE"
            fi
        done
        ;;
        
    "health")
        echo -e "${BLUE}=== Health Check ===${NC}"
        for project_dir in /root/www/*/; do
            if [ -d "$project_dir" ] && [ -f "$project_dir/docker-compose.yml" ]; then
                project_name=$(basename "$project_dir")
                status=$(get_project_status "$project_name")
                port=$(grep -E "ports:" -A1 "$project_dir/docker-compose.yml" | grep -o '[0-9]\+:3000' | cut -d: -f1)
                
                if [ "$status" = "running" ]; then
                    # Test HTTP endpoint
                    if curl -s -f "http://localhost:$port/api/health" > /dev/null 2>&1; then
                        echo -e "${GREEN}✅ $project_name (port $port) - Healthy${NC}"
                    else
                        echo -e "${YELLOW}⚠️  $project_name (port $port) - Running but not responding${NC}"
                    fi
                else
                    echo -e "${RED}❌ $project_name (port $port) - Not running${NC}"
                fi
            fi
        done
        ;;
        
    *)
        show_help
        ;;
esac
