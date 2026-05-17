# La Grilla - Sistema de Quiniela Deportiva ⚽

Una plataforma web completa para gestionar y participar en quinielas de fútbol (pools de predicción). Sistema sin cuentas de usuario que funciona con IDs únicos y validación manual de pagos.

## 🎯 Características Principales

### Para Participantes (Público)
- ✅ Ver jornadas y partidos programados
- ✅ Registrar predicciones (Local/Empate/Visitante)
- ✅ Generación automática de ID único (12 caracteres)
- ✅ Verificación CAPTCHA anti-spam
- ✅ Consulta de estado de pago por ID
- ✅ Tablero en vivo con predicciones y aciertos
- ✅ Clasificación general acumulada del torneo

### Para Administradores
- ✅ Panel de control seguro (autenticación Basic Auth)
- ✅ Crear y gestionar jornadas
- ✅ Agregar partidos con equipos y horarios
- ✅ Validar pagos manualmente
- ✅ Capturar resultados finales
- ✅ Recálculo automático de puntos
- ✅ Limpieza de entradas pendientes

## 🏗️ Arquitectura Técnica

### Backend
- **Framework**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **Seguridad**: Helmet, CORS, Rate Limiting
- **IDs Únicos**: NanoID (formato: XXXX-XXXX-XXXX)
- **Autenticación Admin**: Basic Auth con bcrypt

### Frontend
- **Framework**: React 18
- **Enrutamiento**: React Router v6
- **HTTP Client**: Axios
- **Diseño**: CSS personalizado con tema de estadio
- **Responsive**: Mobile-first design

### Diseño Visual
- **Estética**: Inspirado en estadios deportivos con efectos de iluminación
- **Tipografía**: Teko (display) y Rajdhani (body)
- **Colores**: Verde césped, dorado floodlight, rojo scoreboard
- **Animaciones**: Luces parpadeantes, efectos de brillo, transiciones suaves

## 📋 Requisitos Previos

- Node.js 16+ y npm
- PostgreSQL 12+
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd la-grilla
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb la_grilla

# Importar esquema
psql la_grilla < database/schema.sql
```

### 3. Configurar Backend

```bash
cd server

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Archivo `.env` ejemplo:**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=la_grilla
DB_USER=postgres
DB_PASSWORD=tu_password

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
```

**Generar hash de contraseña para admin:**
```bash
node -e "console.log(require('bcryptjs').hashSync('tu_password', 10))"
```

### 4. Configurar Frontend

```bash
cd ../client

# Instalar dependencias
npm install

# Crear archivo de entorno (opcional)
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
```

### 5. Iniciar la Aplicación

**Terminal 1 - Backend:**
```bash
cd server
npm start
# O para desarrollo con auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📊 Estructura de Base de Datos

### Tablas Principales

**matchdays** - Jornadas del torneo
- `id` (SERIAL PK)
- `name` (VARCHAR) - Ej: "Jornada 1"
- `start_date` (TIMESTAMP)
- `status` (VARCHAR) - Active/In_Progress/Finished

**matches** - Partidos de cada jornada
- `id` (SERIAL PK)
- `matchday_id` (FK → matchdays)
- `home_team`, `away_team` (VARCHAR)
- `home_goals`, `away_goals` (INTEGER)
- `final_result` (CHAR) - H/D/A
- `match_date` (TIMESTAMP)

**pools** - Entradas de quiniela
- `unique_id` (VARCHAR 14, PK) - Formato: XXXX-XXXX-XXXX
- `user_name` (VARCHAR) - Alias del participante
- `payment_status` (VARCHAR) - Pending/Paid
- `matchday_id` (FK → matchdays)

**predictions** - Predicciones individuales
- `id` (SERIAL PK)
- `pool_id` (FK → pools)
- `match_id` (FK → matches)
- `predicted_value` (CHAR) - H/D/A
- `points_earned` (INTEGER) - 0 o 1

### Vistas

**overall_standings** - Clasificación general
- Suma puntos de todas las jornadas
- Solo incluye entradas con pago confirmado

**matchday_leaderboard** - Tabla por jornada
- Puntos por jornada específica
- Ordenado por puntuación descendente

## 🔐 Seguridad

### Implementado
- ✅ CAPTCHA en formulario de registro (backend)
- ✅ Validación de datos en servidor
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Autenticación Basic Auth para admin
- ✅ Transacciones de BD para integridad

### Recomendaciones para Producción
- [ ] Usar reCAPTCHA v2 o Cloudflare Turnstile real
- [ ] Implementar HTTPS con certificados SSL
- [ ] Configurar firewall de BD
- [ ] Usar variables de entorno seguras
- [ ] Implementar logging y monitoreo
- [ ] Backups automáticos de BD
- [ ] Cambiar credenciales admin por defecto

## 📱 API Endpoints

### Públicos (sin autenticación)

```
GET  /api/public/matchday/current
     → Obtener jornada activa actual

POST /api/public/pool/create
     → Crear entrada de quiniela
     Body: { userName, predictions[], matchdayId, captchaToken }

GET  /api/public/pool/status/:id
     → Verificar estado de pago

GET  /api/public/matchday/:id/board
     → Tablero de jornada (solo pagados)

GET  /api/public/standings/overall
     → Clasificación general del torneo
```

### Admin (requiere autenticación)

```
POST /api/admin/matchday/create
     → Crear nueva jornada

POST /api/admin/match/create
     → Agregar partido a jornada

GET  /api/admin/pools/pending
     → Listar pagos pendientes

PUT  /api/admin/pool/:id/mark-paid
     → Marcar pago como confirmado

DELETE /api/admin/matchday/:id/cleanup-pending
       → Eliminar entradas pendientes

PUT  /api/admin/match/:id/result
     → Capturar resultado y recalcular puntos
     Body: { homeGoals, awayGoals }
```

## 🎮 Flujo de Usuario

### Participante
1. Visita la página principal y ve la jornada activa
2. Hace clic en "Participar"
3. Ingresa su nombre/alias
4. Selecciona predicción para cada partido (H/D/A)
5. Completa CAPTCHA
6. Recibe ID único (XXXX-XXXX-XXXX)
7. Realiza pago y envía comprobante + ID
8. Administrador valida el pago
9. El participante aparece en el tablero oficial

### Administrador
1. Accede a /admin con credenciales
2. Crea jornada con nombre y fecha
3. Agrega partidos (equipos, fecha/hora)
4. La jornada se abre automáticamente
5. Revisa pagos pendientes
6. Marca IDs como "Pagados" tras verificar
7. Cuando terminan los partidos, captura resultados
8. El sistema calcula puntos automáticamente

## 🎨 Personalización

### Cambiar Colores
Edita `/client/src/styles/App.css`:
```css
:root {
  --pitch-green: #0d3b1a;      /* Color de fondo principal */
  --floodlight: #ffd700;        /* Color de acentos/títulos */
  --scoreboard-red: #e63946;    /* Botones primarios */
  --scoreboard-green: #06d6a0;  /* Confirmaciones */
}
```

### Cambiar Fuentes
Modifica las importaciones en `App.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=TuFuenteDisplay&family=TuFuenteBody');
```

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar conexión a BD
psql -U postgres -d la_grilla -c "SELECT 1;"

# Revisar logs del servidor
cd server && npm start
```

### Error de CORS
Asegúrate de que `CORS_ORIGIN` en `.env` coincida con la URL del frontend.

### Predicciones no se guardan
Verifica que:
1. El CAPTCHA esté completo
2. Todos los partidos tengan predicción
3. La jornada no haya iniciado (lock automático)

## 📄 Licencia

Este proyecto fue creado para [Tu Organización/Nombre]. 

## 🤝 Contribuciones

Para contribuir:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para preguntas o reportar problemas:
- Email: soporte@lagrilla.com
- Issues: GitHub Issues

---

**Hecho con ⚽ y 💻 para los amantes del fútbol**
