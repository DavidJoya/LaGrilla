# 🚀 Guía de Despliegue: Railway + Vercel

## ✅ Archivos Ya Preparados

Los archivos ya están listos para desplegar:
- ✅ `server/railway.json` - Configuración de Railway
- ✅ `server/package.json` - Engines agregados
- ✅ `server/config/database.js` - Compatible con Railway DATABASE_URL
- ✅ `.gitignore` - Archivos a ignorar

---

## 📝 PASO 1: Subir a GitHub

### 1.1 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `la-grilla` (o el que prefieras)
3. **NO marques** "Add README" o ".gitignore" (ya los tenemos)
4. Click **"Create repository"**

### 1.2 Subir el código

Abre tu terminal en la carpeta del proyecto:

```bash
cd la-grilla

# Inicializar git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - La Grilla Sports Pool"

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/la-grilla.git

# Subir código
git branch -M main
git push -u origin main
```

✅ **Tu código ya está en GitHub!**

---

## 🚂 PASO 2: Deploy Backend en Railway (10 minutos)

### 2.1 Crear cuenta y proyecto

1. Ve a **https://railway.app**
2. Click **"Login"** → Usa tu cuenta de GitHub
3. Click **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Autoriza a Railway a acceder a tus repos
6. Selecciona tu repositorio **`la-grilla`**

### 2.2 Configurar el servicio Node.js

Railway detectará automáticamente Node.js. Ahora configura:

1. Click en el servicio que se creó (aparece como `la-grilla`)
2. Ve a **"Settings"** (⚙️)
3. Busca **"Root Directory"** → Escribe: `server`
4. Busca **"Start Command"** → Debería decir `npm start` (si no, agrégalo)
5. Click **"Save"**

### 2.3 Agregar PostgreSQL

1. En el dashboard del proyecto, click **"+ New"** (arriba a la derecha)
2. Selecciona **"Database"**
3. Selecciona **"Add PostgreSQL"**
4. Espera 30 segundos... ✅ Base de datos creada!

### 2.4 Configurar variables de entorno

1. Click en tu servicio **Node.js** (no en PostgreSQL)
2. Ve a **"Variables"** tab
3. Click **"+ New Variable"** y agrega estas **UNA POR UNA**:

```
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$8wv5p.Yd5QYqF5w5r5KjJeVF1Qf5L5p5L5p5L5p5L5p5L5p5L5
PORT=3001
```

**IMPORTANTE:** 
- Railway conecta automáticamente PostgreSQL (no necesitas DB_HOST, etc.)
- Agregar `CORS_ORIGIN` más tarde cuando tengamos la URL de Vercel

### 2.5 Obtener URL pública

1. En tu servicio Node.js, ve a **"Settings"**
2. Busca **"Networking"** → **"Public Networking"**
3. Click **"Generate Domain"**
4. Copia la URL (ejemplo: `https://la-grilla-production.up.railway.app`)

📝 **GUARDA ESTA URL** - La necesitarás para Vercel

### 2.6 Importar esquema de base de datos

Opción A - **Usando Railway Web Console:**
1. Click en tu servicio **PostgreSQL** 
2. Ve a tab **"Data"**
3. Click **"Query"**
4. Abre el archivo `database/schema.sql` en un editor de texto
5. Copia TODO el contenido
6. Pégalo en la consola de Railway
7. Click **"Run Query"**
8. ✅ Deberías ver "CREATE TABLE" varias veces

Opción B - **Usando Railway CLI** (más rápido):
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Importar esquema
railway run psql < database/schema.sql

# (Opcional) Importar datos de ejemplo
railway run psql < database/sample-data.sql
```

✅ **Backend desplegado en Railway!**

---

## ▲ PASO 3: Deploy Frontend en Vercel (5 minutos)

### 3.1 Crear cuenta y proyecto

1. Ve a **https://vercel.com**
2. Click **"Sign Up"** → Usa tu cuenta de GitHub
3. Click **"Add New..."** → **"Project"**
4. Busca tu repositorio **`la-grilla`**
5. Click **"Import"**

### 3.2 Configurar el proyecto

En la pantalla de configuración:

**Framework Preset:** `Create React App` (debería detectarlo automáticamente)

**Root Directory:** 
- Click en **"Edit"**
- Escribe: `client`
- ✅ Ahora debería mostrar `client` como root

**Build Command:** `npm run build` (por defecto está bien)

**Output Directory:** `build` (por defecto está bien)

### 3.3 Agregar variable de entorno

**MUY IMPORTANTE** - Antes de hacer deploy:

1. Busca la sección **"Environment Variables"**
2. Agrega esta variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://TU-URL-DE-RAILWAY.up.railway.app/api`
   - (Usa la URL que copiaste en el Paso 2.5, agregando `/api` al final)
3. ✅ Asegúrate que termine en `/api`

### 3.4 Deploy!

1. Click **"Deploy"**
2. Espera 2-3 minutos... ☕
3. ✅ Verás "Congratulations! 🎉"
4. Click en la URL de tu sitio o en **"Visit"**

📝 **Copia la URL de Vercel** (ejemplo: `https://la-grilla.vercel.app`)

---

## 🔗 PASO 4: Conectar Frontend y Backend (2 minutos)

### 4.1 Configurar CORS en Railway

1. Vuelve a **Railway**
2. Click en tu servicio **Node.js**
3. Ve a **"Variables"**
4. Click **"+ New Variable"**
5. Agrega:
   - **Name:** `CORS_ORIGIN`
   - **Value:** `https://TU-URL-DE-VERCEL.vercel.app`
   - (Sin `/` al final)

El servicio se reiniciará automáticamente en 10-20 segundos.

---

## ✅ PASO 5: ¡Probar Tu App! (2 minutos)

### 5.1 Verificar que todo funciona

1. Abre tu URL de Vercel: `https://tu-app.vercel.app`
2. ✅ Deberías ver la página principal con el diseño de estadio
3. Click en **"Participar"**
4. ✅ Deberías ver el formulario (puede tardar 10-20 seg la primera vez mientras Railway "despierta")

### 5.2 Probar el admin

1. Ve a `https://tu-app.vercel.app/admin`
2. Usuario: `admin`
3. Contraseña: `admin123`
4. ✅ Deberías entrar al panel

---

## 🎉 ¡LISTO! Tu App Está en Línea

**URLs finales:**
- 🌐 **App pública:** https://tu-app.vercel.app
- 🔧 **Admin:** https://tu-app.vercel.app/admin
- 🔌 **API:** https://tu-app.railway.app

---

## 🔧 Solución de Problemas

### ❌ Error: "Cannot connect to database"

**Solución:**
1. Ve a Railway → Tu servicio Node.js → Variables
2. Verifica que **NO** tengas estas variables:
   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
3. Si las tienes, ¡bórralas! Railway usa `DATABASE_URL` automáticamente

### ❌ Error: "CORS policy blocked"

**Solución:**
1. Verifica que `CORS_ORIGIN` en Railway sea EXACTAMENTE tu URL de Vercel
2. Sin `https://` extra, sin `/` al final
3. Ejemplo correcto: `https://la-grilla.vercel.app`
4. Ejemplo incorrecto: `https://https://la-grilla.vercel.app/`

### ❌ Frontend carga pero no muestra datos

**Solución:**
1. Ve a Vercel → Tu proyecto → Settings → Environment Variables
2. Verifica que `REACT_APP_API_URL` termine en `/api`
3. Ejemplo correcto: `https://la-grilla.railway.app/api`
4. Si lo cambias, debes **redeployar**:
   - Ve a Deployments → Click en el último → "Redeploy"

### ❌ Railway dice "Application failed to respond"

**Solución:**
1. Ve a Railway → PostgreSQL → Connect
2. Copia la URL de conexión
3. En tu terminal local:
```bash
psql TU_DATABASE_URL < database/schema.sql
```

### ❌ Página 404 en Vercel

**Solución:**
1. Ve a Vercel → Tu proyecto → Settings → General
2. Verifica que **Root Directory** sea `client`
3. Si no lo es, cámbialo y redeploya

---

## 🆓 Límites del Plan Gratuito

### Railway (Plan Gratis)
- ⏰ **500 horas/mes** de ejecución
- 🎯 Tu app: ~12-15 horas/día (suficiente para una quiniela entre amigos)
- 💾 **8 GB** de almacenamiento en PostgreSQL (miles de registros)
- ⚡ La app "duerme" después de inactividad y "despierta" en 10-20 seg

### Vercel (Plan Gratis)
- 🌐 **100 GB/mes** de bandwidth (más que suficiente)
- ⚡ **Siempre activo** (no duerme)
- 🚀 CDN global (carga rápido en todo el mundo)

**Conclusión:** Perfecto para una quiniela con 20-100 usuarios 👌

---

## 📱 Siguientes Pasos

### Agregar datos de ejemplo
```bash
railway run psql < database/sample-data.sql
```

### Actualizar tu app (cuando hagas cambios)
```bash
git add .
git commit -m "Descripción del cambio"
git push

# Railway y Vercel detectan el push y redesplegan automáticamente!
```

### Cambiar contraseña admin
1. Genera un nuevo hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('tu_nueva_password', 10))"
```
2. Ve a Railway → Variables → Edita `ADMIN_PASSWORD_HASH`

### Dominio personalizado (opcional)
- **Vercel:** Settings → Domains → Add tu-dominio.com
- **Railway:** Settings → Networking → Custom Domain

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa la sección de **Solución de Problemas** arriba
2. Verifica los **logs**:
   - Railway: Click en tu servicio → "View Logs"
   - Vercel: Deployments → Click en deployment → "Logs"
3. Revisa que **todas las URLs** estén correctas (sin typos)

---

¡Disfruta tu quiniela deportiva en la nube! ⚽🎉
