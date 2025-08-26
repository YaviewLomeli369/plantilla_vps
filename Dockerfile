
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    dumb-init \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./

# Verificar si existe package-lock.json, si no, generarlo
RUN if [ ! -f package-lock.json ]; then \
        echo "⚠️  package-lock.json no encontrado, generando..."; \
        npm install --package-lock-only --legacy-peer-deps; \
    fi

# Instalar todas las dependencias con legacy-peer-deps
RUN npm ci --legacy-peer-deps --no-audit --no-fund || \
    (echo "❌ Error con npm ci, intentando con npm install..." && \
     npm install --legacy-peer-deps --no-audit --no-fund)

# Limpiar cache de npm
RUN npm cache clean --force

# Copiar código fuente
COPY . .

# Build de la aplicación
ENV NODE_ENV=production
RUN npm run build

# Limpiar dependencias de desarrollo después del build
RUN npm prune --production --legacy-peer-deps || true

# Crear directorios necesarios y establecer permisos
RUN mkdir -p uploads logs && \
    chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check mejorado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || \
        curl -f http://localhost:3000/ || \
        exit 1

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio con logging
CMD ["sh", "-c", "echo 'Starting application...' && dumb-init node dist/index.js"]
