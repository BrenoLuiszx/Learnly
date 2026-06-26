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

    @PostMapping("/cursos/{cursoId}")
    public ResponseEntity<Map<String, Object>> matricular(@PathVariable Long cursoId, Authentication auth) {
        return ResponseEntity.ok(matriculaService.matricular((Long) auth.getCredentials(), cursoId));
    }

    @GetMapping("/cursos/{cursoId}/status")
    public ResponseEntity<Map<String, Object>> status(@PathVariable Long cursoId, Authentication auth) {
        long total = matriculaService.totalMatriculadosCurso(cursoId);
        boolean matriculado = auth != null && auth.isAuthenticated()
                && matriculaService.isMatriculado((Long) auth.getCredentials(), cursoId);
        return ResponseEntity.ok(Map.of("matriculado", matriculado, "totalMatriculados", total));
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<Matricula>> minhasMatriculas(Authentication auth) {
        return ResponseEntity.ok(matriculaService.listarPorUsuario((Long) auth.getCredentials()));
    }

    @PutMapping("/cursos/{cursoId}/progresso")
    public ResponseEntity<Matricula> atualizarProgresso(@PathVariable Long cursoId,
                                                         @RequestBody Map<String, Number> body,
                                                         Authentication auth) {
        BigDecimal progresso = new BigDecimal(body.get("progresso").toString());
        return ResponseEntity.ok(matriculaService.atualizarProgresso((Long) auth.getCredentials(), cursoId, progresso));
    }
}
