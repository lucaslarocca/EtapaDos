package com.uade.tpejemplo.dto.request;

import com.uade.tpejemplo.model.EstadoMora;
import lombok.Data;

@Data
public class ActualizarEstadoMoraRequest {
    private EstadoMora estado;
    private String observaciones;
}
