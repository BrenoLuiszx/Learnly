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

    // Lista aulas de um curso (público)
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Aula>> listarPorCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(aulaService.listarPorCurso(cursoId));
    }

    // Salva/substitui aulas de um curso (admin/colaborador)
    @PostMapping("/curso/{cursoId}")
    public ResponseEntity<?> salvarAulas(@PathVariable Long cursoId,
                                         @RequestBody List<Aula> aulas) {
        try {
            System.out.println("[AulaController] Recebida requisição para salvar aulas do curso: " + cursoId);
            System.out.println("[AulaController] Quantidade de aulas recebidas: " + (aulas != null ? aulas.size() : 0));
            
            if (aulas == null || aulas.isEmpty()) {
                System.out.println("[AulaController] ERRO: Lista de aulas vazia");
                return ResponseEntity.badRequest().body(Map.of("error", "Lista de aulas vazia"));
            }
            
            List<Aula> aulasGravadas = aulaService.salvarAulas(cursoId, aulas);
            System.out.println("[AulaController] Aulas gravadas com sucesso: " + aulasGravadas.size());
            return ResponseEntity.ok(aulasGravadas);
        } catch (Exception e) {
            System.err.println("[AulaController] ERRO ao salvar aulas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Marcar aula como concluída
    @PostMapping("/{aulaId}/concluir")
    public ResponseEntity<?> concluir(@PathVariable Long aulaId, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            if (usuarioId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuário não autenticado"));
            }
            return ResponseEntity.ok(aulaService.toggleAula(usuarioId, aulaId, true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Desmarcar aula como concluída
    @PostMapping("/{aulaId}/desconcluir")
    public ResponseEntity<?> desconcluir(@PathVariable Long aulaId, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            if (usuarioId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuário não autenticado"));
            }
            return ResponseEntity.ok(aulaService.toggleAula(usuarioId, aulaId, false));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Progresso do usuário nas aulas de um curso
    @GetMapping("/curso/{cursoId}/progresso")
    public ResponseEntity<?> progresso(@PathVariable Long cursoId, Authentication auth) {
        if (auth == null || auth.getCredentials() == null) {
            return ResponseEntity.ok(List.of());
        }
        try {
            Long usuarioId = (Long) auth.getCredentials();
            return ResponseEntity.ok(aulaService.progressoPorCurso(usuarioId, cursoId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Percentual de conclusão do curso por aulas
    @GetMapping("/curso/{cursoId}/percentual")
    public ResponseEntity<?> percentual(@PathVariable Long cursoId, Authentication auth) {
        if (auth == null || auth.getCredentials() == null) {
            return ResponseEntity.ok(Map.of("total", 0, "concluidas", 0, "percentual", 0));
        }
        try {
            Long usuarioId = (Long) auth.getCredentials();
            return ResponseEntity.ok(aulaService.percentualConclusao(usuarioId, cursoId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
