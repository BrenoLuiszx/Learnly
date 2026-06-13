package com.learnly.api.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusSolicitacaoConverter implements AttributeConverter<StatusSolicitacao, String> {

    @Override
    public String convertToDatabaseColumn(StatusSolicitacao status) {
        return status == null ? null : status.getValor();
    }

    @Override
    public StatusSolicitacao convertToEntityAttribute(String valor) {
        return valor == null ? null : StatusSolicitacao.fromValor(valor);
    }
}
