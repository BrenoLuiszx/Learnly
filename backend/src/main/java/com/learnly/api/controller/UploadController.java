package com.learnly.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        return salvar(file, "videos", new String[]{"video/mp4", "video/webm", "video/quicktime", "video/ogg"});
    }

    @PostMapping("/imagem")
    public ResponseEntity<?> uploadImagem(@RequestParam("file") MultipartFile file) {
        return salvar(file, "imagens", new String[]{"image/jpeg", "image/png", "image/webp", "image/gif"});
    }

    private ResponseEntity<?> salvar(MultipartFile file, String subdir, String[] tiposPermitidos) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));

        String contentType = file.getContentType();
        boolean tipoValido = false;
        for (String t : tiposPermitidos) { if (t.equals(contentType)) { tipoValido = true; break; } }
        if (!tipoValido) return ResponseEntity.badRequest().body(Map.of("error", "Tipo não permitido: " + contentType));

        try {
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                    : "";
            String nome = UUID.randomUUID().toString() + ext;
            Path dir = Paths.get(uploadDir, subdir);
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(nome), StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/" + subdir + "/" + nome;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro ao salvar arquivo: " + e.getMessage()));
        }
    }
}
