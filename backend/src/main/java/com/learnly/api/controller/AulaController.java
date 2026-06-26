package com.learnly.api.controller;

import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.ProgressoAula;
import com.learnly.api.model.service.AulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aulas")
public class AulaController {

    @Autowired
    private AulaService aulaService;

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Aula>> listarPorCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(aulaService.listarPorCurso(cursoId));
    }

    @PostMapping("/curso/{cursoId}")
    public ResponseEntity<?> salvarAulas(@PathVariable Long cursoId, @RequestBody List<Aula> aulas) {
        if (aulas == null || aulas.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Lista de aulas vazia"));
        try {
            return ResponseEntity.ok(aulaService.salvarAulas(cursoId, aulas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{aulaId}/concluir")
    public ResponseEntity<?> concluir(@PathVariable Long aulaId, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            return ResponseEntity.ok(aulaService.toggleAula(usuarioId, aulaId, true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{aulaId}/desconcluir")
    public ResponseEntity<?> desconcluir(@PathVariable Long aulaId, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            return ResponseEntity.ok(aulaService.toggleAula(usuarioId, aulaId, false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/curso/{cursoId}/progresso")
    public ResponseEntity<?> progresso(@PathVariable Long cursoId, Authentication auth) {
        if (auth == null || auth.getCredentials() == null) return ResponseEntity.ok(List.of());
        try {
            return ResponseEntity.ok(aulaService.progressoPorCurso((Long) auth.getCredentials(), cursoId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/curso/{cursoId}/percentual")
    public ResponseEntity<?> percentual(@PathVariable Long cursoId, Authentication auth) {
        if (auth == null || auth.getCredentials() == null)
            return ResponseEntity.ok(Map.of("total", 0, "concluidas", 0, "percentual", 0));
        try {
            return ResponseEntity.ok(aulaService.percentualConclusao((Long) auth.getCredentials(), cursoId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
