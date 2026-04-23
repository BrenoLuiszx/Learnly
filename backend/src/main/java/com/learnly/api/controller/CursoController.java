package com.learnly.api.controller;

import com.learnly.api.dto.CursoDTO;
import com.learnly.api.dto.CursoDetalhadoDTO;
import com.learnly.api.model.service.CursoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    // Listagem pública - apenas aprovados
    @GetMapping
    public ResponseEntity<List<CursoDTO>> listarCursos() {
        return ResponseEntity.ok(cursoService.listarTodos());
    }

    // Admin - lista cursos pendentes de aprovação
    @GetMapping("/pendentes")
    public ResponseEntity<List<CursoDTO>> listarPendentes() {
        return ResponseEntity.ok(cursoService.listarPendentes());
    }

    // Colaborador - lista seus próprios cursos
    @GetMapping("/meus")
    public ResponseEntity<List<CursoDTO>> meusCursos(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        return ResponseEntity.ok(cursoService.listarPorCriador(usuarioId));
    }

    // Criar curso - admin aprova direto, colaborador fica pendente
    @PostMapping
    public ResponseEntity<?> criarCurso(@RequestBody CursoDTO cursoDTO, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            String role = auth.getAuthorities().iterator().next()
                    .getAuthority().replace("ROLE_", "").toLowerCase();
            return ResponseEntity.ok(cursoService.criar(cursoDTO, usuarioId, role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Atualizar curso
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarCurso(@PathVariable Long id,
                                             @RequestBody CursoDTO cursoDTO,
                                             Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            String role = auth.getAuthorities().iterator().next()
                    .getAuthority().replace("ROLE_", "").toLowerCase();
            return ResponseEntity.ok(cursoService.atualizar(id, cursoDTO, usuarioId, role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin - aprovar curso
    @PutMapping("/{id}/aprovar")
    public ResponseEntity<CursoDTO> aprovarCurso(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cursoService.aprovarCurso(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin - rejeitar curso
    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<CursoDTO> rejeitarCurso(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cursoService.rejeitarCurso(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletarCurso(@PathVariable Long id) {
        try {
            cursoService.deletar(id);
            return ResponseEntity.ok(Map.of("message", "Curso deletado com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Curso não encontrado"));
        }
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<CursoDTO>> buscarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(cursoService.buscarPorCategoria(categoria));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<CursoDTO>> buscarPorTitulo(@RequestParam(required = false) String titulo) {
        return ResponseEntity.ok(cursoService.buscarPorTitulo(titulo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoDetalhadoDTO> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cursoService.buscarDetalhadoPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
