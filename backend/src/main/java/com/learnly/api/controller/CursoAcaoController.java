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
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isColaborador(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COLABORADOR"));
    }

    // ── Favorites ────────────────────────────────────────────────

    /** POST /api/acoes/favoritos/{cursoId} — toggle favorite for authenticated user */
    @PostMapping("/favoritos/{cursoId}")
    public ResponseEntity<Map<String, Object>> toggleFavorito(
            @PathVariable Long cursoId, Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        boolean ativo = cursoAcaoService.toggleFavorito(usuarioId, cursoId);
        return ResponseEntity.ok(Map.of("favorito", ativo, "cursoId", cursoId));
    }

    /** GET /api/acoes/favoritos/meus — set of course IDs favorited by the user */
    @GetMapping("/favoritos/meus")
    public ResponseEntity<Map<String, Object>> meusFavoritos(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        Set<Long> ids = cursoAcaoService.favoritosPorUsuario(usuarioId);
        return ResponseEntity.ok(Map.of("favoritos", ids));
    }

    /** GET /api/acoes/favoritos/status/{cursoId} — is this course favorited by the user? */
    @GetMapping("/favoritos/status/{cursoId}")
    public ResponseEntity<Map<String, Object>> statusFavorito(
            @PathVariable Long cursoId, Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        boolean ativo = cursoAcaoService.isFavorito(usuarioId, cursoId);
        return ResponseEntity.ok(Map.of("favorito", ativo, "cursoId", cursoId));
    }

    /** GET /api/acoes/favoritos/curso/{cursoId} — who favorited this course (admin/colaborador) */
    @GetMapping("/favoritos/curso/{cursoId}")
    public ResponseEntity<List<Map<String, Object>>> favoritosPorCurso(
            @PathVariable Long cursoId, Authentication auth) {
        if (!isAdmin(auth) && !isColaborador(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.favoritosPorCurso(cursoId));
    }

    /** GET /api/acoes/favoritos/todos — all favorites on the platform (admin only) */
    @GetMapping("/favoritos/todos")
    public ResponseEntity<List<Map<String, Object>>> todosFavoritos(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.todosFavoritos());
    }

    // ── Watch Later ───────────────────────────────────────────────

    /** POST /api/acoes/assistir-depois/{cursoId} — toggle watch later */
    @PostMapping("/assistir-depois/{cursoId}")
    public ResponseEntity<Map<String, Object>> toggleAssistirDepois(
            @PathVariable Long cursoId, Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        boolean ativo = cursoAcaoService.toggleAssistirDepois(usuarioId, cursoId);
        return ResponseEntity.ok(Map.of("assistirDepois", ativo, "cursoId", cursoId));
    }

    /** GET /api/acoes/assistir-depois/meus — set of course IDs saved for later */
    @GetMapping("/assistir-depois/meus")
    public ResponseEntity<Map<String, Object>> meusAssistirDepois(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        Set<Long> ids = cursoAcaoService.assistirDepoisPorUsuario(usuarioId);
        return ResponseEntity.ok(Map.of("assistirDepois", ids));
    }

    /** GET /api/acoes/assistir-depois/status/{cursoId} — is this course saved for later? */
    @GetMapping("/assistir-depois/status/{cursoId}")
    public ResponseEntity<Map<String, Object>> statusAssistirDepois(
            @PathVariable Long cursoId, Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        boolean ativo = cursoAcaoService.isAssistirDepois(usuarioId, cursoId);
        return ResponseEntity.ok(Map.of("assistirDepois", ativo, "cursoId", cursoId));
    }

    /** GET /api/acoes/assistir-depois/curso/{cursoId} — who saved this course (admin/colaborador) */
    @GetMapping("/assistir-depois/curso/{cursoId}")
    public ResponseEntity<List<Map<String, Object>>> assistirDepoisPorCurso(
            @PathVariable Long cursoId, Authentication auth) {
        if (!isAdmin(auth) && !isColaborador(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.assistirDepoisPorCurso(cursoId));
    }

    /** GET /api/acoes/assistir-depois/todos — all watch-later on the platform (admin only) */
    @GetMapping("/assistir-depois/todos")
    public ResponseEntity<List<Map<String, Object>>> todosAssistirDepois(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(cursoAcaoService.todosAssistirDepois());
    }
}
