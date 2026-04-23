package com.learnly.api.dto;

import java.time.LocalDateTime;

public class AvaliacaoDTO {

    private Long id;
    private Long usuarioId;
    private Long cursoId;
    private Integer nota;
    private String comentario;
    private LocalDateTime dataCriacao;
    private String nomeUsuario;
    private String fotoUsuario;

    public AvaliacaoDTO(Long id, Long usuarioId, Long cursoId,
                        Integer nota, String comentario, LocalDateTime dataCriacao,
                        String nomeUsuario, String fotoUsuario) {
        this.id           = id;
        this.usuarioId    = usuarioId;
        this.cursoId      = cursoId;
        this.nota         = nota;
        this.comentario   = comentario;
        this.dataCriacao  = dataCriacao;
        this.nomeUsuario  = nomeUsuario;
        this.fotoUsuario  = fotoUsuario;
    }

    public Long getId()                  { return id; }
    public Long getUsuarioId()           { return usuarioId; }
    public Long getCursoId()             { return cursoId; }
    public Integer getNota()             { return nota; }
    public String getComentario()        { return comentario; }
    public LocalDateTime getDataCriacao(){ return dataCriacao; }
    public String getNomeUsuario()       { return nomeUsuario; }
    public String getFotoUsuario()       { return fotoUsuario; }
}
