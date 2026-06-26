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

    @PostMapping("/imagem")
    public ResponseEntity<?> uploadImagem(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            return ResponseEntity.badRequest().body(Map.of("error", "Tipo não permitido: " + contentType));

        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
            String safeName = Paths.get(originalFilename).getFileName().toString();
            String ext = safeName.contains(".") ? safeName.substring(safeName.lastIndexOf(".")) : "";
            String nome = UUID.randomUUID().toString() + ext;

            Path dir = Paths.get(uploadDir, "imagens").toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path dest = dir.resolve(nome).normalize();

            if (!dest.startsWith(dir)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nome de arquivo inválido"));
            }

            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", "/uploads/imagens/" + nome));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro ao salvar arquivo: " + e.getMessage()));
        }
    }
}
