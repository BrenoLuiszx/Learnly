package com.learnly.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusCurso {
    PENDENTE("pendente"),
    APROVADO("aprovado"),
    REJEITADO("rejeitado");

    private final String valor;

    StatusCurso(String valor) { this.valor = valor; }

    @JsonValue
    public String getValor() { return valor; }

    @JsonCreator
    public static StatusCurso fromValor(String valor) {
        if (valor == null) return APROVADO;
        for (StatusCurso s : values()) {
            if (s.valor.equalsIgnoreCase(valor)) return s;
        }
        return APROVADO;
    }
}
