package com.learnly.api.controller;

import com.learnly.api.dto.AvaliacaoDTO;
import com.learnly.api.model.entity.Avaliacao;
import com.learnly.api.model.service.AvaliacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    @PostMapping("/cursos/{cursoId}")
    public ResponseEntity<Avaliacao> avaliar(@PathVariable Long cursoId,
                                              @RequestBody Map<String, Object> body,
                                              Authentication auth) {
        try {
            String email = (String) auth.getPrincipal();
            Integer nota = (Integer) body.get("nota");
            String comentario = (String) body.getOrDefault("comentario", "");
            return ResponseEntity.ok(avaliacaoService.salvarPorEmail(email, cursoId, nota, comentario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/cursos/{cursoId}")
    public ResponseEntity<List<AvaliacaoDTO>> listarPorCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(avaliacaoService.listarPorCurso(cursoId));
    }

    @GetMapping("/cursos/{cursoId}/minha")
    public ResponseEntity<Avaliacao> minhaAvaliacao(@PathVariable Long cursoId, Authentication auth) {
        String email = (String) auth.getPrincipal();
        Avaliacao av = avaliacaoService.buscarDoUsuarioPorEmail(email, cursoId);
        return av != null ? ResponseEntity.ok(av) : ResponseEntity.noContent().build();
    }
}
