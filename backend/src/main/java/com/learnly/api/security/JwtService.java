package com.learnly.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    // Chave secreta - em produção usar variável de ambiente
    private static final String SECRET = "learnly-secret-key-2024-muito-segura-256bits!!";
    private static final long EXPIRATION = 86400000; // 24 horas em ms

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // Gera token com id, email e role do usuário
    public String gerarToken(Long id, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("id", id)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extrai email do token
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extrai role do token
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Extrai id do token - garante Long mesmo se JWT deserializar como Integer
    public Long getId(String token) {
        Object idObj = getClaims(token).get("id");
        if (idObj instanceof Integer) return ((Integer) idObj).longValue();
        if (idObj instanceof Long) return (Long) idObj;
        return Long.valueOf(String.valueOf(idObj));
    }

    // Valida se o token é válido
    public boolean validar(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
