package com.learnly.api.controller;

import com.learnly.api.dto.UsuarioDTO;
import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.service.AulaService;
import com.learnly.api.model.service.UsuarioService;
import com.learnly.api.model.service.MatriculaService;
import com.learnly.api.model.service.CertificadoService;
import com.learnly.api.model.service.AvaliacaoService;
import com.learnly.api.model.repository.AulaRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.ProgressoAulaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private MatriculaService matriculaService;

    @Autowired
    private CertificadoService certificadoService;

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private AulaRepository aulaRepository;

    @Autowired
    private ProgressoAulaRepository progressoAulaRepository;

    @Autowired
    private AulaService aulaService;

    // Listar todos (admin)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(Map.of(
            "message", "Learnly API funcionando",
            "total", usuarios.size(),
            "usuarios", usuarios
        ));
    }

    // Registrar novo usuário
    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            UsuarioDTO dto = usuarioService.registrar(usuario);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Login - retorna JWT + dados do usuário
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String senha = credentials.get("senha");
            Map<String, Object> result = usuarioService.login(email, senha);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email ou senha inválidos"));
        }
    }

    // Usuário solicita ser colaborador
    @PostMapping("/{id}/solicitar-colaborador")
    public ResponseEntity<UsuarioDTO> solicitarColaborador(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body) {
        try {
            String justificativa = body.getOrDefault("justificativa", "");
            return ResponseEntity.ok(usuarioService.solicitarColaborador(id, justificativa));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin lista solicitações pendentes
    @GetMapping("/solicitacoes/pendentes")
    public ResponseEntity<List<UsuarioDTO>> listarSolicitacoesPendentes() {
        return ResponseEntity.ok(usuarioService.listarSolicitacoesPendentes());
    }

    // Admin aprova colaborador
    @PutMapping("/solicitacoes/{id}/aprovar")
    public ResponseEntity<UsuarioDTO> aprovarColaborador(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.aprovarColaborador(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Instrutor solicita criação de jornada (não exige mudança de role)
    @PostMapping("/{id}/solicitar-jornada")
    public ResponseEntity<?> solicitarJornada(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        try {
            String payload = body.getOrDefault("justificativa", "");
            return ResponseEntity.ok(usuarioService.solicitarJornada(id, payload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin recusa colaborador
    @PutMapping("/solicitacoes/{id}/recusar")
    public ResponseEntity<UsuarioDTO> recusarColaborador(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.recusarColaborador(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint temporário para gerar hash BCrypt
    @GetMapping("/gerar-hash/{senha}")
    public ResponseEntity<String> gerarHash(@PathVariable String senha) {
        return ResponseEntity.ok(usuarioService.gerarHash(senha));
    }

    // GET curriculo do usuário autenticado
    @GetMapping("/curriculo")
    public ResponseEntity<Map<String, Object>> getCurriculo(Authentication auth) {
        Long id = (Long) auth.getCredentials();
        String data = usuarioService.getCurriculo(id);
        return ResponseEntity.ok(Map.of("curriculo", data));
    }

    // PUT curriculo do usuário autenticado
    @PutMapping("/curriculo")
    public ResponseEntity<Void> saveCurriculo(@RequestBody Map<String, String> body, Authentication auth) {
        Long id = (Long) auth.getCredentials();
        usuarioService.saveCurriculo(id, body.get("curriculo"));
        return ResponseEntity.ok().build();
    }

    // GET planejamento do usuário autenticado
    @GetMapping("/planejamento")
    public ResponseEntity<Map<String, Object>> getPlanejamento(Authentication auth) {
        Long id = (Long) auth.getCredentials();
        Map<String, Object> data = usuarioService.getPlanejamento(id);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    // PUT planejamento do usuário autenticado
    @PutMapping("/planejamento")
    public ResponseEntity<Void> savePlanejamento(@RequestBody Map<String, String> body, Authentication auth) {
        Long id = (Long) auth.getCredentials();
        usuarioService.savePlanejamento(id, body.get("cards"), body.get("cols"));
        return ResponseEntity.ok().build();
    }

    // Atualizar foto
    @PutMapping("/{id}/foto")
    public ResponseEntity<UsuarioDTO> atualizarFoto(@PathVariable Long id,
                                                     @RequestBody Map<String, String> fotoData) {
        try {
            return ResponseEntity.ok(usuarioService.atualizarFoto(id, fotoData.get("foto")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Atualizar perfil (nome, bio)
    @PutMapping("/{id}/perfil")
    public ResponseEntity<UsuarioDTO> atualizarPerfil(@PathVariable Long id,
                                                       @RequestBody Map<String, String> dados,
                                                       Authentication auth) {
        try {
            Long authId = (Long) auth.getCredentials();
            if (!authId.equals(id)) return ResponseEntity.status(403).build();
            return ResponseEntity.ok(usuarioService.atualizarPerfil(id, dados.get("nome"), dados.get("bio")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Dashboard do usuário - stats consolidadas + dados de aprendizado
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();

        long totalCursos = cursoRepository.countByAtivoTrueAndStatus("aprovado");
        long totalConcluidos = matriculaService.listarConcluidosPorUsuario(usuarioId).size();
        long certificados = certificadoService.listarPorUsuario(usuarioId).size();
        List<Matricula> matriculas = matriculaService.listarPorUsuario(usuarioId);
        long totalMatriculas = matriculas.size();

        // Study minutes = course duration * fraction of lessons actually completed
        int totalMinutos = matriculas.stream()
                .mapToInt(m -> {
                    int duracao = cursoRepository.findById(m.getCursoId())
                            .map(c -> c.getDuracao()).orElse(0);
                    long total = aulaRepository.countByCursoId(m.getCursoId());
                    if (total == 0) return 0;
                    long vistas = progressoAulaRepository
                            .countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, m.getCursoId());
                    return (int) Math.round(duracao * ((double) vistas / total));
                })
                .sum();

        // Cursos em progresso com detalhes de aulas
        List<Map<String, Object>> cursosDetalhes = matriculas.stream().map(m -> {
            var cursoOpt = cursoRepository.findById(m.getCursoId());
            if (cursoOpt.isEmpty()) return null;
            var curso = cursoOpt.get();

            long totalAulas = aulaRepository.countByCursoId(m.getCursoId());
            long aulasVistas = progressoAulaRepository
                    .countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, m.getCursoId());

            // Última aula concluída (mais recente)
            var progressoAulas = progressoAulaRepository
                    .findByUsuarioIdAndCursoId(usuarioId, m.getCursoId());
            var ultimaAulaConcluida = progressoAulas.stream()
                    .filter(p -> Boolean.TRUE.equals(p.getConcluido()) && p.getDataConclusao() != null)
                    .max(Comparator.comparing(p -> p.getDataConclusao()));

            // Próxima aula a assistir (primeira não concluída)
            Set<Long> aulasConcluidasIds = progressoAulas.stream()
                    .filter(p -> Boolean.TRUE.equals(p.getConcluido()))
                    .map(p -> p.getAulaId())
                    .collect(Collectors.toSet());
            List<Aula> todasAulas = aulaRepository.findByCursoIdOrderByOrdem(m.getCursoId());
            var proximaAula = todasAulas.stream()
                    .filter(a -> !aulasConcluidasIds.contains(a.getId()))
                    .findFirst();

            Map<String, Object> detalhe = new LinkedHashMap<>();
            detalhe.put("cursoId", curso.getId());
            detalhe.put("tituloCurso", curso.getTitulo());
            detalhe.put("categoria", curso.getCategoria() != null ? curso.getCategoria().getNome() : "");
            detalhe.put("imagem", curso.getImagem());
            detalhe.put("duracao", curso.getDuracao());
            detalhe.put("progresso", m.getProgresso());
            detalhe.put("concluido", m.getConcluido());
            detalhe.put("dataInscricao", m.getDataInscricao());
            detalhe.put("dataConclusao", m.getDataConclusao());
            detalhe.put("totalAulas", totalAulas);
            detalhe.put("aulasVistas", aulasVistas);
            ultimaAulaConcluida.ifPresent(p -> {
                aulaRepository.findById(p.getAulaId()).ifPresent(a -> {
                    detalhe.put("ultimaAulaId", a.getId());
                    detalhe.put("ultimaAulaTitulo", a.getTitulo());
                    detalhe.put("ultimaAulaOrdem", a.getOrdem());
                    detalhe.put("ultimaAtividade", p.getDataConclusao());
                });
            });
            // Fallback: if no lesson was ever completed, use enrollment date so the
            // course still appears in the "continue" sort and card.
            if (!detalhe.containsKey("ultimaAtividade") && m.getDataInscricao() != null) {
                detalhe.put("ultimaAtividade", m.getDataInscricao());
            }
            proximaAula.ifPresent(a -> {
                detalhe.put("proximaAulaId", a.getId());
                detalhe.put("proximaAulaTitulo", a.getTitulo());
                detalhe.put("proximaAulaOrdem", a.getOrdem());
            });
            return detalhe;
        }).filter(Objects::nonNull)
          .sorted(Comparator.comparing(
              d -> d.get("ultimaAtividade") == null ? "" : d.get("ultimaAtividade").toString(),
              Comparator.reverseOrder()))
          .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalCursos", totalCursos);
        response.put("cursosAcessados", totalMatriculas);
        response.put("matriculas", totalMatriculas);
        response.put("concluidos", totalConcluidos);
        response.put("certificados", certificados);
        response.put("totalMinutos", totalMinutos);
        response.put("cursosDetalhes", cursosDetalhes);
        return ResponseEntity.ok(response);
    }
}
