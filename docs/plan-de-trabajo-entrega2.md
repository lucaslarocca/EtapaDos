# Plan de Trabajo — Completar Entrega 2

**Fecha:** 2026-05-24  
**Objetivo:** Que el frontend cumpla todos los requisitos de la Entrega 2 del TPO.

---

## Contexto: ¿Qué pide la Entrega 2?

La consigna dice textualmente:

> Desarrollar una interfaz en React que permita:
> - **visualizar** información del módulo
> - **crear** registros
> - **modificar** registros
> - **eliminar** registros

Nuestro módulo es **Gestión de Mora**. Eso significa que el frontend debe tener páginas para manejar **Gestores** y **Moras**, además de las páginas base (Clientes, Créditos, Cobranzas).

---

## ¿Qué tenemos hoy?

### Lo que ya funciona

| Capa | Archivo | ¿Qué hace? |
|------|---------|-------------|
| API client | `api/apiClient.js` | Wrapper centralizado de `fetch` con JWT. Ya tiene `get`, `post`, `put`, `delete` |
| API client | `api/auth.js` | Funciones `login` y `register` |
| API client | `api/clientes.js` | `getClientes`, `getCliente`, `crearCliente` |
| API client | `api/creditos.js` | `getCreditosPorCliente`, `getCredito`, `crearCredito` |
| API client | `api/cobranzas.js` | `getCobranzasPorCredito`, `registrarCobranza` |
| Redux | `slices/authSlice.js` | Login, logout, register con `createAsyncThunk` |
| Redux | `slices/clientesSlice.js` | Fetch y add clientes |
| Redux | `slices/creditosSlice.js` | Fetch y add créditos |
| Redux | `slices/cobranzasSlice.js` | Fetch y add cobranzas |
| Página | `pages/Clientes.jsx` | Lista clientes + formulario para crear |
| Página | `pages/Creditos.jsx` | Buscar créditos por DNI + crear crédito |
| Página | `pages/Cobranzas.jsx` | Buscar cobranzas por crédito + registrar pago |
| Componente | `components/Navbar.jsx` | Links a Clientes, Créditos, Cobranzas + logout |
| Componente | `components/PrivateRoute.jsx` | Protege rutas si no hay usuario logueado |
| Rutas | `App.jsx` | Rutas para login, register, clientes, créditos, cobranzas |

### Lo que falta

1. **No hay páginas para el módulo Mora** (Gestores ni Moras)
2. **No hay operaciones de editar ni eliminar** en ninguna página
3. **No hay API clients ni slices** para Gestores ni Moras

---

## Plan paso a paso

Vamos a trabajar en un orden lógico: primero las capas más bajas (API), luego el estado (Redux), y por último la interfaz (páginas). Así cada paso se apoya en el anterior.

---

### Paso 1 — API Client para Gestores

**Archivo a crear:** `frontend/src/api/gestores.js`

**¿Qué es esto?** Es el archivo que tiene las funciones JavaScript para hablar con el backend. Cada función llama a un endpoint REST del `GestorController.java` que ya existe.

**Endpoints del backend que vamos a consumir:**

| Método HTTP | URL | ¿Para qué? | Función JS |
|:-----------:|-----|-------------|------------|
| `GET` | `/api/gestores` | Traer todos los gestores | `getGestores()` |
| `GET` | `/api/gestores/{id}` | Traer un gestor por ID | `getGestor(id)` |
| `POST` | `/api/gestores` | Crear un gestor nuevo | `crearGestor(data)` |
| `PUT` | `/api/gestores/{id}` | Modificar nombre/email | `actualizarGestor(id, data)` |
| `DELETE` | `/api/gestores/{id}` | Eliminar un gestor | `eliminarGestor(id)` |

**¿Qué recibe el backend al crear/editar?** Un JSON con esta forma (viene de `GestorRequest.java`):
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com"
}
```

**¿Qué devuelve?** Un JSON así (viene de `GestorResponse.java`):
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@email.com"
}
```

---

### Paso 2 — API Client para Moras

**Archivo a crear:** `frontend/src/api/moras.js`

**Endpoints del backend que vamos a consumir:**

| Método HTTP | URL | ¿Para qué? | Función JS |
|:-----------:|-----|-------------|------------|
| `GET` | `/api/moras` | Listar todas las moras | `getMoras()` |
| `GET` | `/api/moras/{id}` | Traer una mora por ID | `getMora(id)` |
| `GET` | `/api/moras/credito/{idCredito}` | Moras de un crédito | `getMorasPorCredito(idCredito)` |
| `GET` | `/api/moras/cliente/{dni}` | Moras de un cliente | `getMorasPorCliente(dni)` |
| `GET` | `/api/moras/estado/{estado}` | Filtrar por estado | `getMorasPorEstado(estado)` |
| `GET` | `/api/moras/gestor/{idGestor}` | Moras asignadas a un gestor | `getMorasPorGestor(idGestor)` |
| `POST` | `/api/moras` | Registrar mora nueva | `crearMora(data)` |
| `PUT` | `/api/moras/{id}/gestor` | Asignar gestor a una mora | `asignarGestor(id, data)` |
| `PUT` | `/api/moras/{id}/estado` | Cambiar estado y observaciones | `actualizarEstadoMora(id, data)` |
| `DELETE` | `/api/moras/{id}` | Eliminar mora (solo si PENDIENTE) | `eliminarMora(id)` |

**¿Qué recibe el backend al crear una mora?** (`MoraRequest.java`):
```json
{
  "idCredito": 5,
  "motivo": "Cuotas impagas por más de 90 días",
  "observaciones": "Cliente no responde llamadas"
}
```

**¿Qué recibe al asignar gestor?** (`AsignacionGestorRequest.java`):
```json
{
  "idGestor": 2
}
```

**¿Qué recibe al cambiar estado?** (`ActualizarEstadoMoraRequest.java`):
```json
{
  "estado": "EN_GESTION",
  "observaciones": "Se contactó al cliente, se acordó plan de pagos"
}
```

Los estados posibles son (de `EstadoMora.java`): `PENDIENTE`, `EN_GESTION`, `REGULARIZADA`, `INCOBRABLE`.

**¿Qué devuelve?** (`MoraResponse.java`):
```json
{
  "id": 1,
  "idCredito": 5,
  "dniCliente": "12345678",
  "nombreCliente": "Ana López",
  "idGestor": 2,
  "nombreGestor": "Juan Pérez",
  "fechaRegistro": "2026-05-20",
  "motivo": "Cuotas impagas por más de 90 días",
  "estado": "EN_GESTION",
  "observaciones": "Se contactó al cliente"
}
```

---

### Paso 3 — Redux Slice para Gestores

**Archivo a crear:** `frontend/src/store/slices/gestoresSlice.js`

**¿Qué es un slice?** Es una "rebanada" del estado global de Redux. Define:
- El **estado inicial** (la lista de gestores, si estamos cargando, si hay error)
- Los **thunks** (funciones async que llaman al API y despachan acciones)
- Los **reducers** (cómo cambia el estado cuando una acción se completa)

**Thunks a crear:**

| Thunk | Llama a | ¿Qué hace con el resultado? |
|-------|---------|----------------------------|
| `fetchGestores` | `getGestores()` | Guarda la lista en `state.gestores.lista` |
| `addGestor` | `crearGestor(data)` | Agrega el nuevo gestor a la lista |
| `updateGestor` | `actualizarGestor(id, data)` | Reemplaza el gestor modificado en la lista |
| `removeGestor` | `eliminarGestor(id)` | Saca el gestor eliminado de la lista |

**Estado inicial:**
```js
{
  lista:   [],     // array de gestores
  loading: false,  // ¿estamos esperando respuesta del backend?
  error:   null    // mensaje de error si algo falló
}
```

Cada thunk maneja 3 estados: `pending` (empezó), `fulfilled` (terminó bien), `rejected` (falló). Esto es lo mismo que ya hacen `clientesSlice.js` y los otros — podés usarlos como referencia.

---

### Paso 4 — Redux Slice para Moras

**Archivo a crear:** `frontend/src/store/slices/morasSlice.js`

**Thunks a crear:**

| Thunk | Llama a | ¿Qué hace con el resultado? |
|-------|---------|----------------------------|
| `fetchMoras` | `getMoras()` | Guarda todas las moras en la lista |
| `fetchMorasPorCredito` | `getMorasPorCredito(idCredito)` | Reemplaza la lista con las moras de ese crédito |
| `fetchMorasPorCliente` | `getMorasPorCliente(dni)` | Reemplaza la lista con las moras de ese cliente |
| `fetchMorasPorEstado` | `getMorasPorEstado(estado)` | Reemplaza la lista filtrada por estado |
| `fetchMorasPorGestor` | `getMorasPorGestor(idGestor)` | Reemplaza la lista filtrada por gestor |
| `addMora` | `crearMora(data)` | Agrega la nueva mora a la lista |
| `asignarGestorMora` | `asignarGestor(id, data)` | Actualiza la mora en la lista con el nuevo gestor |
| `cambiarEstadoMora` | `actualizarEstadoMora(id, data)` | Actualiza la mora en la lista con el nuevo estado |
| `removeMora` | `eliminarMora(id)` | Saca la mora de la lista |

**Estado inicial:**
```js
{
  lista:   [],
  loading: false,
  error:   null
}
```

---

### Paso 5 — Registrar los nuevos slices en el store

**Archivo a modificar:** `frontend/src/store/index.js`

Hoy el store tiene 4 reducers: `auth`, `clientes`, `creditos`, `cobranzas`. Hay que agregar 2 más:

```js
import gestoresReducer  from './slices/gestoresSlice';
import morasReducer     from './slices/morasSlice';

// y en el objeto reducer:
gestores:  gestoresReducer,
moras:     morasReducer,
```

**¿Por qué?** Si no registrás el slice en el store, Redux no sabe que existe y los componentes no pueden acceder a `state.gestores` ni `state.moras`.

---

### Paso 6 — Página de Gestores (CRUD completo)

**Archivo a crear:** `frontend/src/pages/Gestores.jsx`

Esta página tiene que permitir las 4 operaciones:

| Operación | ¿Cómo se ve en la UI? |
|-----------|----------------------|
| **Crear** | Formulario con campos "Nombre" y "Email" + botón "Agregar" |
| **Leer** | Tabla que lista todos los gestores (ID, Nombre, Email) |
| **Editar** | Botón "Editar" en cada fila → los datos se cargan en el formulario → botón cambia a "Guardar cambios" |
| **Eliminar** | Botón "Eliminar" en cada fila → confirmación → se borra |

**Flujo de la página:**
1. Al montarse el componente, despacha `fetchGestores()` para cargar la lista
2. El usuario puede agregar un gestor llenando el formulario
3. Al hacer clic en "Editar", los datos del gestor se copian al formulario y se entra en "modo edición"
4. Al hacer clic en "Eliminar", se despacha `removeGestor(id)`
5. Errores y estados de carga se muestran igual que en las otras páginas

**Hooks de React que vas a usar:**
- `useState` — para manejar el formulario y saber si estás en modo crear o editar
- `useEffect` — para cargar la lista cuando se monta la página
- `useDispatch` — para despachar thunks de Redux
- `useSelector` — para leer `state.gestores` del store

---

### Paso 7 — Página de Moras (CRUD completo)

**Archivo a crear:** `frontend/src/pages/Moras.jsx`

Esta es la página más compleja porque tiene más operaciones. Se puede dividir en secciones:

**Sección 1 — Buscar moras**
- Select/dropdown para elegir tipo de búsqueda: "Todas", "Por crédito", "Por cliente", "Por estado", "Por gestor"
- Input para escribir el valor de búsqueda (ID crédito, DNI, estado, ID gestor)
- Botón "Buscar"

**Sección 2 — Registrar mora nueva**
- Formulario con: ID Crédito, Motivo, Observaciones
- Botón "Registrar mora"

**Sección 3 — Tabla de resultados**
- Columnas: ID, Crédito, Cliente, Gestor, Fecha, Motivo, Estado, Observaciones
- Por cada fila:
  - Botón **"Asignar gestor"** → abre un input para elegir ID del gestor
  - Botón **"Cambiar estado"** → abre un select con los 4 estados posibles + campo observaciones
  - Botón **"Eliminar"** → solo visible si el estado es `PENDIENTE` (regla del backend)

**Estados posibles de una mora (para mostrar con colores diferentes):**

| Estado | Color sugerido | Significado |
|--------|---------------|-------------|
| `PENDIENTE` | Amarillo/naranja | Aún no se gestionó |
| `EN_GESTION` | Azul | Un gestor está trabajando en ella |
| `REGULARIZADA` | Verde | El cliente pagó, se resolvió |
| `INCOBRABLE` | Rojo | No se pudo cobrar |

---

### Paso 8 — Agregar rutas en App.jsx

**Archivo a modificar:** `frontend/src/App.jsx`

Agregar dos rutas nuevas dentro de `<Routes>`:

```jsx
<Route path="/gestores" element={<PrivateRoute><Gestores /></PrivateRoute>} />
<Route path="/moras"    element={<PrivateRoute><Moras /></PrivateRoute>} />
```

Y los imports correspondientes arriba del archivo.

---

### Paso 9 — Agregar links en la Navbar

**Archivo a modificar:** `frontend/src/components/Navbar.jsx`

Agregar dos `<Link>` nuevos dentro del bloque que se muestra cuando hay usuario logueado:

```jsx
<Link to="/gestores" style={styles.link}>Gestores</Link>
<Link to="/moras"    style={styles.link}>Moras</Link>
```

---

### Paso 10 — Probar todo

1. Levantar el backend (`mvn spring-boot:run` o desde el IDE)
2. Levantar el frontend (`npm run dev`)
3. Abrir el navegador en `http://localhost:5173`
4. Probar este flujo completo:
   - Login
   - Ir a Gestores → crear un gestor → editarlo → eliminarlo
   - Ir a Moras → registrar una mora → asignar gestor → cambiar estado → eliminar
   - Verificar que los errores del backend se muestran correctamente
   - Verificar que los estados de carga ("Cargando...") aparecen

---

## Resumen visual del plan

```
Paso 1:  api/gestores.js        ← funciones que hablan con el backend
Paso 2:  api/moras.js           ← funciones que hablan con el backend
Paso 3:  slices/gestoresSlice.js ← estado global de gestores
Paso 4:  slices/morasSlice.js    ← estado global de moras
Paso 5:  store/index.js         ← registrar los slices nuevos
Paso 6:  pages/Gestores.jsx     ← la pantalla de gestores
Paso 7:  pages/Moras.jsx        ← la pantalla de moras
Paso 8:  App.jsx                ← agregar las rutas
Paso 9:  Navbar.jsx             ← agregar los links
Paso 10: Probar en el navegador
```

**Archivos nuevos:** 4 (`gestores.js`, `moras.js`, `gestoresSlice.js`, `morasSlice.js`, `Gestores.jsx`, `Moras.jsx`)  
**Archivos a modificar:** 3 (`store/index.js`, `App.jsx`, `Navbar.jsx`)

---

## Orden recomendado para trabajar

Hay que respetar las dependencias: no podés crear la página si no tenés el slice, y no podés crear el slice si no tenés el API client.

```
api/gestores.js  →  slices/gestoresSlice.js  →  pages/Gestores.jsx
api/moras.js     →  slices/morasSlice.js     →  pages/Moras.jsx

Una vez que existen los slices:
  → store/index.js (registrar)

Una vez que existen las páginas:
  → App.jsx (rutas)
  → Navbar.jsx (links)

Al final:
  → Probar todo en el navegador
```
