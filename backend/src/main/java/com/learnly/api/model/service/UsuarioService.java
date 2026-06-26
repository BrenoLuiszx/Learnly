package com.learnly.api.model.service;

import com.learnly.api.dto.UsuarioDTO;
import com.learnly.api.enums.Role;
import com.learnly.api.enums.StatusSolicitacao;
import com.learnly.api.model.entity.Instrutor;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.InstrutorRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import com.learnly.api.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private InstrutorRepository instrutorRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UsuarioDTO> listarSolicitacoesPendentes() {
        return usuarioRepository.findByStatusSolicitacao(StatusSolicitacao.PENDENTE).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO registrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail()))
            throw new RuntimeException("Email já cadastrado");

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setRole(Role.USER);
        return toDTO(usuarioRepository.save(usuario));
    }

    public Map<String, Object> login(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(senha, usuario.getSenha()))
            throw new RuntimeException("Email ou senha inválidos");

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().getValor());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("usuario", toDTO(usuario));
        return response;
    }

    public UsuarioDTO solicitarColaborador(Long id, String justificativa) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.getRole() == Role.COLABORADOR || usuario.getRole() == Role.ADMIN)
            throw new RuntimeException("Usuário já é colaborador ou admin");

        usuario.setStatusSolicitacao(StatusSolicitacao.PENDENTE);
        usuario.setJustificativaColaborador(justificativa);
        return toDTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO aprovarColaborador(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setRole(Role.COLABORADOR);
        usuario.setStatusSolicitacao(StatusSolicitacao.APROVADA);
        Usuario salvo = usuarioRepository.save(usuario);

        instrutorRepository.findByUsuarioId(salvo.getId()).orElseGet(() -> {
            Instrutor novo = new Instrutor(salvo.getNome(), null);
            novo.setFoto(salvo.getFoto());
            novo.setUsuarioId(salvo.getId());
            return instrutorRepository.save(novo);
        });

        return toDTO(salvo);
    }

    public UsuarioDTO recusarColaborador(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setStatusSolicitacao(StatusSolicitacao.RECUSADA);
        return toDTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO atualizarFoto(Long id, String foto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setFoto(foto);
        return toDTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO atualizarPerfil(Long id, String nome, String bio) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        if (nome != null && !nome.trim().isEmpty()) usuario.setNome(nome.trim());
        return toDTO(usuarioRepository.save(usuario));
    }

    public String gerarHash(String senha) {
        return passwordEncoder.encode(senha);
    }

    public Map<String, Object> getPlanejamento(Long id) {
        return usuarioRepository.findById(id).map(u -> {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("cards", u.getPlanejamentoCards() != null ? u.getPlanejamentoCards() : "[]");
            body.put("cols",  u.getPlanejamentoCols()  != null ? u.getPlanejamentoCols()  : "[]");
            return body;
        }).orElse(null);
    }

    public void savePlanejamento(Long id, String cards, String cols) {
        usuarioRepository.findById(id).ifPresent(u -> {
            if (cards != null) u.setPlanejamentoCards(cards);
            if (cols  != null) u.setPlanejamentoCols(cols);
            usuarioRepository.save(u);
        });
    }

    public String getCurriculo(Long id) {
        return usuarioRepository.findById(id)
                .map(u -> u.getCurriculo() != null ? u.getCurriculo() : "{}")
                .orElse("{}");
    }

    public void saveCurriculo(Long id, String curriculo) {
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setCurriculo(curriculo);
            usuarioRepository.save(u);
        });
    }

    private UsuarioDTO toDTO(Usuario u) {
        Role role = u.getRole() != null ? u.getRole() : Role.USER;
        StatusSolicitacao status = u.getStatusSolicitacao() != null ? u.getStatusSolicitacao() : StatusSolicitacao.NENHUMA;
        return new UsuarioDTO(u.getId(), u.getNome(), u.getEmail(), u.getFoto(),
                role.getValor(), status.getValor(), u.getJustificativaColaborador());
    }
}
