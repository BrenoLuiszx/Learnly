package com.learnly.api.dto;

public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String foto;
    private String role;
    private String statusSolicitacao;
    private String justificativaColaborador;

    public UsuarioDTO() {}

    public UsuarioDTO(Long id, String nome, String email, String foto, String role, String statusSolicitacao, String justificativaColaborador) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.foto = foto;
        this.role = role;
        this.statusSolicitacao = statusSolicitacao;
        this.justificativaColaborador = justificativaColaborador;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatusSolicitacao() { return statusSolicitacao; }
    public void setStatusSolicitacao(String statusSolicitacao) { this.statusSolicitacao = statusSolicitacao; }

    public String getJustificativaColaborador() { return justificativaColaborador; }
    public void setJustificativaColaborador(String j) { this.justificativaColaborador = j; }
}
