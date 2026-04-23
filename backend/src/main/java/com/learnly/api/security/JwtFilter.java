package com.learnly.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class    JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtService.validar(token)) {
                String email = jwtService.getEmail(token);
                String role = jwtService.getRole(token);
                Long id = jwtService.getId(token);

                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                var auth = new UsernamePasswordAuthenticationToken(email, id, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                // Token present but invalid/expired — respond 401 immediately.
                // Without this, Spring's ExceptionTranslationFilter calls the
                // AuthenticationEntryPoint even on permitAll() routes when the
                // SecurityContext has no authentication object.
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token inválido ou expirado\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
