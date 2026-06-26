package com.learnly.api.controller;

import com.learnly.api.dto.UsuarioDTO;
import com.learnly.api.enums.StatusCurso;
import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.AulaRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.ProgressoAulaRepository;
import com.learnly.api.model.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private MatriculaService matriculaService;
    @Autowired private CertificadoService certificadoService;
    @Autowired private AulaService aulaService;
    @Autowired private CursoRepository cursoRepository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private ProgressoAulaRepository progressoAulaRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listarUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(Map.of("message", "Learnly API funcionando",
                "total", usuarios.size(), "usuarios", usuarios));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> listarUsuariosAdmin() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(Map.of("message", "Learnly API funcionando",
                "total", usuarios.size(), "usuarios", usuarios));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.ok(usuarioService.registrar(usuario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        try {
            return ResponseEntity.ok(usuarioService.login(credentials.get("email"), credentials.get("senha")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email ou senha inválidos"));
        }
    }

    @PostMapping("/{id}/solicitar-colaborador")
    public ResponseEntity<UsuarioDTO> solicitarColaborador(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(usuarioService.solicitarColaborador(id, body.getOrDefault("justificativa", "")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/solicitacoes/pendentes")
    public ResponseEntity<List<UsuarioDTO>> listarSolicitacoesPendentes() {
        return ResponseEntity.ok(usuarioService.listarSolicitacoesPendentes());
    }

    @PutMapping("/solicitacoes/{id}/aprovar")
    public ResponseEntity<UsuarioDTO> aprovarColaborador(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.aprovarColaborador(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/solicitar-jornada")
    public ResponseEntity<?> solicitarJornada(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(usuarioService.solicitarColaborador(id, body.getOrDefault("justificativa", "")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/solicitacoes/{id}/recusar")
    public ResponseEntity<UsuarioDTO> recusarColaborador(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.recusarColaborador(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/gerar-hash/{senha}")
    public ResponseEntity<String> gerarHash(@PathVariable String senha) {
        return ResponseEntity.ok(usuarioService.gerarHash(senha));
    }

    @GetMapping("/curriculo")
    public ResponseEntity<Map<String, Object>> getCurriculo(Authentication auth) {
        return ResponseEntity.ok(Map.of("curriculo", usuarioService.getCurriculo((Long) auth.getCredentials())));
    }

    @PutMapping("/curriculo")
    public ResponseEntity<Void> saveCurriculo(@RequestBody Map<String, String> body, Authentication auth) {
        usuarioService.saveCurriculo((Long) auth.getCredentials(), body.get("curriculo"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/planejamento")
    public ResponseEntity<Map<String, Object>> getPlanejamento(Authentication auth) {
        Map<String, Object> data = usuarioService.getPlanejamento((Long) auth.getCredentials());
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @PutMapping("/planejamento")
    public ResponseEntity<Void> savePlanejamento(@RequestBody Map<String, String> body, Authentication auth) {
        usuarioService.savePlanejamento((Long) auth.getCredentials(), body.get("cards"), body.get("cols"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/foto")
    public ResponseEntity<UsuarioDTO> atualizarFoto(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(usuarioService.atualizarFoto(id, body.get("foto")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/perfil")
    public ResponseEntity<UsuarioDTO> atualizarPerfil(@PathVariable Long id,
                                                       @RequestBody Map<String, String> dados,
                                                       Authentication auth) {
        try {
            if (!((Long) auth.getCredentials()).equals(id)) return ResponseEntity.status(403).build();
            return ResponseEntity.ok(usuarioService.atualizarPerfil(id, dados.get("nome"), dados.get("bio")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        List<Matricula> matriculas = matriculaService.listarPorUsuario(usuarioId);

        int totalMinutos = matriculas.stream().mapToInt(m -> {
            int duracao = cursoRepository.findById(m.getCursoId()).map(c -> c.getDuracao()).orElse(0);
            long total = aulaRepository.countByCursoId(m.getCursoId());
            if (total == 0) return 0;
            long vistas = progressoAulaRepository.countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, m.getCursoId());
            return (int) Math.round(duracao * ((double) vistas / total));
        }).sum();

        List<Map<String, Object>> cursosDetalhes = matriculas.stream()
                .map(m -> buildDetalhe(m, usuarioId))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(
                        d -> d.get("ultimaAtividade") == null ? "" : d.get("ultimaAtividade").toString(),
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalCursos", cursoRepository.countByAtivoTrueAndStatus(StatusCurso.APROVADO));
        response.put("cursosAcessados", matriculas.size());
        response.put("matriculas", matriculas.size());
        response.put("concluidos", matriculaService.listarConcluidosPorUsuario(usuarioId).size());
        response.put("certificados", certificadoService.listarPorUsuario(usuarioId).size());
        response.put("totalMinutos", totalMinutos);
        response.put("cursosDetalhes", cursosDetalhes);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildDetalhe(Matricula m, Long usuarioId) {
        var cursoOpt = cursoRepository.findById(m.getCursoId());
        if (cursoOpt.isEmpty()) return null;
        var curso = cursoOpt.get();

        long totalAulas  = aulaRepository.countByCursoId(m.getCursoId());
        long aulasVistas = progressoAulaRepository.countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, m.getCursoId());

        var progressoAulas = progressoAulaRepository.findByUsuarioIdAndCursoId(usuarioId, m.getCursoId());

        
        var ultimaConcluida = progressoAulas.stream()
                .filter(p -> Boolean.TRUE.equals(p.getConcluido()) && p.getDataConclusao() != null)
                .max(Comparator.comparing(p -> p.getDataConclusao()));

        Set<Long> concluidasIds = progressoAulas.stream()
                .filter(p -> Boolean.TRUE.equals(p.getConcluido()))
                .map(p -> p.getAulaId())
                .collect(Collectors.toSet());

        List<Aula> todasAulas = aulaRepository.findByCursoIdOrderByOrdem(m.getCursoId());

       
        var proxima = todasAulas.stream()
                .filter(a -> !concluidasIds.contains(a.getId()))
                .findFirst();

        Map<String, Object> d = new LinkedHashMap<>();
        d.put("cursoId", curso.getId());
        d.put("tituloCurso", curso.getTitulo());
        d.put("categoria", curso.getCategoria() != null ? curso.getCategoria().getNome() : "");
        d.put("imagem", curso.getImagem());
        d.put("duracao", curso.getDuracao());
        d.put("progresso", m.getProgresso());
        d.put("concluido", m.getConcluido());
        d.put("dataInscricao", m.getDataInscricao());
        d.put("dataConclusao", m.getDataConclusao());
        d.put("totalAulas", totalAulas);
        d.put("aulasVistas", aulasVistas);

        ultimaConcluida.ifPresent(p -> aulaRepository.findById(p.getAulaId()).ifPresent(a -> {
            d.put("ultimaAulaId", a.getId());
            d.put("ultimaAulaTitulo", a.getTitulo());
            d.put("ultimaAulaOrdem", a.getOrdem());
            d.put("ultimaAtividade", p.getDataConclusao());
        }));

        if (!d.containsKey("ultimaAtividade") && m.getDataInscricao() != null)
            d.put("ultimaAtividade", m.getDataInscricao());

        proxima.ifPresent(a -> {
            d.put("proximaAulaId", a.getId());
            d.put("proximaAulaTitulo", a.getTitulo());
            d.put("proximaAulaOrdem", a.getOrdem());
        });

        return d;
    }
}
