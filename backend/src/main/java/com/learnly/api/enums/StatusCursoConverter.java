package com.learnly.api.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusCursoConverter implements AttributeConverter<StatusCurso, String> {

    @Override
    public String convertToDatabaseColumn(StatusCurso status) {
        return status == null ? null : status.getValor();
    }

    @Override
    public StatusCurso convertToEntityAttribute(String valor) {
        return valor == null ? null : StatusCurso.fromValor(valor);
    }
}
