# Guía de Despliegue de La Grilla

Esta guía cubre el despliegue de La Grilla en servidores de producción.

## 🚀 Opciones de Despliegue

### Opción 1: Servidor VPS (Recomendado)
- DigitalOcean, Linode, AWS EC2, Google Cloud
- Control total del sistema
- Mejor para producción

### Opción 2: Servicios Específicos
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify
- Base de Datos: ElephantSQL, Supabase

## 📦 Despliegue en VPS (Ubuntu 22.04)

### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

### 2. Configurar Base de Datos

```bash
# Crear usuario y base de datos
sudo -u postgres psql

postgres=# CREATE DATABASE la_grilla;
postgres=# CREATE USER lagrilla_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
postgres=# GRANT ALL PRIVILEGES ON DATABASE la_grilla TO lagrilla_user;
postgres=# \q

# Importar esquema
psql -U lagrilla_user -d la_grilla -f /ruta/al/schema.sql
```

### 3. Configurar Backend

```bash
# Clonar repositorio
cd /var/www
git clone <tu-repositorio-url> la-grilla
cd la-grilla/server

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env
```

**Archivo `.env` de producción:**
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://tu-dominio.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=la_grilla
DB_USER=lagrilla_user
DB_PASSWORD=tu_password_seguro

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...tu_hash_real...

# Para reCAPTCHA en producción
RECAPTCHA_SECRET_KEY=tu_clave_secreta_recaptcha
```

```bash
# Iniciar con PM2
pm2 start server.js --name la-grilla-api
pm2 save
pm2 startup
```

### 4. Configurar Frontend

```bash
cd ../client

# Instalar dependencias
npm install

# Configurar URL de API
echo "REACT_APP_API_URL=https://api.tu-dominio.com/api" > .env

# Build para producción
npm run build

# Copiar archivos build a directorio de Nginx
sudo cp -r build/* /var/www/html/la-grilla/
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/la-grilla
```

**Configuración de Nginx:**
```nginx
# Frontend
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/html/la-grilla;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets estáticos
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/la-grilla /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com

# Renovación automática ya está configurada
```

## 🔒 Seguridad en Producción

### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### PostgreSQL
```bash
# Editar configuración
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Cambiar:
# local   all   all   peer
# A:
# local   all   all   md5

sudo systemctl restart postgresql
```

### Variables de Entorno
- Nunca subir archivos `.env` al repositorio
- Usar contraseñas fuertes (16+ caracteres)
- Cambiar credenciales admin por defecto
- Rotar claves regularmente

## 📊 Monitoreo y Mantenimiento

### PM2 Logs
```bash
pm2 logs la-grilla-api
pm2 monit
```

### Backups de Base de Datos
```bash
# Crear script de backup
nano /usr/local/bin/backup-lagrilla.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/la-grilla"
mkdir -p $BACKUP_DIR

pg_dump -U lagrilla_user la_grilla > $BACKUP_DIR/la_grilla_$DATE.sql
gzip $BACKUP_DIR/la_grilla_$DATE.sql

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-lagrilla.sh

# Añadir a crontab (backup diario a las 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-lagrilla.sh
```

### Actualizaciones
```bash
cd /var/www/la-grilla

# Backend
git pull
cd server
npm install --production
pm2 restart la-grilla-api

# Frontend
cd ../client
npm install
npm run build
sudo cp -r build/* /var/www/html/la-grilla/
```

## 🌐 Despliegue en Heroku (Alternativa Rápida)

### Backend

```bash
# Crear app
heroku create la-grilla-api

# Añadir PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD_HASH=tu_hash
heroku config:set CORS_ORIGIN=https://tu-frontend.vercel.app

# Deploy
cd server
git init
heroku git:remote -a la-grilla-api
git add .
git commit -m "Initial deploy"
git push heroku main

# Importar esquema
heroku pg:psql < ../database/schema.sql
```

### Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

cd client

# Deploy
vercel --prod

# Configurar variable de entorno en Vercel Dashboard
# REACT_APP_API_URL = https://la-grilla-api.herokuapp.com/api
```

## 📈 Optimizaciones de Rendimiento

### Nginx Caching
```nginx
# Añadir al bloque server del frontend
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PostgreSQL Índices
Ya incluidos en `schema.sql`, verificar con:
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### PM2 Cluster Mode
```bash
pm2 start server.js --name la-grilla-api -i max
```

## 🚨 Solución de Problemas

### Backend no inicia
```bash
pm2 logs la-grilla-api --err
# Verificar logs para errores de conexión a BD
```

### Frontend muestra página en blanco
- Verificar que REACT_APP_API_URL esté correcto
- Revisar la consola del navegador (F12)
- Verificar que el build se copió correctamente

### Error 502 Bad Gateway
```bash
# Verificar que el backend esté corriendo
pm2 status

# Reiniciar si es necesario
pm2 restart la-grilla-api
```

## 📞 Soporte

Para problemas de despliegue, crear un issue en GitHub con:
- Sistema operativo y versión
- Logs relevantes
- Configuración de Nginx/servidor
- Variables de entorno (sin contraseñas)

---

**¡Buen despliegue! 🚀**
