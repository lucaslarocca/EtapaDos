package com.uade.tpejemplo.dto.request;

import lombok.Data;

@Data
public class MoraRequest {
    private Long idCredito;
    private String motivo;
    private String observaciones;
}
