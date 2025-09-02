# 🌾 Sistema de Gestión Agropecuaria - Frontend

Frontend del sistema de gestión agropecuaria desarrollado con React, Material-UI, Apollo Client y GraphQL.

## 🚀 Características

- **Dashboard Interactivo** con métricas en tiempo real
- **Gestión de Ventas** con validaciones de stock y crédito
- **Gestión de Inventario** con control de stock y alertas
- **Gestión de Clientes** con información completa
- **Gestión de Proveedores** con datos empresariales
- **Diseño Responsivo** optimizado para móviles y desktop
- **Exportación de Datos** a Excel y PDF
- **Autenticación JWT** con roles de usuario
- **Interfaz Moderna** con Material-UI y animaciones

## 📋 Requisitos

- Node.js 16+
- npm o yarn
- Backend del sistema corriendo en puerto 4000

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd agrogestion/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm start
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **Material-UI 5** - Componentes de interfaz
- **Apollo Client** - Cliente GraphQL
- **React Router** - Navegación
- **Recharts** - Gráficos y visualizaciones
- **jsPDF** - Generación de PDFs
- **XLSX** - Exportación a Excel

## 📱 Páginas del Sistema

### 🏠 Dashboard
- Métricas principales del negocio
- Gráficos de ventas por producto y categoría
- Alertas de stock bajo
- Cotizaciones de cereales en tiempo real
- Estado del sistema

### 🛒 Ventas
- Creación de nuevas ventas
- Selección de productos con validación de stock
- Gestión de estados de venta
- Exportación de reportes
- Filtros y búsqueda avanzada

### 📦 Inventario
- Gestión completa de productos
- Control de stock y alertas
- Categorización de productos
- Precios y monedas
- Ubicación en almacén

### 👥 Clientes
- Registro de clientes individuales y empresas
- Información de contacto completa
- Límites de crédito
- Términos de pago
- Historial de ventas

### 🏢 Proveedores
- Gestión de proveedores
- Información empresarial
- Términos de pago
- Contacto y dirección
- Estado de relación

## 🔐 Autenticación

El sistema utiliza JWT tokens para la autenticación:

- **Login**: `admin@agro.com` / `admin123`
- **Usuario**: `usuario@agro.com` / `usuario123`

## 🎯 Funcionalidades Principales

### Dashboard Inteligente
- Métricas en tiempo real
- Gráficos interactivos
- Alertas automáticas
- Estado del sistema

### Gestión de Ventas
- Validación de stock automática
- Cálculo de totales
- Múltiples métodos de pago
- Estados de venta

### Control de Inventario
- Alertas de stock bajo
- Categorización de productos
- Precios dinámicos
- Ubicación en almacén

### Exportación de Datos
- Reportes en Excel
- Documentos PDF
- Filtros personalizables
- Datos actualizados

## 🎨 Diseño y UX

### Características Visuales
- **Tema Agropecuario** con colores verdes y azules
- **Gradientes Modernos** en headers y botones
- **Iconos Temáticos** relacionados con agricultura
- **Animaciones Suaves** en hover y transiciones
- **Responsive Design** para todos los dispositivos

### Componentes Personalizados
- **SummaryCard** con efectos hover
- **Layout Moderno** con sidebar animado
- **Formularios Intuitivos** con validación
- **Tablas Avanzadas** con filtros y paginación

## 🔧 Configuración

### Variables de Entorno
```env
REACT_APP_API_URL=http://localhost:4000/graphql
REACT_APP_APP_NAME=AgroGestión
```

### Apollo Client
Configurado para:
- Autenticación automática con JWT
- Cache inteligente
- Manejo de errores
- Reconexión automática

## 📊 Gráficos y Visualizaciones

### Recharts Integration
- **PieChart** para distribución de ventas
- **BarChart** para ventas por categoría
- **LineChart** para tendencias temporales
- **ResponsiveContainer** para adaptabilidad

### Métricas en Tiempo Real
- Total de ventas
- Productos en inventario
- Clientes activos
- Cotizaciones de cereales

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
```

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

### Breakpoints Material-UI
- `xs`: 0px
- `sm`: 600px
- `md`: 900px
- `lg`: 1200px
- `xl`: 1536px

## 🎯 Mejores Prácticas

### Código
- Componentes funcionales con hooks
- Custom hooks para lógica reutilizable
- PropTypes para validación de tipos
- Código limpio y documentado

### Performance
- Lazy loading de componentes
- Memoización con React.memo
- Optimización de re-renders
- Bundle splitting

### UX/UI
- Feedback visual inmediato
- Estados de carga
- Mensajes de error claros
- Navegación intuitiva

## 🔄 Integración con Backend

### GraphQL Queries
- Queries optimizadas
- Mutations con validación
- Subscriptions para tiempo real
- Error handling robusto

### Autenticación
- JWT tokens automáticos
- Refresh automático
- Logout seguro
- Roles y permisos

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Variables de Entorno de Producción
```env
REACT_APP_API_URL=https://api.agrogestion.com/graphql
REACT_APP_APP_NAME=AgroGestión Pro
```

### Servidor Web
- Nginx recomendado
- Configuración de SPA
- Compresión gzip
- Cache headers

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico o consultas:
- Email: soporte@agrogestion.com
- Documentación: [docs.agrogestion.com](https://docs.agrogestion.com)
- Issues: [GitHub Issues](https://github.com/agrogestion/issues)

---

**🌾 Desarrollado con ❤️ para el sector agropecuario argentino**
