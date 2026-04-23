package com.learnly.api.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Certificados")
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    @Column(name = "nome_usuario", length = 100)
    private String nomeUsuario;

    @Column(name = "titulo_curso", length = 200)
    private String tituloCurso;

    // URL de upload externo ou null (gerado internamente)
    @Column(name = "url_certificado", length = 500)
    private String urlCertificado;

    @Column(name = "data_emissao")
    private LocalDateTime dataEmissao = LocalDateTime.now();

    // visivel para empresas/colaboradores
    @Column(nullable = false)
    private Boolean publico = true;

    public Certificado() {}

    public Certificado(Long usuarioId, Long cursoId, String nomeUsuario, String tituloCurso) {
        this.usuarioId = usuarioId;
        this.cursoId = cursoId;
        this.nomeUsuario = nomeUsuario;
        this.tituloCurso = tituloCurso;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }
    public String getNomeUsuario() { return nomeUsuario; }
    public void setNomeUsuario(String nomeUsuario) { this.nomeUsuario = nomeUsuario; }
    public String getTituloCurso() { return tituloCurso; }
    public void setTituloCurso(String tituloCurso) { this.tituloCurso = tituloCurso; }
    public String getUrlCertificado() { return urlCertificado; }
    public void setUrlCertificado(String urlCertificado) { this.urlCertificado = urlCertificado; }
    public LocalDateTime getDataEmissao() { return dataEmissao; }
    public void setDataEmissao(LocalDateTime dataEmissao) { this.dataEmissao = dataEmissao; }
    public Boolean getPublico() { return publico; }
    public void setPublico(Boolean publico) { this.publico = publico; }
}
