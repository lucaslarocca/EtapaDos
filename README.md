# TP Ejemplo — Aplicaciones Interactivas UADE

Sistema de créditos y cobranzas con módulo de **Gestión de Mora**, desarrollado para la materia
**Aplicaciones Interactivas (3.4.082)** de la UADE.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 3.4.3 |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | H2 (en memoria) |
| Seguridad | Spring Security + JWT (jjwt 0.12.6) |
| Build | Maven |
| Frontend | React 18 + Vite 7 |
| Routing | React Router v7 |
| Estado global | Redux Toolkit + React-Redux |

---

## Módulo elegido: Gestión de Mora

Permite registrar créditos en mora, asignar gestores responsables y dar seguimiento al proceso de recuperación según su estado (`PENDIENTE` → `EN_GESTION` → `REGULARIZADA` / `INCOBRABLE`).

> Documentación completa del módulo: [README-MORA.md](README-MORA.md)

---

## Estructura del proyecto

```
tpejemplo/
├── backend/               → Proyecto Spring Boot (Maven)
│   └── src/main/java/com/uade/tpejemplo/
│       ├── config/        → SecurityConfig (JWT + stateless)
│       ├── controller/    → AuthController, ClienteController, CreditoController,
│       │                     CobranzaController, GestorController, MoraController
│       ├── dto/
│       │   ├── request/   → ClienteRequest, CreditoRequest, CobranzaRequest,
│       │   │                 GestorRequest, MoraRequest, AsignacionGestorRequest,
│       │   │                 ActualizarEstadoMoraRequest, LoginRequest, RegisterRequest
│       │   └── response/  → ClienteResponse, CreditoResponse, CuotaResponse,
│       │                     CobranzaResponse, GestorResponse, MoraResponse, AuthResponse
│       ├── exception/     → ResourceNotFoundException, BusinessException, GlobalExceptionHandler
│       ├── model/         → Cliente, Credito, Cuota, CuotaId, Cobranza, Gestor, Mora,
│       │                     EstadoMora, Usuario, Rol
│       ├── repository/    → ClienteRepository, CreditoRepository, CuotaRepository,
│       │                     CobranzaRepository, GestorRepository, MoraRepository, UsuarioRepository
│       ├── security/      → JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
│       └── service/
│           ├── ClienteService / ClienteServiceImpl
│           ├── CreditoService / CreditoServiceImpl
│           ├── CobranzaService / CobranzaServiceImpl
│           ├── GestorService / GestorServiceImpl
│           └── MoraService / MoraServiceImpl
└── frontend/              → Proyecto React + Vite
    └── src/
        ├── api/           → apiClient.js, auth.js, clientes.js, creditos.js,
        │                     cobranzas.js, gestores.js, moras.js
        ├── components/    → Navbar.jsx, PrivateRoute.jsx
        ├── pages/         → Login.jsx, Register.jsx, Clientes.jsx, Creditos.jsx,
        │   │                 Cobranzas.jsx, Gestores.jsx, Moras.jsx
        │   └── pages.css  → Estilos compartidos de todas las páginas
        └── store/
            ├── index.js                  → configureStore (combina reducers)
            └── slices/
                ├── authSlice.js          → login/register thunks + logout
                ├── clientesSlice.js      → fetchClientes + addCliente
                ├── creditosSlice.js      → fetchCreditosPorCliente + addCredito
                ├── cobranzasSlice.js     → fetchCobranzasPorCredito + addCobranza
                ├── gestoresSlice.js      → CRUD completo de gestores
                └── morasSlice.js         → fetch (todas/filtros), add, asignar gestor,
                                            cambiar estado, eliminar
```

---

## Modelo de datos

### Cliente
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dni | String (PK) | DNI del cliente |
| nombre | String | Nombre completo |

### Credito
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| cliente | FK → Cliente | Dueño del crédito |
| deudaOriginal | BigDecimal | Monto total del crédito |
| fecha | LocalDate | Fecha de otorgamiento |
| importeCuota | BigDecimal | Valor de cada cuota |
| cantidadCuotas | Integer | Número de cuotas |

### Cuota
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idCredito + idCuota | PK compuesta (@EmbeddedId) | Clave compuesta |
| credito | FK → Credito | Crédito al que pertenece |
| fechaVencimiento | LocalDate | Vencimiento mensual auto-generado |

> Al crear un crédito se generan automáticamente N cuotas con vencimiento mensual.

### Cobranza
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| cuota | FK → Cuota | Cuota que se está pagando |
| importe | BigDecimal | Importe cobrado |

### Gestor
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| nombre | String | Nombre completo del gestor |
| email | String (único) | Email de contacto |

### Mora
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| credito | FK → Credito | Crédito que entró en mora |
| gestor | FK → Gestor (opt) | Gestor asignado (null si está PENDIENTE) |
| fechaRegistro | LocalDate | Fecha de registro (automática) |
| motivo | String | Descripción del motivo |
| estado | EstadoMora | PENDIENTE / EN_GESTION / REGULARIZADA / INCOBRABLE |
| observaciones | String (opt) | Notas de seguimiento |

### Usuario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| username | String (unique) | Nombre de usuario |
| password | String (BCrypt) | Contraseña encriptada |
| rol | Enum (ADMIN/USER) | Rol del usuario |

---

## API REST

### Autenticación (pública)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario, devuelve token JWT |
| POST | `/api/auth/login` | Iniciar sesión, devuelve token JWT |

### Clientes (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/{dni}` | Buscar por DNI |

### Créditos (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/creditos` | Crear crédito (genera cuotas automáticamente) |
| GET | `/api/creditos/{id}` | Buscar por ID (incluye cuotas con estado pagada/pendiente) |
| GET | `/api/creditos/cliente/{dni}` | Créditos de un cliente |

### Cobranzas (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cobranzas` | Registrar pago de una cuota |
| GET | `/api/cobranzas/credito/{idCredito}` | Cobranzas de un crédito |

### Gestores (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/gestores` | Crear gestor |
| GET | `/api/gestores` | Listar todos |
| GET | `/api/gestores/{id}` | Buscar por ID |
| PUT | `/api/gestores/{id}` | Actualizar gestor |
| DELETE | `/api/gestores/{id}` | Eliminar gestor |

### Moras (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/moras` | Registrar mora (queda en PENDIENTE) |
| GET | `/api/moras` | Listar todas |
| GET | `/api/moras/{id}` | Buscar por ID |
| GET | `/api/moras/credito/{idCredito}` | Moras de un crédito |
| GET | `/api/moras/cliente/{dni}` | Moras de un cliente |
| GET | `/api/moras/estado/{estado}` | Reporte por estado |
| GET | `/api/moras/gestor/{idGestor}` | Moras asignadas a un gestor |
| PUT | `/api/moras/{id}/gestor` | Asignar gestor (pasa a EN_GESTION) |
| PUT | `/api/moras/{id}/estado` | Actualizar estado y observaciones |
| DELETE | `/api/moras/{id}` | Eliminar (solo si está en PENDIENTE) |

---

## Seguridad JWT

El flujo de autenticación es:

```
1. POST /api/auth/register  →  { token, username, rol }
2. POST /api/auth/login     →  { token, username, rol }
3. Resto de endpoints       →  Header: Authorization: Bearer <token>
```

- Token firmado con HMAC-SHA384
- Expiración: 24 horas
- Sesión stateless (sin HttpSession)
- Contraseñas encriptadas con BCrypt
- Respuesta 401 en el cliente limpia el token y redirige a `/login`

---

## Manejo de errores

Todos los errores devuelven un `ErrorResponse` uniforme:

```json
{
  "status": 400,
  "error": "Error de negocio",
  "mensajes": ["La cuota 1 del crédito 1 ya fue pagada"],
  "timestamp": "2026-03-03T14:00:00"
}
```

Excepciones manejadas por `@RestControllerAdvice`:
- `ResourceNotFoundException` → 404
- `BusinessException` → 400 (reglas de negocio)
- `MethodArgumentNotValidException` → 400 (validaciones `@Valid`)
- `Exception` genérica → 500

---

## Frontend React + Redux

### Redux store

El estado global está dividido en 6 slices:

| Slice | Estado | Acciones principales |
|-------|--------|----------------------|
| `auth` | `user`, `loading`, `error` | `loginThunk`, `registerThunk`, `logout` |
| `clientes` | `lista`, `loading`, `error` | `fetchClientes`, `addCliente` |
| `creditos` | `lista`, `loading`, `error` | `fetchCreditosPorCliente`, `addCredito`, `clearCreditos` |
| `cobranzas` | `lista`, `loading`, `error` | `fetchCobranzasPorCredito`, `addCobranza`, `clearCobranzas` |
| `gestores` | `lista`, `loading`, `error` | `fetchGestores`, `addGestor`, `updateGestor`, `removeGestor` |
| `moras` | `lista`, `loading`, `error` | `fetchMoras`, filtros por crédito/cliente/estado/gestor, `addMora`, `asignarGestorMora`, `cambiarEstadoMora`, `removeMora` |

Cada operación asíncrona usa `createAsyncThunk`, manejando los estados `pending / fulfilled / rejected` con `rejectWithValue`.

### Otros conceptos del frontend

- **PrivateRoute** redirige a `/login` si `state.auth.user` es null
- **Navbar** despacha `logout()` y limpia `localStorage`
- **apiClient.js** centraliza todas las llamadas fetch: agrega el header `Authorization: Bearer <token>` y maneja el código 401 limpiando la sesión y redirigiendo al login
- **pages.css** centraliza los estilos de todas las páginas; los componentes usan `className` en lugar de estilos inline
- El proxy de Vite redirige `/api/*` → `localhost:8080` (evita CORS en desarrollo)

### Páginas
| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/login` | Login.jsx | Público |
| `/register` | Register.jsx | Público |
| `/clientes` | Clientes.jsx | Privado |
| `/creditos` | Creditos.jsx | Privado |
| `/cobranzas` | Cobranzas.jsx | Privado |
| `/gestores` | Gestores.jsx | Privado |
| `/moras` | Moras.jsx | Privado |

---

## Cómo correr el proyecto

### Backend
```bash
cd backend
mvn spring-boot:run
# Corre en http://localhost:8080
# Consola H2: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

## Temas de la materia cubiertos

| Unidad | Tema | Implementado en |
|--------|------|----------------|
| I | Spring Boot, arquitectura, estructura de proyectos | Toda la capa backend |
| II | Hibernate/JPA, entidades, repositorios | `model/`, `repository/` |
| II | Seguridad con JWT | `security/`, `config/SecurityConfig` |
| III | React + Vite, componentes, props | `pages/`, `components/` |
| III | React Hooks (`useState`, `useEffect`) | Todas las páginas |
| III | React Router | `App.jsx`, `PrivateRoute` |
| IV | Fetch, consumo de API | `api/` |
| IV | Renderizado condicional | Estados de carga y error en cada página |
| V | Redux I y II: acciones, reducers, store, thunks | `store/slices/`, `store/index.js` |
