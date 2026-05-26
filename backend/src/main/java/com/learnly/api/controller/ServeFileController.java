package com.learnly.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;

@RestController
public class ServeFileController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/uploads/imagens/**")
    public ResponseEntity<Resource> serveImagem(jakarta.servlet.http.HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        String path = uri.replaceFirst("^.*/uploads/imagens/", "");

        Resource resource = new FileSystemResource(
                Paths.get(uploadDir, "imagens").toAbsolutePath().resolve(path).normalize().toFile()
        );

        if (!resource.exists()) return ResponseEntity.notFound().build();

        String filename = path.toLowerCase();
        MediaType mediaType = filename.endsWith(".png")  ? MediaType.IMAGE_PNG
                : filename.endsWith(".gif")              ? MediaType.IMAGE_GIF
                : filename.endsWith(".webp")             ? MediaType.parseMediaType("image/webp")
                : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }
}
