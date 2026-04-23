package com.learnly.api.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Cursos")
public class Curso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(nullable = false, length = 1000)
    private String descricao;
    
    @Column(nullable = false, length = 500)
    private String url;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
    
    @ManyToOne
    @JoinColumn(name = "instrutor_id", nullable = false)
    private Instrutor instrutor;
    
    @Column(nullable = false)
    private Integer duracao;

    // Status do curso: pendente, aprovado, rejeitado
    @Column(nullable = false, length = 20)
    private String status = "aprovado";

    @Column(length = 500)
    private String imagem;

    @Column(name = "descricao_detalhada", columnDefinition = "NVARCHAR(MAX)")
    private String descricaoDetalhada;

    // JSON string: [{"titulo":"...","url":"..."}]
    @Column(name = "links_externos", columnDefinition = "NVARCHAR(MAX)")
    private String linksExternos;

    // JSON string: [{"nome":"...","url":"..."}]
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String anexos;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();
    
    private Boolean ativo = true;

    public Curso() {}

    public Curso(String titulo, String descricao, String url, Categoria categoria, Instrutor instrutor, Integer duracao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.url = url;
        this.categoria = categoria;
        this.instrutor = instrutor;
        this.duracao = duracao;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Instrutor getInstrutor() { return instrutor; }
    public void setInstrutor(Instrutor instrutor) { this.instrutor = instrutor; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImagem() { return imagem; }
    public void setImagem(String imagem) { this.imagem = imagem; }

    public String getDescricaoDetalhada() { return descricaoDetalhada; }
    public void setDescricaoDetalhada(String descricaoDetalhada) { this.descricaoDetalhada = descricaoDetalhada; }

    public String getLinksExternos() { return linksExternos; }
    public void setLinksExternos(String linksExternos) { this.linksExternos = linksExternos; }

    public String getAnexos() { return anexos; }
    public void setAnexos(String anexos) { this.anexos = anexos; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
