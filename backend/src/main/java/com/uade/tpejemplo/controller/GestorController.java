package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.dto.request.GestorRequest;
import com.uade.tpejemplo.dto.response.GestorResponse;
import com.uade.tpejemplo.service.GestorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gestores")
@RequiredArgsConstructor
public class GestorController {

    private final GestorService gestorService;

    @PostMapping
    public ResponseEntity<GestorResponse> crear(@RequestBody GestorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gestorService.crear(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GestorResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gestorService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<GestorResponse>> listarTodos() {
        return ResponseEntity.ok(gestorService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<GestorResponse> actualizar(@PathVariable Long id,
                                                     @RequestBody GestorRequest request) {
        return ResponseEntity.ok(gestorService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gestorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
