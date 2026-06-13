package com.learnly.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    USER("user"),
    COLABORADOR("colaborador"),
    ADMIN("admin");

    private final String valor;

    Role(String valor) { this.valor = valor; }

    @JsonValue
    public String getValor() { return valor; }

    @JsonCreator
    public static Role fromValor(String valor) {
        if (valor == null) return USER;
        for (Role r : values()) {
            if (r.valor.equalsIgnoreCase(valor)) return r;
        }
        return USER;
    }
}
