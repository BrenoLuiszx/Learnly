package com.learnly.api.dto;

public class CursoDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private String url;
    private String categoria;
    private String instrutor;
    private Integer duracao;
    private String status;
    private Long instrutorId;
    private String imagem;
    private String descricaoDetalhada;
    private String linksExternos;
    private String anexos;
    private Double mediaAvaliacao;
    private Integer totalAvaliacoes;
    private String dataCriacao;

    public CursoDTO() {}

    public CursoDTO(Long id, String titulo, String descricao, String url,
                    String categoria, String instrutor, Integer duracao) {
        this.id = id;
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
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getInstrutor() { return instrutor; }
    public void setInstrutor(String instrutor) { this.instrutor = instrutor; }
    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getInstrutorId() { return instrutorId; }
    public void setInstrutorId(Long instrutorId) { this.instrutorId = instrutorId; }
    public String getImagem() { return imagem; }
    public void setImagem(String imagem) { this.imagem = imagem; }
    public String getDescricaoDetalhada() { return descricaoDetalhada; }
    public void setDescricaoDetalhada(String d) { this.descricaoDetalhada = d; }
    public String getLinksExternos() { return linksExternos; }
    public void setLinksExternos(String l) { this.linksExternos = l; }
    public String getAnexos() { return anexos; }
    public void setAnexos(String anexos) { this.anexos = anexos; }
    public Double getMediaAvaliacao() { return mediaAvaliacao; }
    public void setMediaAvaliacao(Double mediaAvaliacao) { this.mediaAvaliacao = mediaAvaliacao; }
    public Integer getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }
    public String getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(String dataCriacao) { this.dataCriacao = dataCriacao; }
}
