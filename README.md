# Sistema de Pagos - Prueba Técnica Frontend

## Descripción del Proyecto

Sistema web desarrollado en Angular 17 para la gestión de pagos empresariales, con funcionalidades completas de CRUD, filtrado avanzado, control de accesos y exportación de datos. Implementa una arquitectura moderna con componentes standalone, PrimeNG para UI y TailwindCSS para estilos.

## Tecnologías Utilizadas

### Frontend
- **Angular 17** - Framework principal
- **TypeScript** - Tipado estático y desarrollo robusto
- **RxJS** - Programación reactiva y manejo de estado
- **PrimeNG 17** - Componentes UI profesionales
- **TailwindCSS 3.x** - Framework de utilidades CSS

### Backend & Herramientas
- **JSON Server** - Mock API para desarrollo
- **Angular CLI** - Herramientas de desarrollo
- **Node.js 18+** - Runtime de JavaScript
- **npm** - Gestor de paquetes

## Instalación y Configuración

### Prerrequisitos
- **Node.js 18+** 
- **npm 9+**
- **Angular CLI 17+**

### Instalación

#### 1. Instalar JSON Server
```bash
npm install -D json-server
```

#### 2. Configurar scripts en package.json
```json
{
  "scripts": {
    "start": "ng serve",
    "json-server": "json-server --watch db.json --port 3001",
    "build": "ng build",
    "test": "ng test"
  }
}
```

#### 3. Iniciar la aplicación

**IMPORTANTE**: Es necesario ejecutar JSON Server ANTES que Angular para que la aplicación funcione correctamente.

```bash
# Terminal 1: Iniciar JSON Server (PRIMERO)
npm run json-server

# Terminal 2: Iniciar Angular (DESPUÉS)
npm start
```

#### 4. Acceder a la aplicación
- **Frontend**: http://localhost:4200
- **API**: http://localhost:3001

**Nota**: Si no se ejecuta JSON Server primero, la aplicación mostrará errores de conexión y no cargará los datos correctamente.

## Arquitectura del Proyecto

```
src/
├── app/
│   ├── layout/                 # Componentes de layout
│   │   ├── layout.component.*
│   │   ├── menu-bar/           # Barra de navegación
│   │   └── footer/             # Pie de página
│   ├── pagos/                  # Módulo principal
│   │   ├── models/             # Interfaces y tipos
│   │   │   └── pago.model.ts
│   │   ├── services/           # Servicios de negocio
│   │   │   ├── pagos.service.ts
│   │   │   └── access.service.ts
│   │   ├── pages/              # Páginas principales
│   │   │   ├── pagos-list/     # Lista de pagos
│   │   │   └── pago-form/      # Formulario de pagos
│   │   └── pagos.router.ts     # Rutas del módulo
│   └── app.module.ts           # Módulo principal
├── assets/                     # Recursos estáticos
└── styles.css                 # Estilos globales
```

## Control de Accesos

### Roles Implementados
- **ADMIN**: Acceso completo (crear, editar, eliminar, ver)
- **EDITOR**: Crear y editar pagos
- **VIEWER**: Solo lectura

## Limitaciones Conocidas

### Técnicas
- **Backend**: Solo JSON Server (desarrollo)
- **Autenticación**: Mock de usuarios
