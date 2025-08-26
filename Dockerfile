
# Multi-stage build optimizado para mejor rendimiento
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Stage 1: Instalar dependencias
FROM base AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con optimizaciones
RUN npm ci --only=production --frozen-lockfile --no-audit --no-fund && \
    npm cache clean --force

# Stage 2: Build de la aplicación
FROM base AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build del frontend y backend
ENV NODE_ENV=production
ENV VITE_API_URL=""

# Instalar dependencias de desarrollo para build
RUN npm ci --frozen-lockfile --no-audit --no-fund

# Build de la aplicación
RUN npm run build && \
    npm prune --production

# Stage 3: Imagen de producción
FROM base AS production

# Establecer directorio de trabajo
WORKDIR /app

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/uploads /tmp/uploads && \
    chown -R nextjs:nodejs /app /tmp/uploads

# Cambiar a usuario no-root
USER nextjs

# Copiar aplicación construida con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Copiar archivos estáticos si existen
COPY --from=builder --chown=nextjs:nodejs /app/client/dist ./public 2>/dev/null || true

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check mejorado con timeout apropiado
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicio con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
