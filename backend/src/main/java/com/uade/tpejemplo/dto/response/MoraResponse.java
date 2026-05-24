package com.uade.tpejemplo.dto.response;

import com.uade.tpejemplo.model.EstadoMora;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class MoraResponse {
    private Long id;
    private Long idCredito;
    private String dniCliente;
    private String nombreCliente;
    private Long idGestor;
    private String nombreGestor;
    private LocalDate fechaRegistro;
    private String motivo;
    private EstadoMora estado;
    private String observaciones;
}
