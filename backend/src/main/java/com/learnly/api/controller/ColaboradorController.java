package com.learnly.api.controller;

import com.learnly.api.dto.AvaliacaoDTO;
import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.entity.ProgressoAula;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.AulaRepository;
import com.learnly.api.model.repository.AvaliacaoRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.MatriculaRepository;
import com.learnly.api.model.repository.ProgressoAulaRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import com.learnly.api.model.service.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Backward-compatible alias for {@link InstrutorController}.
 * Collaborator role == Instructor role. Both paths are fully functional.
 */
@RestController
@RequestMapping("/api/colaborador")
public class ColaboradorController {

    @Autowired private CursoService cursoService;
    @Autowired private CursoRepository cursoRepository;
    @Autowired private MatriculaRepository matriculaRepository;
    @Autowired private ProgressoAulaRepository progressoAulaRepository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private AvaliacaoRepository avaliacaoRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/cursos/{cursoId}/alunos")
    public ResponseEntity<?> alunosDoCurso(@PathVariable Long cursoId, Authentication auth) {
        Long colaboradorId = (Long) auth.getCredentials();

        var curso = cursoRepository.findById(cursoId).orElse(null);
        if (curso == null) return ResponseEntity.notFound().build();
        if (!isAdmin(auth) && !cursoService.isOwner(curso, colaboradorId)) return ResponseEntity.status(403).build();

        List<Aula> aulas = aulaRepository.findByCursoIdOrderByOrdem(cursoId);
        List<Matricula> matriculas = matriculaRepository.findByCursoId(cursoId);

        List<Map<String, Object>> resultado = matriculas.stream().map(m -> {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(m.getUsuarioId());
            String nome = usuarioOpt.map(Usuario::getNome).orElse("Aluno");

            List<ProgressoAula> progresso = progressoAulaRepository
                    .findByUsuarioIdAndCursoId(m.getUsuarioId(), cursoId);

            Set<Long> concluidasIds = progresso.stream()
                    .filter(ProgressoAula::getConcluido)
                    .map(ProgressoAula::getAulaId)
                    .collect(Collectors.toSet());

            List<Map<String, Object>> aulasProgresso = aulas.stream().map(a -> {
                Map<String, Object> ap = new LinkedHashMap<>();
                ap.put("aulaId", a.getId());
                ap.put("titulo", a.getTitulo());
                ap.put("ordem", a.getOrdem());
                ap.put("concluida", concluidasIds.contains(a.getId()));
                return ap;
            }).collect(Collectors.toList());

            Map<String, Object> aluno = new LinkedHashMap<>();
            aluno.put("nome", nome);
            aluno.put("progresso", m.getProgresso());
            aluno.put("concluido", m.getConcluido());
            aluno.put("dataInscricao", m.getDataInscricao());
            aluno.put("aulas", aulasProgresso);
            return aluno;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "totalAlunos", resultado.size(),
            "totalAulas", aulas.size(),
            "alunos", resultado
        ));
    }

    @GetMapping("/cursos/{cursoId}/avaliacoes")
    public ResponseEntity<?> avaliacoesDoCurso(@PathVariable Long cursoId, Authentication auth) {
        Long colaboradorId = (Long) auth.getCredentials();

        var curso = cursoRepository.findById(cursoId).orElse(null);
        if (curso == null) return ResponseEntity.notFound().build();
        if (!isAdmin(auth) && !cursoService.isOwner(curso, colaboradorId)) return ResponseEntity.status(403).build();

        List<AvaliacaoDTO> avaliacoes = avaliacaoRepository.findByCursoIdWithUsuario(cursoId);
        Double media = avaliacaoRepository.mediaNotaPorCurso(cursoId);

        return ResponseEntity.ok(Map.of(
            "media", media != null ? Math.round(media * 10.0) / 10.0 : 0.0,
            "total", avaliacoes.size(),
            "avaliacoes", avaliacoes
        ));
    }
}
