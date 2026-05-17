#!/bin/bash

echo "=================================="
echo "  LA GRILLA - Quick Setup Script"
echo "=================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado. Por favor instálalo primero."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

echo "✅ PostgreSQL y Node.js detectados"
echo ""

# Database setup
echo "📊 Configurando base de datos..."
read -p "Nombre de la base de datos (por defecto: la_grilla): " DB_NAME
DB_NAME=${DB_NAME:-la_grilla}

read -p "Usuario de PostgreSQL (por defecto: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Contraseña de PostgreSQL: " DB_PASSWORD
echo ""

# Create database
echo "Creando base de datos..."
PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada"
else
    echo "⚠️  Base de datos ya existe o error al crear"
fi

# Import schema
echo "Importando esquema..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f database/schema.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Esquema importado"
else
    echo "❌ Error al importar esquema"
    exit 1
fi

# Ask about sample data
read -p "¿Deseas importar datos de ejemplo? (s/n): " IMPORT_SAMPLE
if [ "$IMPORT_SAMPLE" = "s" ] || [ "$IMPORT_SAMPLE" = "S" ]; then
    echo "Importando datos de ejemplo..."
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f database/sample-data.sql > /dev/null 2>&1
    echo "✅ Datos de ejemplo importados"
fi

echo ""

# Backend setup
echo "⚙️  Configurando backend..."
cd server

if [ ! -f ".env" ]; then
    cp .env.example .env
    
    # Update .env with user's database credentials
    sed -i.bak "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
    sed -i.bak "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    rm .env.bak 2>/dev/null
    
    echo "✅ Archivo .env creado y configurado"
else
    echo "⚠️  .env ya existe, no se sobrescribirá"
fi

echo "Instalando dependencias del servidor..."
npm install > /dev/null 2>&1
echo "✅ Dependencias del servidor instaladas"

cd ..

# Frontend setup
echo ""
echo "🎨 Configurando frontend..."
cd client

echo "Instalando dependencias del cliente..."
npm install > /dev/null 2>&1
echo "✅ Dependencias del cliente instaladas"

cd ..

echo ""
echo "=================================="
echo "  ✅ ¡Configuración Completa!"
echo "=================================="
echo ""
echo "Para iniciar la aplicación:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server && npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd client && npm start"
echo ""
echo "Credenciales de admin:"
echo "  Usuario: admin"
echo "  Contraseña: admin123"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo ""
echo "¡Listo para jugar! ⚽"
