package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.EstadoMora;
import com.uade.tpejemplo.model.Mora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoraRepository extends JpaRepository<Mora, Long> {

    // Todas las moras de un crédito
    List<Mora> findByCreditoId(Long idCredito);

    // Todas las moras de un cliente (por DNI)
    List<Mora> findByCreditoClienteDni(String dni);

    // Moras por estado (para reporte de seguimiento)
    List<Mora> findByEstado(EstadoMora estado);

    // Moras asignadas a un gestor
    List<Mora> findByGestorId(Long idGestor);

    // Verificar si ya existe una mora PENDIENTE o EN_GESTION para un crédito
    boolean existsByCreditoIdAndEstadoIn(Long idCredito, List<EstadoMora> estados);

    // Buscar mora activa de un crédito
    Optional<Mora> findByCreditoIdAndEstadoIn(Long idCredito, List<EstadoMora> estados);
}
