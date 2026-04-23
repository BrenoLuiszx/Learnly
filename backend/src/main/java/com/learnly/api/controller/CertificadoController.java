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

    // Emite ou atualiza certificado (com ou sem upload de URL)
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

    // Lista meus certificados
    @GetMapping("/meus")
    public ResponseEntity<List<Certificado>> meusCertificados(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        return ResponseEntity.ok(certificadoService.listarPorUsuario(usuarioId));
    }

    // Cursos concluídos sem certificado emitido (disponíveis para emitir)
    @GetMapping("/disponiveis")
    public ResponseEntity<List<Map<String, Object>>> disponiveis(Authentication auth) {
        Long usuarioId = (Long) auth.getCredentials();
        return ResponseEntity.ok(certificadoService.cursosDisponiveisParaCertificado(usuarioId));
    }

    // Certificados públicos de um usuário (para empresas visualizarem)
    @GetMapping("/usuario/{usuarioId}/publicos")
    public ResponseEntity<List<Certificado>> certificadosPublicos(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(certificadoService.listarPublicosPorUsuario(usuarioId));
    }

    // Alterna visibilidade pública do certificado
    @PutMapping("/{id}/visibilidade")
    public ResponseEntity<Certificado> alternarVisibilidade(@PathVariable Long id, Authentication auth) {
        try {
            Long usuarioId = (Long) auth.getCredentials();
            return ResponseEntity.ok(certificadoService.alternarVisibilidade(id, usuarioId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
