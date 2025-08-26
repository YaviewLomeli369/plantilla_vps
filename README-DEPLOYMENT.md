
# 🚀 Nova Web Template - Sistema de Despliegue Multi-Sitio

## Descripción

Este sistema permite desplegar múltiples sitios web independientes desde una sola plantilla, cada uno con:
- Puerto único (3000, 3002, 3004, etc.)
- Base de datos PostgreSQL separada
- Contenedor Docker independiente
- Variables de entorno propias
- Scripts de gestión individuales

## 📋 Prerrequisitos

- Ubuntu/Debian con acceso root
- Docker y Docker Compose
- PostgreSQL (se instala automáticamente si no existe)
- Puertos disponibles (3000, 3002, 3004, etc.)

## 🎯 Uso Rápido

### 1. Clonar la plantilla en tu VPS:
```bash
git clone <tu-repo> /root/template
cd /root/template
```

### 2. Ejecutar el script de despliegue:
```bash
sudo ./deploy-project.sh
```

### 3. Seguir las instrucciones interactivas:
```
Ingrese el nombre del proyecto: proyecto_1
Ingrese el puerto (ej: 3000): 3000
```

¡Listo! Tu sitio estará disponible en `http://tu-servidor:3000`

## 🔧 Características del Script

### ✅ Verificaciones Automáticas:
- ✓ Versión de PostgreSQL
- ✓ Disponibilidad de puertos
- ✓ Permisos de usuario
- ✓ Dependencias del sistema

### 🗄️ Gestión de Base de Datos:
- ✓ Crea usuario `yaviewlomeli` automáticamente
- ✓ Genera base de datos única por proyecto: `db_proyecto_X`
- ✓ Asigna permisos completos
- ✓ Verifica conectividad antes de continuar

### 🐳 Despliegue con Docker:
- ✓ Construcción optimizada multi-stage
- ✓ Separación frontend/backend
- ✓ Health checks automáticos
- ✓ Reinicio automático en fallos

### 📊 Monitoreo y Logs:
- ✓ Verificación post-despliegue
- ✓ Logs detallados en caso de error
- ✓ Scripts de gestión por proyecto

## 📁 Estructura de Proyectos

```
/root/www/
├── proyecto_1/          # Puerto 3000, db_proyecto_1
├── proyecto_2/          # Puerto 3002, db_proyecto_2
├── proyecto_3/          # Puerto 3004, db_proyecto_3
└── ...
```

Cada proyecto incluye:
```
proyecto_X/
├── client/              # Frontend (React/Vue)
├── server/              # Backend (Node.js)
├── .env                 # Variables de entorno
├── docker-compose.yml   # Configuración Docker
├── manage.sh           # Script de gestión
├── info.sh             # Información del proyecto
└── ...
```

## 🎮 Comandos de Gestión por Proyecto

Dentro del directorio de cada proyecto (`/root/www/proyecto_X/`):

```bash
# Ver información del proyecto
./info.sh

# Iniciar el proyecto
./manage.sh start

# Detener el proyecto
./manage.sh stop

# Reiniciar el proyecto
./manage.sh restart

# Ver logs en tiempo real
./manage.sh logs

# Ver estado de contenedores
./manage.sh status

# Reconstruir completamente
./manage.sh rebuild

# Acceder al shell del contenedor
./manage.sh shell
```

## 🌐 Gestión Multi-Sitio

Para gestionar todos los sitios desde la raíz del template:

```bash
# Listar todos los sitios
./manage-sites.sh list

# Ver puertos ocupados/disponibles
./manage-sites.sh ports

# Verificar salud de todos los sitios
./manage-sites.sh health

# Gestionar un sitio específico
./manage-sites.sh stop proyecto_1
./manage-sites.sh start proyecto_1
./manage-sites.sh logs proyecto_1
```

## 🔒 Configuración SSL y Dominios

### Opción 1: Nginx Proxy Manager (Recomendado)
```bash
# En /root/proyects/nginx-proxy-manager/
docker-compose up -d
```
Después configura desde la interfaz web:
- Asigna dominios a puertos específicos
- Genera certificados SSL automáticamente

### Opción 2: Configuración manual con Nginx
```bash
# Crear configuración por sitio
nano /etc/nginx/sites-available/proyecto_1

server {
    listen 80;
    server_name midominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Solución de Problemas

### Error: Puerto ocupado
```bash
# Ver qué está usando el puerto
ss -tlnp | grep :3000
docker ps --format '{{.Ports}}'
```

### Error: Base de datos no conecta
```bash
# Verificar servicio PostgreSQL
systemctl status postgresql

# Probar conexión manual
PGPASSWORD='Losy990209bn7*' psql -h localhost -U yaviewlomeli -d db_proyecto_1 -c "SELECT 1;"
```

### Error: Docker no responde
```bash
# Reiniciar Docker
systemctl restart docker

# Ver logs detallados
cd /root/www/proyecto_X
docker-compose logs -f app
```

### Limpiar recursos Docker
```bash
# Desde cualquier proyecto
./manage-sites.sh cleanup
```

## 📈 Escalabilidad

El sistema permite hasta 100+ proyectos simultáneos:
- **Puertos**: 3000-3198 (99 sitios)
- **Bases de datos**: Independientes por proyecto
- **Recursos**: Limitados por hardware del servidor
- **SSL**: Automático con Nginx Proxy Manager

## 🤝 Soporte

En caso de problemas:
1. Ejecuta `./deploy-project.sh` nuevamente
2. Revisa logs con `./manage.sh logs`
3. Verifica estado con `./manage-sites.sh health`
4. Consulta este README

## 🔄 Actualizaciones

Para actualizar la plantilla:
```bash
cd /root/template
git pull origin main
# Los proyectos existentes no se afectan
```

---

**¡Sistema listo para producción!** 🎉
