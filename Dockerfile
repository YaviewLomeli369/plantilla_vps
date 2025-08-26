FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl dumb-init ca-certificates

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./

# Instalar todas las dependencias con legacy-peer-deps para evitar conflictos
RUN npm ci --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build de la aplicación
ENV NODE_ENV=production
RUN npm run build

# Limpiar dependencias de desarrollo después del build
RUN npm prune --production --legacy-peer-deps

# Crear directorios necesarios
RUN mkdir -p uploads logs && \
    chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["dumb-init", "node", "dist/index.js"]