# SarriaTech E-Learning Platform

Plataforma E-Learning completa, similar a Udemy o Platzi, construida con React, Node.js, Express, Prisma, y MySQL.

## Requisitos Previos

- Node.js 18+
- MySQL 8.0 (Local o vía Docker)
- Docker y Docker Compose (Opcional, pero recomendado)

## Configuración y Despliegue de la Base de Datos

1. Iniciar MySQL con Docker Compose (asegúrate de tener Docker instalado):
   ```bash
   docker-compose up -d
   ```
   *Nota: Si no usas Docker, instala MySQL 8 localmente, crea una base de datos llamada `sarriatech_produccion` y asegúrate de que las credenciales sean `root` / `root`.*

## Backend (API REST)

1. Abrir una terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Instalar las dependencias (si no se instalaron automáticamente):
   ```bash
   npm install
   ```

3. Ejecutar las migraciones de Prisma para crear las tablas en MySQL:
   ```bash
   npm run migrate:dev
   ```

4. Generar el cliente de Prisma:
   ```bash
   npm run generate
   ```

5. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

La API estará disponible en `http://localhost:3000`.

### Autenticación con Google

Para habilitar el login y registro con Google, agrega estas variables de entorno:

```bash
# backend/.env
GOOGLE_CLIENT_ID="tu-client-id-de-google"

# frontend/.env.local
VITE_GOOGLE_CLIENT_ID="tu-client-id-de-google"
```

Luego crea las credenciales OAuth 2.0 en Google Cloud Console y autoriza el origen del frontend, por ejemplo `http://localhost:5173`.

## Documentación API

La documentación en Swagger estará disponible en `http://localhost:3000/api-docs` una vez que el servidor backend esté corriendo y se haya implementado por completo.

## Frontend (React)

(Próximamente: El frontend será implementado en el siguiente paso con Vite, React 19, Tailwind y Zustand).
