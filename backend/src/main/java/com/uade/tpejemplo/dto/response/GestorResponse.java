package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GestorResponse {
    private Long id;
    private String nombre;
    private String email;
}
