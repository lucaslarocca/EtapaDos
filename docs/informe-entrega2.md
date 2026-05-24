# Informe de Cumplimiento — Entrega 2 (Frontend React)

**Fecha de revisión:** 2026-05-24  
**Fecha límite de entrega:** 26 de mayo de 2026  
**Módulo elegido:** Gestión de Mora

---

## Requisitos de la Entrega 2

La consigna pide desarrollar una interfaz en React que permita:

- ✅ Visualizar información del módulo
- ✅ Crear registros
- ❌ Modificar registros
- ❌ Eliminar registros

Requisitos técnicos:

- ✅ React
- ✅ React Router
- ✅ Llamadas HTTP mediante fetch o axios
- ✅ Manejo de errores básicos
- ⚠️ Manejo de estados de carga (parcial — ver detalle)

---

## Estado General

| Aspecto | Estado |
|---------|--------|
| Frontend funcional con React | ✅ Cumple |
| React Router configurado | ✅ Cumple |
| Conexión con backend vía API REST | ✅ Cumple |
| CRUD completo del módulo elegido (Mora) | ❌ **No cumple** |
| Páginas del módulo Mora en el frontend | ❌ **No existen** |
| Operaciones de Update y Delete | ❌ **No implementadas en ninguna página** |

---

## Detalle por Componente

### Páginas existentes

| Página | CREATE | READ | UPDATE | DELETE |
|--------|:------:|:----:|:------:|:------:|
| `Clientes.jsx` | ✅ | ✅ | ❌ | ❌ |
| `Creditos.jsx` | ✅ | ✅ | ❌ | ❌ |
| `Cobranzas.jsx` | ✅ | ✅ | ❌ | ❌ |

### Páginas faltantes (módulo Mora)

| Página | Estado |
|--------|--------|
| `Gestores.jsx` | ❌ No existe |
| `Moras.jsx` | ❌ No existe |

> **Problema crítico:** El grupo eligió el módulo "Gestión de Mora", pero el frontend no tiene ninguna página, API client, ni slice de Redux para Gestores ni Moras. El backend sí los implementa completamente.

---

### Capa API (`frontend/src/api/`)

| Archivo | Existe | Métodos |
|---------|:------:|---------|
| `apiClient.js` | ✅ | `get`, `post`, `put`, `delete` (wrapper centralizado con JWT) |
| `auth.js` | ✅ | `login`, `register` |
| `clientes.js` | ✅ | `getAll`, `create` |
| `creditos.js` | ✅ | `getByCliente`, `create` |
| `cobranzas.js` | ✅ | `getByCredito`, `create` |
| `moras.js` | ❌ | — |
| `gestores.js` | ❌ | — |

> Nota: `apiClient.js` ya tiene los métodos `put()` y `delete()` definidos pero no se usan en ningún módulo.

---

### Redux Slices (`frontend/src/store/slices/`)

| Slice | Existe | Thunks async | Estados pending/fulfilled/rejected |
|-------|:------:|:------------:|:----------------------------------:|
| `authSlice.js` | ✅ | `loginThunk`, `registerThunk` | ✅ |
| `clientesSlice.js` | ✅ | `fetchClientes`, `addCliente` | ✅ |
| `creditosSlice.js` | ✅ | `fetchCreditosPorCliente`, `addCredito` | ✅ |
| `cobranzasSlice.js` | ✅ | `fetchCobranzasPorCredito`, `addCobranza` | ✅ |
| `morasSlice.js` | ❌ | — | — |
| `gestoresSlice.js` | ❌ | — | — |

---

### Componentes compartidos

| Componente | Estado | Observaciones |
|------------|:------:|---------------|
| `Navbar.jsx` | ✅ | Links a Clientes, Créditos, Cobranzas. Falta link a Gestores y Moras |
| `PrivateRoute.jsx` | ✅ | Protege rutas verificando `state.auth.user` |

---

### Rutas (`App.jsx`)

| Ruta | Componente | Protegida |
|------|-----------|:---------:|
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/clientes` | `Clientes` | ✅ |
| `/creditos` | `Creditos` | ✅ |
| `/cobranzas` | `Cobranzas` | ✅ |
| `/gestores` | — | ❌ No existe |
| `/moras` | — | ❌ No existe |

---

## Entregables de la Entrega 2

| Entregable | Estado |
|------------|--------|
| Repositorio actualizado | ✅ |
| Video corto (máx. 5 min) mostrando login, frontend e integración | ⚠️ No verificado |

---

## Lo que funciona bien

1. **Arquitectura frontend sólida:** `apiClient.js` centralizado con inyección de JWT, manejo de errores uniforme.
2. **Redux Toolkit bien implementado:** Todos los slices usan `createAsyncThunk` con los tres estados (`pending`, `fulfilled`, `rejected`).
3. **Manejo de errores:** Los errores del backend se parsean y se muestran al usuario con estilo consistente.
4. **Estados de carga:** Botones deshabilitados y texto "Cargando..." / "Guardando..." durante operaciones async.
5. **Persistencia de sesión:** Token JWT guardado en `localStorage`, sesión se mantiene tras refresh.
6. **Proxy de desarrollo:** Vite configurado para proxear `/api` a `localhost:8080`.

---

## Problemas Críticos

### 1. Módulo Mora sin frontend
El módulo elegido por el grupo no tiene representación en el frontend. No hay páginas, API clients, ni slices para Gestores ni Moras. Esto es un incumplimiento directo de la consigna.

### 2. No hay operaciones de Update ni Delete
Ninguna de las páginas existentes permite modificar ni eliminar registros. La consigna pide explícitamente las cuatro operaciones CRUD. El `apiClient.js` tiene los métodos `put()` y `delete()` pero no se utilizan.

---

## Acciones Necesarias para Cumplir

### Prioridad Alta (bloqueante)

1. **Crear `frontend/src/api/gestores.js`** — Funciones para todos los endpoints de gestores (`getAll`, `getById`, `create`, `update`, `delete`).
2. **Crear `frontend/src/api/moras.js`** — Funciones para todos los endpoints de moras (`getAll`, `getByCredito`, `getByCliente`, `getByEstado`, `getByGestor`, `create`, `asignarGestor`, `actualizarEstado`, `delete`).
3. **Crear `frontend/src/store/slices/gestoresSlice.js`** — Slice con thunks async para CRUD de gestores.
4. **Crear `frontend/src/store/slices/morasSlice.js`** — Slice con thunks async para operaciones de moras.
5. **Crear `frontend/src/pages/Gestores.jsx`** — Página con CRUD completo (listar, crear, editar, eliminar).
6. **Crear `frontend/src/pages/Moras.jsx`** — Página con operaciones completas (registrar mora, buscar por crédito/cliente/estado/gestor, asignar gestor, cambiar estado, eliminar).
7. **Agregar rutas** en `App.jsx` para `/gestores` y `/moras`.
8. **Agregar links** en `Navbar.jsx` para Gestores y Moras.

### Prioridad Media (recomendado)

9. **Agregar botones de Editar y Eliminar** en `Clientes.jsx`, `Creditos.jsx` y `Cobranzas.jsx`.
10. **Registrar los nuevos slices** en `store/index.js`.

---

## Resumen

| Categoría | Puntaje estimado |
|-----------|:----------------:|
| Frontend con React | ⚠️ Parcial — falta el módulo elegido |
| Conexión frontend-backend | ⚠️ Parcial — solo 3 de 5 entidades |
| CRUD completo | ❌ No cumple — falta Update y Delete |
| Manejo de errores | ✅ Cumple |
| Estados de carga | ✅ Cumple |
| React Router | ✅ Cumple |

**Veredicto:** El frontend tiene buena base técnica pero **no cumple con la Entrega 2** porque falta la interfaz del módulo elegido (Gestión de Mora) y no se implementaron las operaciones de modificar y eliminar registros.
