package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.dto.request.ActualizarEstadoMoraRequest;
import com.uade.tpejemplo.dto.request.AsignacionGestorRequest;
import com.uade.tpejemplo.dto.request.MoraRequest;
import com.uade.tpejemplo.dto.response.MoraResponse;
import com.uade.tpejemplo.model.EstadoMora;
import com.uade.tpejemplo.service.MoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moras")
@RequiredArgsConstructor
public class MoraController {

    private final MoraService moraService;

    // ── Registrar mora ──────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<MoraResponse> registrar(@RequestBody MoraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moraService.registrar(request));
    }

    // ── Consultas ────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<MoraResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(moraService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MoraResponse>> listarTodos() {
        return ResponseEntity.ok(moraService.listarTodos());
    }

    @GetMapping("/credito/{idCredito}")
    public ResponseEntity<List<MoraResponse>> listarPorCredito(@PathVariable Long idCredito) {
        return ResponseEntity.ok(moraService.listarPorCredito(idCredito));
    }

    @GetMapping("/cliente/{dni}")
    public ResponseEntity<List<MoraResponse>> listarPorCliente(@PathVariable String dni) {
        return ResponseEntity.ok(moraService.listarPorCliente(dni));
    }

    // Reporte de seguimiento: filtrar por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<MoraResponse>> listarPorEstado(@PathVariable EstadoMora estado) {
        return ResponseEntity.ok(moraService.listarPorEstado(estado));
    }

    @GetMapping("/gestor/{idGestor}")
    public ResponseEntity<List<MoraResponse>> listarPorGestor(@PathVariable Long idGestor) {
        return ResponseEntity.ok(moraService.listarPorGestor(idGestor));
    }

    // ── Gestión ──────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/gestor")
    public ResponseEntity<MoraResponse> asignarGestor(@PathVariable Long id,
                                                      @RequestBody AsignacionGestorRequest request) {
        return ResponseEntity.ok(moraService.asignarGestor(id, request));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<MoraResponse> actualizarEstado(@PathVariable Long id,
                                                         @RequestBody ActualizarEstadoMoraRequest request) {
        return ResponseEntity.ok(moraService.actualizarEstado(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        moraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
