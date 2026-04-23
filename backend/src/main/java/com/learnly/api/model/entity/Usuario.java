package com.learnly.api.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nome;
    
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    
    @Column(nullable = false)
    private String senha;
    
    @Column(length = 500)
    private String foto;
    
    // Roles: admin, colaborador, user
    @Column(nullable = false, length = 20)
    private String role = "user";

    // Status da solicitação de colaborador: nenhuma, pendente, aprovada, recusada
    @Column(name = "status_solicitacao", length = 20)
    private String statusSolicitacao = "nenhuma";

    @Column(name = "justificativa_colaborador", length = 500)
    private String justificativaColaborador;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();
    
    private Boolean ativo = true;

    @Column(name = "planejamento_cards", columnDefinition = "NVARCHAR(MAX)")
    private String planejamentoCards;

    @Column(name = "planejamento_cols", columnDefinition = "NVARCHAR(MAX)")
    private String planejamentoCols;

    @Column(name = "favoritos", columnDefinition = "NVARCHAR(MAX)")
    private String favoritos = "[]";

    @Column(name = "assistir_depois", columnDefinition = "NVARCHAR(MAX)")
    private String assistirDepois = "[]";

    @Column(name = "curriculo", columnDefinition = "NVARCHAR(MAX)")
    private String curriculo;

    public Usuario() {}

    public Usuario(String nome, String email, String senha, String foto, String role) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.foto = foto;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatusSolicitacao() { return statusSolicitacao; }
    public void setStatusSolicitacao(String statusSolicitacao) { this.statusSolicitacao = statusSolicitacao; }

    public String getJustificativaColaborador() { return justificativaColaborador; }
    public void setJustificativaColaborador(String justificativaColaborador) { this.justificativaColaborador = justificativaColaborador; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getPlanejamentoCards() { return planejamentoCards; }
    public void setPlanejamentoCards(String planejamentoCards) { this.planejamentoCards = planejamentoCards; }

    public String getPlanejamentoCols() { return planejamentoCols; }
    public void setPlanejamentoCols(String planejamentoCols) { this.planejamentoCols = planejamentoCols; }

    public String getFavoritos() { return favoritos != null ? favoritos : "[]"; }
    public void setFavoritos(String favoritos) { this.favoritos = favoritos; }

    public String getAssistirDepois() { return assistirDepois != null ? assistirDepois : "[]"; }
    public void setAssistirDepois(String assistirDepois) { this.assistirDepois = assistirDepois; }

    public String getCurriculo() { return curriculo; }
    public void setCurriculo(String curriculo) { this.curriculo = curriculo; }
}
