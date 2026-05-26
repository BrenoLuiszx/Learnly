package com.learnly.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;

@RestController
public class ServeFileController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/uploads/**")
    public ResponseEntity<ResourceRegion> serveFile(
            @RequestHeader HttpHeaders headers,
            jakarta.servlet.http.HttpServletRequest request) throws IOException {

        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String withoutContext = uri.startsWith(contextPath) ? uri.substring(contextPath.length()) : uri;
        String path = withoutContext.replaceFirst("^/uploads/", "");

        Resource resource = new FileSystemResource(
                Paths.get(uploadDir).toAbsolutePath().resolve(path).normalize().toFile()
        );

        if (!resource.exists()) return ResponseEntity.notFound().build();

        long contentLength = resource.contentLength();
        HttpRange range = headers.getRange().isEmpty() ? null : headers.getRange().get(0);

        ResourceRegion region;
        if (range != null) {
            long start = range.getRangeStart(contentLength);
            long end   = range.getRangeEnd(contentLength);
            long rangeLength = Math.min(2 * 1024 * 1024L, end - start + 1);
            region = new ResourceRegion(resource, start, rangeLength);
        } else {
            long rangeLength = Math.min(2 * 1024 * 1024L, contentLength);
            region = new ResourceRegion(resource, 0, rangeLength);
        }

        String filename = path.toLowerCase();
        MediaType mediaType = filename.endsWith(".webm") ? MediaType.parseMediaType("video/webm")
                : filename.endsWith(".ogg")  ? MediaType.parseMediaType("video/ogg")
                : filename.endsWith(".mov")  ? MediaType.parseMediaType("video/quicktime")
                : filename.endsWith(".png")  ? MediaType.IMAGE_PNG
                : filename.endsWith(".jpg") || filename.endsWith(".jpeg") ? MediaType.IMAGE_JPEG
                : filename.endsWith(".webp") ? MediaType.parseMediaType("image/webp")
                : filename.endsWith(".gif")  ? MediaType.IMAGE_GIF
                : MediaType.parseMediaType("video/mp4");

        return ResponseEntity.status(range != null ? HttpStatus.PARTIAL_CONTENT : HttpStatus.OK)
                .contentType(mediaType)
                .body(region);
    }
}
