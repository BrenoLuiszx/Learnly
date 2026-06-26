package com.learnly.api.controller;

import com.learnly.api.model.service.CursoAcaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/acoes")
public class CursoAcaoController {

    @Autowired
    private CursoAcaoService cursoAcaoService;

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isColaborador(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COLABORADOR"));
    }

    @PostMapping("/favoritos/{cursoId}")
    public ResponseEntity<Map<String, Object>> toggleFavorito(@PathVariable Long cursoId, Authentication auth) {
        boolean ativo = cursoAcaoService.toggleFavorito((Long) auth.getCredentials(), cursoId);
        return ResponseEntity.ok(Map.of("favorito", ativo, "cursoId", cursoId));
    }

    @GetMapping("/favoritos/meus")
    public ResponseEntity<Map<String, Object>> meusFavoritos(Authentication auth) {
        Set<Long> ids = cursoAcaoService.favoritosPorUsuario((Long) auth.getCredentials());
        return ResponseEntity.ok(Map.of("favoritos", ids));
    }

    @GetMapping("/favoritos/status/{cursoId}")
    public ResponseEntity<Map<String, Object>> statusFavorito(@PathVariable Long cursoId, Authentication auth) {
        boolean ativo = cursoAcaoService.isFavorito((Long) auth.getCredentials(), cursoId);
        return ResponseEntity.ok(Map.of("favorito", ativo, "cursoId", cursoId));
    }

    @GetMapping("/favoritos/curso/{cursoId}")
    public ResponseEntity<List<Map<String, Object>>> favoritosPorCurso(@PathVariable Long cursoId, Authentication auth) {
        if (!isAdmin(auth) && !isColaborador(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.favoritosPorCurso(cursoId));
    }

    @GetMapping("/favoritos/todos")
    public ResponseEntity<List<Map<String, Object>>> todosFavoritos(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.todosFavoritos());
    }

    @PostMapping("/assistir-depois/{cursoId}")
    public ResponseEntity<Map<String, Object>> toggleAssistirDepois(@PathVariable Long cursoId, Authentication auth) {
        boolean ativo = cursoAcaoService.toggleAssistirDepois((Long) auth.getCredentials(), cursoId);
        return ResponseEntity.ok(Map.of("assistirDepois", ativo, "cursoId", cursoId));
    }

    @GetMapping("/assistir-depois/meus")
    public ResponseEntity<Map<String, Object>> meusAssistirDepois(Authentication auth) {
        Set<Long> ids = cursoAcaoService.assistirDepoisPorUsuario((Long) auth.getCredentials());
        return ResponseEntity.ok(Map.of("assistirDepois", ids));
    }

    @GetMapping("/assistir-depois/status/{cursoId}")
    public ResponseEntity<Map<String, Object>> statusAssistirDepois(@PathVariable Long cursoId, Authentication auth) {
        boolean ativo = cursoAcaoService.isAssistirDepois((Long) auth.getCredentials(), cursoId);
        return ResponseEntity.ok(Map.of("assistirDepois", ativo, "cursoId", cursoId));
    }

    @GetMapping("/assistir-depois/curso/{cursoId}")
    public ResponseEntity<List<Map<String, Object>>> assistirDepoisPorCurso(@PathVariable Long cursoId, Authentication auth) {
        if (!isAdmin(auth) && !isColaborador(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.assistirDepoisPorCurso(cursoId));
    }

    @GetMapping("/assistir-depois/todos")
    public ResponseEntity<List<Map<String, Object>>> todosAssistirDepois(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.todosAssistirDepois());
    }
}
