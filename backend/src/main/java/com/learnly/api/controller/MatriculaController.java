package com.learnly.api.controller;

import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.service.MatriculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaService matriculaService;

    /** POST /api/matriculas/cursos/{cursoId} — matricula o usuário autenticado no curso */
    @PostMapping("/cursos/{cursoId}")
    public ResponseEntity<Map<String, Object>> matricular(@PathVariable Long cursoId, Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        return ResponseEntity.ok(matriculaService.matricular(usuarioId, cursoId));
    }

    /** GET /api/matriculas/cursos/{cursoId}/status — verifica se o usuário está matriculado.
     *  Público: retorna totalMatriculados para todos.
     *  Autenticado: também retorna o flag pessoal 'matriculado'. */
    @GetMapping("/cursos/{cursoId}/status")
    public ResponseEntity<Map<String, Object>> status(@PathVariable Long cursoId, Authentication auth) {
        long total = matriculaService.totalMatriculadosCurso(cursoId);
        boolean matriculado = false;
        if (auth != null && auth.isAuthenticated()) {
            Long usuarioId = (Long) auth.getCredentials();
            matriculado = matriculaService.isMatriculado(usuarioId, cursoId);
        }
        return ResponseEntity.ok(Map.of("matriculado", matriculado, "totalMatriculados", total));
    }

    /** GET /api/matriculas/minhas — lista todas as matrículas do usuário */
    @GetMapping("/minhas")
    public ResponseEntity<List<Matricula>> minhasMatriculas(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        return ResponseEntity.ok(matriculaService.listarPorUsuario(usuarioId));
    }

    /** PUT /api/matriculas/cursos/{cursoId}/progresso — atualiza progresso */
    @PutMapping("/cursos/{cursoId}/progresso")
    public ResponseEntity<Matricula> atualizarProgresso(@PathVariable Long cursoId,
                                                         @RequestBody Map<String, Number> body,
                                                         Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        BigDecimal progresso = new BigDecimal(body.get("progresso").toString());
        return ResponseEntity.ok(matriculaService.atualizarProgresso(usuarioId, cursoId, progresso));
    }
}
