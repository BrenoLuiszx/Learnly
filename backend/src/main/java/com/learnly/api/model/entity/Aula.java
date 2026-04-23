package com.learnly.api.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Aulas")
public class Aula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    @Column(nullable = false)
    private Integer ordem;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(length = 1000)
    private String descricao;

    public Aula() {}

    public Aula(Long cursoId, Integer ordem, String titulo, String url, String descricao) {
        this.cursoId = cursoId;
        this.ordem = ordem;
        this.titulo = titulo;
        this.url = url;
        this.descricao = descricao;
    }

    public Long getId() { return id; }
    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }
    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
