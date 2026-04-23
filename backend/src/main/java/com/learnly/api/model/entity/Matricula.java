package com.learnly.api.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Matriculas",
    uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "curso_id"}))
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    @Column(name = "data_inscricao")
    private LocalDateTime dataInscricao = LocalDateTime.now();

    @Column(precision = 5, scale = 2)
    private BigDecimal progresso = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean concluido = false;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    public Matricula() {}

    public Matricula(Long usuarioId, Long cursoId) {
        this.usuarioId = usuarioId;
        this.cursoId = cursoId;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }
    public LocalDateTime getDataInscricao() { return dataInscricao; }
    public void setDataInscricao(LocalDateTime dataInscricao) { this.dataInscricao = dataInscricao; }
    public BigDecimal getProgresso() { return progresso; }
    public void setProgresso(BigDecimal progresso) { this.progresso = progresso; }
    public Boolean getConcluido() { return concluido; }
    public void setConcluido(Boolean concluido) { this.concluido = concluido; }
    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
}
