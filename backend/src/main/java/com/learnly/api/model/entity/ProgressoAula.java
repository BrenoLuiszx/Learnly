package com.learnly.api.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progresso_aula",
       uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "aula_id"}))
public class ProgressoAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "aula_id", nullable = false)
    private Long aulaId;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    @Column(nullable = false)
    private Boolean concluido = false;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    public ProgressoAula() {}

    public ProgressoAula(Long usuarioId, Long aulaId, Long cursoId) {
        this.usuarioId = usuarioId;
        this.aulaId = aulaId;
        this.cursoId = cursoId;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Long getAulaId() { return aulaId; }
    public void setAulaId(Long aulaId) { this.aulaId = aulaId; }
    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }
    public Boolean getConcluido() { return concluido; }
    public void setConcluido(Boolean concluido) { this.concluido = concluido; }
    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
}
