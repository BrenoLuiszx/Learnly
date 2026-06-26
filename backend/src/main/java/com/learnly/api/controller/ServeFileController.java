package com.learnly.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class ServeFileController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/uploads/imagens/**")
    public ResponseEntity<Resource> serveImagem(jakarta.servlet.http.HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        String filename = uri.replaceFirst("^.*/uploads/imagens/", "");

        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        Path base = Paths.get(uploadDir, "imagens").toAbsolutePath().normalize();
        Path resolved = base.resolve(filename).normalize();

        if (!resolved.startsWith(base)) {
            return ResponseEntity.status(403).build();
        }

        Resource resource = new FileSystemResource(resolved.toFile());
        if (!resource.exists()) return ResponseEntity.notFound().build();

        String lower = filename.toLowerCase(java.util.Locale.ROOT);
        MediaType mediaType = lower.endsWith(".png")  ? MediaType.IMAGE_PNG
                : lower.endsWith(".gif")              ? MediaType.IMAGE_GIF
                : lower.endsWith(".webp")             ? MediaType.parseMediaType("image/webp")
                : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }
}
