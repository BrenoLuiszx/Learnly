package com.learnly.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusSolicitacao {
    NENHUMA("nenhuma"),
    PENDENTE("pendente"),
    APROVADA("aprovada"),
    RECUSADA("recusada");

    private final String valor;

    StatusSolicitacao(String valor) { this.valor = valor; }

    @JsonValue
    public String getValor() { return valor; }

    @JsonCreator
    public static StatusSolicitacao fromValor(String valor) {
        if (valor == null) return NENHUMA;
        for (StatusSolicitacao s : values()) {
            if (s.valor.equalsIgnoreCase(valor)) return s;
        }
        return NENHUMA;
    }
}
