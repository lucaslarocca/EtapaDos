package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.GestorRequest;
import com.uade.tpejemplo.dto.response.GestorResponse;

import java.util.List;

public interface GestorService {

    GestorResponse crear(GestorRequest request);

    GestorResponse buscarPorId(Long id);

    List<GestorResponse> listarTodos();

    GestorResponse actualizar(Long id, GestorRequest request);

    void eliminar(Long id);
}
