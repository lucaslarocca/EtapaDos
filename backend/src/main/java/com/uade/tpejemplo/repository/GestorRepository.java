package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Gestor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GestorRepository extends JpaRepository<Gestor, Long> {

    boolean existsByEmail(String email);

    Optional<Gestor> findByEmail(String email);
}
