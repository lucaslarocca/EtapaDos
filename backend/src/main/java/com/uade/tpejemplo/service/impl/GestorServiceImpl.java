package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.GestorRequest;
import com.uade.tpejemplo.dto.response.GestorResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Gestor;
import com.uade.tpejemplo.repository.GestorRepository;
import com.uade.tpejemplo.service.GestorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GestorServiceImpl implements GestorService {

    private final GestorRepository gestorRepository;

    @Override
    public GestorResponse crear(GestorRequest request) {
        if (gestorRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un gestor con el email: " + request.getEmail());
        }
        Gestor gestor = new Gestor(null, request.getNombre(), request.getEmail());
        gestorRepository.save(gestor);
        return toResponse(gestor);
    }

    @Override
    public GestorResponse buscarPorId(Long id) {
        Gestor gestor = gestorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gestor", "id", id));
        return toResponse(gestor);
    }

    @Override
    public List<GestorResponse> listarTodos() {
        return gestorRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public GestorResponse actualizar(Long id, GestorRequest request) {
        Gestor gestor = gestorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gestor", "id", id));

        // Si cambió el email, verificar que no lo use otro gestor
        if (!gestor.getEmail().equals(request.getEmail()) &&
                gestorRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un gestor con el email: " + request.getEmail());
        }

        gestor.setNombre(request.getNombre());
        gestor.setEmail(request.getEmail());
        gestorRepository.save(gestor);
        return toResponse(gestor);
    }

    @Override
    public void eliminar(Long id) {
        if (!gestorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gestor", "id", id);
        }
        gestorRepository.deleteById(id);
    }

    private GestorResponse toResponse(Gestor gestor) {
        return new GestorResponse(gestor.getId(), gestor.getNombre(), gestor.getEmail());
    }
}
