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

Permite registrar créditos en mora, asignar gestores responsables y generar reportes de seguimiento por estado.

---

## Modelo de datos — Módulo de Mora

### Gestor
| Campo  | Tipo          | Descripción                     |
|--------|---------------|---------------------------------|
| id     | Long (PK, auto) | Identificador                 |
| nombre | String        | Nombre completo del gestor      |
| email  | String (único)| Email de contacto del gestor    |

### EstadoMora (enum)
| Valor        | Descripción                                      |
|--------------|--------------------------------------------------|
| PENDIENTE    | Mora registrada, sin gestor asignado             |
| EN_GESTION   | Gestor asignado, trabajando la recuperación      |
| REGULARIZADA | El cliente pagó y la mora quedó saldada          |
| INCOBRABLE   | Se agotaron las gestiones, se deriva a legales   |

### Mora
| Campo         | Tipo              | Descripción                                          |
|---------------|-------------------|------------------------------------------------------|
| id            | Long (PK, auto)   | Identificador                                        |
| credito       | FK → Credito      | Crédito que entró en mora                            |
| gestor        | FK → Gestor (opt) | Gestor asignado (puede ser null si está PENDIENTE)   |
| fechaRegistro | LocalDate         | Fecha en que se registró la mora (automática)        |
| motivo        | String            | Descripción del motivo de la mora                    |
| estado        | EstadoMora        | Estado actual del proceso de recuperación            |
| observaciones | String (opt)      | Notas adicionales del seguimiento                    |

**Relaciones:**
- `Mora` → `Credito`: ManyToOne (un crédito puede tener varias moras a lo largo del tiempo, pero solo una activa simultáneamente)
- `Mora` → `Gestor`: ManyToOne opcional (se asigna al pasar a EN_GESTION)
- `Credito` ya tiene relación con `Cliente`

---

## API REST — Módulo de Mora

Todos los endpoints requieren el header `Authorization: Bearer <token>`.

### Gestores

| Método | Endpoint              | Descripción                        | Body requerido  |
|--------|-----------------------|------------------------------------|-----------------|
| POST   | `/api/gestores`       | Crear gestor                       | `GestorRequest` |
| GET    | `/api/gestores`       | Listar todos los gestores          | —               |
| GET    | `/api/gestores/{id}`  | Buscar gestor por ID               | —               |
| PUT    | `/api/gestores/{id}`  | Actualizar datos del gestor        | `GestorRequest` |
| DELETE | `/api/gestores/{id}`  | Eliminar gestor                    | —               |

**GestorRequest:**
```json
{
  "nombre": "María López",
  "email": "maria.lopez@uade.edu.ar"
}
```

**GestorResponse:**
```json
{
  "id": 1,
  "nombre": "María López",
  "email": "maria.lopez@uade.edu.ar"
}
```

---

### Moras

| Método | Endpoint                        | Descripción                                      | Body requerido                  |
|--------|---------------------------------|--------------------------------------------------|---------------------------------|
| POST   | `/api/moras`                    | Registrar nueva mora                             | `MoraRequest`                   |
| GET    | `/api/moras`                    | Listar todas las moras                           | —                               |
| GET    | `/api/moras/{id}`               | Buscar mora por ID                               | —                               |
| GET    | `/api/moras/credito/{idCredito}`| Moras de un crédito                              | —                               |
| GET    | `/api/moras/cliente/{dni}`      | Moras de un cliente (por DNI)                    | —                               |
| GET    | `/api/moras/estado/{estado}`    | Reporte por estado (PENDIENTE, EN_GESTION, etc.) | —                               |
| GET    | `/api/moras/gestor/{idGestor}`  | Moras asignadas a un gestor                      | —                               |
| PUT    | `/api/moras/{id}/gestor`        | Asignar gestor (pasa a EN_GESTION)               | `AsignacionGestorRequest`       |
| PUT    | `/api/moras/{id}/estado`        | Actualizar estado y observaciones                | `ActualizarEstadoMoraRequest`   |
| DELETE | `/api/moras/{id}`               | Eliminar mora (solo si está en PENDIENTE)        | —                               |

**MoraRequest:**
```json
{
  "idCredito": 1,
  "motivo": "Cliente no realizó el pago de las últimas 3 cuotas",
  "observaciones": "Se intentó contactar sin éxito"
}
```

**AsignacionGestorRequest:**
```json
{
  "idGestor": 1
}
```

**ActualizarEstadoMoraRequest:**
```json
{
  "estado": "REGULARIZADA",
  "observaciones": "El cliente regularizó el pago completo el 10/04/2026"
}
```

**MoraResponse:**
```json
{
  "id": 1,
  "idCredito": 1,
  "dniCliente": "30111222",
  "nombreCliente": "Juan García",
  "idGestor": 1,
  "nombreGestor": "María López",
  "fechaRegistro": "2026-04-12",
  "motivo": "Cliente no realizó el pago de las últimas 3 cuotas",
  "estado": "EN_GESTION",
  "observaciones": "Se intentó contactar sin éxito"
}
```

---

## Reglas de negocio del módulo de Mora

| Regla | Descripción |
|-------|-------------|
| Mora activa única | No se puede registrar una mora nueva si el crédito ya tiene una en estado `PENDIENTE` o `EN_GESTION` |
| Asignación de gestor | Al asignar un gestor, el estado pasa automáticamente a `EN_GESTION` |
| No se puede asignar gestor | Si la mora ya está `REGULARIZADA` o `INCOBRABLE` |
| Estado terminal | Una mora en `REGULARIZADA` o `INCOBRABLE` no puede cambiar de estado |
| Eliminación restringida | Solo se pueden eliminar moras en estado `PENDIENTE` |

---

## Errores que devuelve el módulo de Mora

Todos los errores siguen el formato estándar del proyecto:

```json
{
  "status": 400,
  "error": "Error de negocio",
  "mensajes": ["El crédito 1 ya tiene una mora activa (PENDIENTE o EN_GESTION)."],
  "timestamp": "2026-04-12T14:00:00"
}
```

| Situación | HTTP |
|-----------|------|
| Crédito / Gestor / Mora no encontrado | 404 |
| Mora activa duplicada para el mismo crédito | 400 |
| Email de gestor duplicado | 400 |
| Asignar gestor a mora terminal | 400 |
| Cambiar estado de mora terminal | 400 |
| Eliminar mora que no está en PENDIENTE | 400 |

---

## Archivos nuevos agregados al proyecto

```
backend/src/main/java/com/uade/tpejemplo/
├── model/
│   ├── Gestor.java                          ← NUEVO
│   ├── Mora.java                            ← NUEVO
│   └── EstadoMora.java                      ← NUEVO
├── dto/
│   ├── request/
│   │   ├── GestorRequest.java               ← NUEVO
│   │   ├── MoraRequest.java                 ← NUEVO
│   │   ├── AsignacionGestorRequest.java     ← NUEVO
│   │   └── ActualizarEstadoMoraRequest.java ← NUEVO
│   └── response/
│       ├── GestorResponse.java              ← NUEVO
│       └── MoraResponse.java                ← NUEVO
├── repository/
│   ├── GestorRepository.java               ← NUEVO
│   └── MoraRepository.java                 ← NUEVO
├── service/
│   ├── GestorService.java                  ← NUEVO
│   ├── MoraService.java                    ← NUEVO
│   └── impl/
│       ├── GestorServiceImpl.java          ← NUEVO
│       └── MoraServiceImpl.java            ← NUEVO
└── controller/
    ├── GestorController.java               ← NUEVO
    └── MoraController.java                 ← NUEVO
```

**No se modificó ningún archivo existente.** El módulo se integra limpiamente al proyecto base.

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

### Flujo de prueba del módulo de mora

```
1. POST /api/auth/register   → obtener token JWT
2. POST /api/gestores         → crear gestores
3. POST /api/clientes         → crear cliente
4. POST /api/creditos         → crear crédito
5. POST /api/moras            → registrar mora (queda en PENDIENTE)
6. PUT  /api/moras/1/gestor   → asignar gestor (pasa a EN_GESTION)
7. GET  /api/moras/estado/EN_GESTION → reporte de seguimiento
8. PUT  /api/moras/1/estado   → actualizar a REGULARIZADA o INCOBRABLE
```

Ver el archivo `mora-tests.http` para ejemplos completos de cada llamada.
