# 🌾 Sistema de Gestión Agropecuaria - Backend

Backend del sistema de gestión agropecuaria desarrollado con Node.js, Express, GraphQL y MongoDB.

## 🚀 Características

- **Autenticación JWT** con roles de usuario (admin/user)
- **Gestión de Productos** con control de stock y precios
- **Gestión de Clientes** con límites de crédito
- **Gestión de Proveedores** completa
- **Sistema de Ventas** con validaciones de stock y crédito
- **APIs externas** para precios de cereales y dólar
- **Validaciones robustas** y manejo de errores

## 📋 Requisitos

- Node.js 16+
- MongoDB 4.4+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd agrogestion/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo .env.example a .env
cp .env.example .env

# Editar las variables según tu configuración
nano .env
```

4. **Inicializar datos de prueba**
```bash
npm run init-data
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de Datos
MONGODB_URI=mongodb://localhost:27017/agrogestion

# JWT
JWT_SECRET=tu-secreto-jwt-super-seguro

# Servidor
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📊 Endpoints

### GraphQL
- **Endpoint**: `http://localhost:4000/graphql`
- **Playground**: Disponible en desarrollo

### REST APIs
- **Cereales**: `GET /api/cereales`
- **Dólar**: `GET /api/dolar`

## 👥 Usuarios por Defecto

Después de ejecutar `npm run init-data`:

- **Admin**: `admin@agro.com` / `admin123`
- **Usuario**: `usuario@agro.com` / `usuario123`

## 🗃️ Modelos de Datos

### User
- email, password, name, role, createdAt

### Product
- name, category, description, sku, stock, unit, price, supplier, minStock, location, active

### Client
- name, type, documentType, documentNumber, email, phone, address, businessInfo, creditLimit, paymentTerms, status

### Supplier
- name, contactInfo, businessInfo, paymentTerms, status

### Sale
- client, products, totalAmount, paymentMethod, status, notes, createdBy

## 🔐 Autenticación

El sistema usa JWT tokens. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 📝 Queries y Mutations Principales

### Queries
- `me` - Usuario actual
- `products` - Lista de productos
- `clients` - Lista de clientes
- `sales` - Lista de ventas
- `suppliers` - Lista de proveedores

### Mutations
- `login(email, password)` - Iniciar sesión
- `register(email, password, name)` - Registrarse
- `createProduct(...)` - Crear producto
- `createClient(...)` - Crear cliente
- `createSale(...)` - Crear venta
- `createSupplier(...)` - Crear proveedor

## 🛡️ Validaciones

- **Stock**: Verificación automática antes de ventas
- **Crédito**: Validación de límites de crédito
- **Productos activos**: Solo productos activos en ventas
- **Autenticación**: Todas las operaciones requieren autenticación

## 🚨 Manejo de Errores

- Errores detallados en desarrollo
- Errores genéricos en producción
- Logging estructurado
- Validaciones de entrada

## 🔄 Scripts Disponibles

- `npm start` - Iniciar en producción
- `npm run dev` - Iniciar en desarrollo con nodemon
- `npm run init-data` - Inicializar datos de prueba

## 📈 Monitoreo

El servidor incluye:
- Logs de conexión a MongoDB
- Logs de autenticación
- Logs de errores GraphQL
- Métricas de rendimiento

## 🚀 Despliegue

Para producción:

1. Configurar `NODE_ENV=production`
2. Usar un JWT_SECRET seguro
3. Configurar MongoDB Atlas o servidor dedicado
4. Configurar CORS para el dominio de producción
5. Usar PM2 o similar para gestión de procesos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
