package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.ActualizarEstadoMoraRequest;
import com.uade.tpejemplo.dto.request.AsignacionGestorRequest;
import com.uade.tpejemplo.dto.request.MoraRequest;
import com.uade.tpejemplo.dto.response.MoraResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.EstadoMora;
import com.uade.tpejemplo.model.Gestor;
import com.uade.tpejemplo.model.Mora;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.GestorRepository;
import com.uade.tpejemplo.repository.MoraRepository;
import com.uade.tpejemplo.service.MoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MoraServiceImpl implements MoraService {

    private final MoraRepository moraRepository;
    private final CreditoRepository creditoRepository;
    private final GestorRepository gestorRepository;

    @Override
    public MoraResponse registrar(MoraRequest request) {
        Credito credito = creditoRepository.findById(request.getIdCredito())
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", request.getIdCredito()));

        // No se puede registrar una mora nueva si ya existe una activa para ese crédito
        boolean tieneActiva = moraRepository.existsByCreditoIdAndEstadoIn(
            request.getIdCredito(),
            List.of(EstadoMora.PENDIENTE, EstadoMora.EN_GESTION)
        );
        if (tieneActiva) {
            throw new BusinessException(
                "El crédito " + request.getIdCredito() + " ya tiene una mora activa (PENDIENTE o EN_GESTION)."
            );
        }

        Mora mora = new Mora(
            null,
            credito,
            null,                       // gestor se asigna después
            LocalDate.now(),
            request.getMotivo(),
            EstadoMora.PENDIENTE,
            request.getObservaciones()
        );
        moraRepository.save(mora);
        return toResponse(mora);
    }

    @Override
    public MoraResponse buscarPorId(Long id) {
        Mora mora = moraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mora", "id", id));
        return toResponse(mora);
    }

    @Override
    public List<MoraResponse> listarTodos() {
        return moraRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<MoraResponse> listarPorCredito(Long idCredito) {
        if (!creditoRepository.existsById(idCredito)) {
            throw new ResourceNotFoundException("Crédito", "id", idCredito);
        }
        return moraRepository.findByCreditoId(idCredito).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<MoraResponse> listarPorCliente(String dni) {
        return moraRepository.findByCreditoClienteDni(dni).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<MoraResponse> listarPorEstado(EstadoMora estado) {
        return moraRepository.findByEstado(estado).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<MoraResponse> listarPorGestor(Long idGestor) {
        if (!gestorRepository.existsById(idGestor)) {
            throw new ResourceNotFoundException("Gestor", "id", idGestor);
        }
        return moraRepository.findByGestorId(idGestor).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public MoraResponse asignarGestor(Long id, AsignacionGestorRequest request) {
        Mora mora = moraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mora", "id", id));

        if (mora.getEstado() == EstadoMora.REGULARIZADA || mora.getEstado() == EstadoMora.INCOBRABLE) {
            throw new BusinessException(
                "No se puede asignar un gestor a una mora con estado: " + mora.getEstado()
            );
        }

        Gestor gestor = gestorRepository.findById(request.getIdGestor())
            .orElseThrow(() -> new ResourceNotFoundException("Gestor", "id", request.getIdGestor()));

        mora.setGestor(gestor);
        mora.setEstado(EstadoMora.EN_GESTION);
        moraRepository.save(mora);
        return toResponse(mora);
    }

    @Override
    public MoraResponse actualizarEstado(Long id, ActualizarEstadoMoraRequest request) {
        Mora mora = moraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mora", "id", id));

        // No se puede volver a un estado anterior desde REGULARIZADA o INCOBRABLE
        if (mora.getEstado() == EstadoMora.REGULARIZADA || mora.getEstado() == EstadoMora.INCOBRABLE) {
            throw new BusinessException(
                "La mora ya se encuentra en estado " + mora.getEstado() + " y no puede modificarse."
            );
        }

        mora.setEstado(request.getEstado());
        if (request.getObservaciones() != null) {
            mora.setObservaciones(request.getObservaciones());
        }
        moraRepository.save(mora);
        return toResponse(mora);
    }

    @Override
    public void eliminar(Long id) {
        Mora mora = moraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mora", "id", id));

        // Solo se pueden eliminar moras en estado PENDIENTE (sin gestión iniciada)
        if (mora.getEstado() != EstadoMora.PENDIENTE) {
            throw new BusinessException(
                "Solo se pueden eliminar moras en estado PENDIENTE. Estado actual: " + mora.getEstado()
            );
        }
        moraRepository.deleteById(id);
    }

    private MoraResponse toResponse(Mora mora) {
        return new MoraResponse(
            mora.getId(),
            mora.getCredito().getId(),
            mora.getCredito().getCliente().getDni(),
            mora.getCredito().getCliente().getNombre(),
            mora.getGestor() != null ? mora.getGestor().getId()     : null,
            mora.getGestor() != null ? mora.getGestor().getNombre() : null,
            mora.getFechaRegistro(),
            mora.getMotivo(),
            mora.getEstado(),
            mora.getObservaciones()
        );
    }
}
