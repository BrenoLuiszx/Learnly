package com.learnly.api.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        return role == null ? null : role.getValor();
    }

    @Override
    public Role convertToEntityAttribute(String valor) {
        return valor == null ? null : Role.fromValor(valor);
    }
}
