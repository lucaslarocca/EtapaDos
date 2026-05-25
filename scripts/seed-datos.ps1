# =============================================================================
# seed-datos.ps1
# Pobla la base de datos en memoria con los datos necesarios para las pruebas
# de la Etapa 2.
#
# Requisitos:
#   - Backend corriendo en http://localhost:8080
#   - PowerShell 5.1 o superior
#
# Uso:
#   .\scripts\seed-datos.ps1
#
# Si aparece el error "la ejecucion de scripts esta deshabilitada":
#   Opcion A (una sola vez, sin cambios permanentes):
#     powershell -ExecutionPolicy Bypass -File .\scripts\seed-datos.ps1
#   Opcion B (habilitar para tu usuario de forma permanente):
#     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# =============================================================================

$BASE = "http://localhost:8080/api"

function Write-Step { param($msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    >>  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "    ERR $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Seed de datos de prueba — Etapa 2 UADE   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# =============================================================================
# 1. AUTENTICACION
# =============================================================================
Write-Step "Paso 1/5 — Autenticacion"

$authBody = @{ username = "admin"; password = "1234" } | ConvertTo-Json

try {
    $auth = Invoke-RestMethod -Uri "$BASE/auth/register" `
        -Method POST -ContentType "application/json" -Body $authBody
    Write-Ok "Usuario 'admin' registrado correctamente."
} catch {
    Write-Warn "El usuario ya existe. Intentando login..."
    try {
        $auth = Invoke-RestMethod -Uri "$BASE/auth/login" `
            -Method POST -ContentType "application/json" -Body $authBody
        Write-Ok "Login exitoso."
    } catch {
        Write-Fail "No se pudo autenticar. Verificar que el backend esta corriendo en $BASE"
        exit 1
    }
}

$token   = $auth.token
$headers = @{ Authorization = "Bearer $token" }
Write-Ok "Token JWT obtenido."

# =============================================================================
# 2. CLIENTE
# =============================================================================
Write-Step "Paso 2/5 — Crear cliente"

try {
    $body    = @{ dni = "12345678"; nombre = "Ana Lopez" } | ConvertTo-Json
    $cliente = Invoke-RestMethod -Uri "$BASE/clientes" `
        -Method POST -ContentType "application/json" -Headers $headers -Body $body
    Write-Ok "Cliente creado  -> DNI: $($cliente.dni)  Nombre: $($cliente.nombre)"
} catch {
    Write-Fail "Error al crear cliente: $($_.Exception.Message)"
}

# =============================================================================
# 3. CREDITO
# =============================================================================
Write-Step "Paso 3/5 — Crear credito"

try {
    $body = @{
        dniCliente     = "12345678"
        deudaOriginal  = 50000
        fecha          = "2025-01-15"
        importeCuota   = 5000
        cantidadCuotas = 10
    } | ConvertTo-Json

    $credito = Invoke-RestMethod -Uri "$BASE/creditos" `
        -Method POST -ContentType "application/json" -Headers $headers -Body $body

    Write-Ok "Credito creado  -> ID: $($credito.id)  Deuda: $$($credito.deudaOriginal)  Cuotas: $($credito.cantidadCuotas) x $$($credito.importeCuota)"
} catch {
    Write-Fail "Error al crear credito: $($_.Exception.Message)"
}

# =============================================================================
# 4. GESTORES
# =============================================================================
Write-Step "Paso 4/5 — Crear gestores"

$gestores = @(
    @{ nombre = "Juan Perez";   email = "juan@mail.com"  },
    @{ nombre = "Maria Garcia"; email = "maria@mail.com" }
)

foreach ($g in $gestores) {
    try {
        $body    = $g | ConvertTo-Json
        $gestor  = Invoke-RestMethod -Uri "$BASE/gestores" `
            -Method POST -ContentType "application/json" -Headers $headers -Body $body
        Write-Ok "Gestor creado   -> ID: $($gestor.id)  Nombre: $($gestor.nombre)  Email: $($gestor.email)"
    } catch {
        Write-Fail "Error al crear gestor '$($g.nombre)': $($_.Exception.Message)"
    }
}

# =============================================================================
# 5. MORA
# =============================================================================
Write-Step "Paso 5/5 — Crear mora"

try {
    $body = @{
        idCredito     = 1
        motivo        = "Cuotas impagas por mas de 90 dias"
        observaciones = "Cliente no responde llamadas"
    } | ConvertTo-Json

    $mora = Invoke-RestMethod -Uri "$BASE/moras" `
        -Method POST -ContentType "application/json" -Headers $headers -Body $body

    Write-Ok "Mora creada     -> ID: $($mora.id)  Estado: $($mora.estado)  Credito: #$($mora.idCredito)"
} catch {
    Write-Fail "Error al crear mora: $($_.Exception.Message)"
}

# =============================================================================
# RESUMEN
# =============================================================================
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Datos cargados. Resumen:                 " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Usuario   : admin  /  contrasena: 1234"
Write-Host "  Cliente   : Ana Lopez  (DNI 12345678)"
Write-Host "  Credito   : ID 1  —  $50.000 en 10 cuotas de $5.000"
Write-Host "  Gestor 1  : Juan Perez   (ID 1)  juan@mail.com"
Write-Host "  Gestor 2  : Maria Garcia (ID 2)  maria@mail.com"
Write-Host "  Mora      : ID 1  —  PENDIENTE  —  Credito #1"
Write-Host ""
Write-Host "  Abrir la app en: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
