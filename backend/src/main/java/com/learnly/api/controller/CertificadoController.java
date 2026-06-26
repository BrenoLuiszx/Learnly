package com.learnly.api.controller;

import com.learnly.api.model.entity.Certificado;
import com.learnly.api.model.service.CertificadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificados")
public class CertificadoController {

    @Autowired
    private CertificadoService certificadoService;

    @PostMapping("/cursos/{cursoId}")
    public ResponseEntity<Certificado> emitir(@PathVariable Long cursoId,
                                               @RequestBody(required = false) Map<String, String> body,
                                               Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            String urlUpload = body != null ? body.get("urlCertificado") : null;
            return ResponseEntity.ok(certificadoService.emitir(usuarioId, cursoId, urlUpload));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Certificado>> meusCertificados(Authentication auth) {
        return ResponseEntity.ok(certificadoService.listarPorUsuario((Long) auth.getCredentials()));
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Map<String, Object>>> disponiveis(Authentication auth) {
        return ResponseEntity.ok(certificadoService.cursosDisponiveisParaCertificado((Long) auth.getCredentials()));
    }

    @GetMapping("/usuario/{usuarioId}/publicos")
    public ResponseEntity<List<Certificado>> certificadosPublicos(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(certificadoService.listarPublicosPorUsuario(usuarioId));
    }

    @PutMapping("/{id}/visibilidade")
    public ResponseEntity<Certificado> alternarVisibilidade(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(certificadoService.alternarVisibilidade(id, (Long) auth.getCredentials()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/detalhes")
    public ResponseEntity<Map<String, Object>> detalhes(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(certificadoService.detalhesCertificado(id, (Long) auth.getCredentials()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/cursos/{cursoId}/emitir-detalhes")
    public ResponseEntity<Map<String, Object>> emitirDetalhes(@PathVariable Long cursoId, Authentication auth) {
        try {
            return ResponseEntity.ok(certificadoService.emitirERetornarDetalhes((Long) auth.getCredentials(), cursoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
