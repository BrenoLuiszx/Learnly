package com.learnly.api.model.service;

import com.learnly.api.dto.UsuarioDTO;
import com.learnly.api.enums.Role;
import com.learnly.api.enums.StatusSolicitacao;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.entity.Instrutor;
import com.learnly.api.model.repository.InstrutorRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import com.learnly.api.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InstrutorRepository instrutorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lista usuários com solicitação pendente de colaborador
    public List<UsuarioDTO> listarSolicitacoesPendentes() {
        return usuarioRepository.findByStatusSolicitacao(StatusSolicitacao.PENDENTE).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO registrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Criptografa a senha
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        if (usuario.getEmail().toLowerCase().contains("admin")) {
            usuario.setRole(Role.ADMIN);
        } else {
            usuario.setRole(Role.USER);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return convertToDTO(salvo);
    }

    // Login retorna token JWT
    public Map<String, Object> login(String email, String senha) {
        Optional<Usuario> opt = usuarioRepository.findByEmail(email);
        if (opt.isEmpty()) throw new RuntimeException("Email ou senha inválidos");

        Usuario usuario = opt.get();

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getRole().name().toLowerCase());

        String tokenPreview = token.substring(0, Math.min(20, token.length())) + "..." + token.substring(Math.max(0, token.length() - 4));
        System.out.println("\n[Learnly Auth] Login bem-sucedido");
        System.out.println("  Usuário : " + usuario.getEmail());
        System.out.println("  Role    : " + usuario.getRole().name().toLowerCase());
        System.out.println("  Token   : " + tokenPreview);
        System.out.println();

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("usuario", convertToDTO(usuario));
        return response;
    }

    // Usuário solicita ser colaborador
    public UsuarioDTO solicitarColaborador(Long id, String justificativa) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.getRole() == Role.COLABORADOR || usuario.getRole() == Role.ADMIN) {
            throw new RuntimeException("Usuário já é colaborador ou admin");
        }

        usuario.setStatusSolicitacao(StatusSolicitacao.PENDENTE);
        usuario.setJustificativaColaborador(justificativa);
        return convertToDTO(usuarioRepository.save(usuario));
    }

    // Instrutor solicita criação de jornada — sem restrição de role
    public UsuarioDTO solicitarJornada(Long id, String payload) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setStatusSolicitacao(StatusSolicitacao.PENDENTE);
        usuario.setJustificativaColaborador(payload);
        return convertToDTO(usuarioRepository.save(usuario));
    }

    // Admin aprova solicitação — promove o usuário a colaborador e garante registro em Instrutores
    public UsuarioDTO aprovarColaborador(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setRole(Role.COLABORADOR);
        usuario.setStatusSolicitacao(StatusSolicitacao.APROVADA);
        Usuario salvo = usuarioRepository.save(usuario);

        // Ensure an Instrutores row exists linked to this user.
        // This is what allows findByInstrutorUsuarioId to return their courses
        // and what the ownership check in InstrutorController relies on.
        instrutorRepository.findByUsuarioId(salvo.getId()).orElseGet(() -> {
            Instrutor novo = new Instrutor(salvo.getNome(), null);
            novo.setFoto(salvo.getFoto());
            novo.setUsuarioId(salvo.getId());
            Instrutor criado = instrutorRepository.save(novo);
            System.out.println("[UsuarioService] Instrutor criado para colaborador id=" + salvo.getId() + " instrutor_id=" + criado.getId());
            return criado;
        });

        return convertToDTO(salvo);
    }

    // Admin recusa solicitação
    public UsuarioDTO recusarColaborador(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setStatusSolicitacao(StatusSolicitacao.RECUSADA);
        return convertToDTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO atualizarFoto(Long id, String foto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setFoto(foto);
        return convertToDTO(usuarioRepository.save(usuario));
    }

    public UsuarioDTO atualizarPerfil(Long id, String nome, String bio) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        if (nome != null && !nome.trim().isEmpty()) usuario.setNome(nome.trim());
        return convertToDTO(usuarioRepository.save(usuario));
    }

    public String gerarHash(String senha) {
        return passwordEncoder.encode(senha);
    }

    public Map<String, Object> getPlanejamento(Long id) {
        return usuarioRepository.findById(id).map(u -> {
            Map<String, Object> body = new java.util.LinkedHashMap<>();
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

    private UsuarioDTO convertToDTO(Usuario usuario) {
        Role role = usuario.getRole() != null ? usuario.getRole() : Role.USER;
        StatusSolicitacao status = usuario.getStatusSolicitacao() != null
                ? usuario.getStatusSolicitacao() : StatusSolicitacao.NENHUMA;
        return new UsuarioDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getFoto(),
            role.name().toLowerCase(),
            status.name().toLowerCase(),
            usuario.getJustificativaColaborador()
        );
    }
}
