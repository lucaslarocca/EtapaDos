package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.ActualizarEstadoMoraRequest;
import com.uade.tpejemplo.dto.request.AsignacionGestorRequest;
import com.uade.tpejemplo.dto.request.MoraRequest;
import com.uade.tpejemplo.dto.response.MoraResponse;
import com.uade.tpejemplo.model.EstadoMora;

import java.util.List;

public interface MoraService {

    MoraResponse registrar(MoraRequest request);

    MoraResponse buscarPorId(Long id);

    List<MoraResponse> listarTodos();

    List<MoraResponse> listarPorCredito(Long idCredito);

    List<MoraResponse> listarPorCliente(String dni);

    List<MoraResponse> listarPorEstado(EstadoMora estado);

    List<MoraResponse> listarPorGestor(Long idGestor);

    MoraResponse asignarGestor(Long id, AsignacionGestorRequest request);

    MoraResponse actualizarEstado(Long id, ActualizarEstadoMoraRequest request);

    void eliminar(Long id);
}
