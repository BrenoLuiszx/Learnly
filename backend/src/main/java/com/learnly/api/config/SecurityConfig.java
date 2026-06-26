package com.learnly.api.config;

import com.learnly.api.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, ex) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write("{\"error\":\"Não autenticado\"}");
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedEntryPoint()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/favicon.ico", "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/upload/**").hasAnyRole("ADMIN", "COLABORADOR")
                .requestMatchers(HttpMethod.POST, "/api/usuarios/login", "/api/usuarios/registrar").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/usuarios").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/api/cursos", "/api/cursos/categorias", "/api/cursos/buscar",
                        "/api/cursos/categoria/**", "/api/cursos/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/avaliacoes/cursos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/aulas/curso/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/certificados/usuario/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/matriculas/cursos/*/status").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/aulas/curso/**").hasAnyRole("ADMIN", "COLABORADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/cursos/**").hasRole("ADMIN")
                .requestMatchers("/api/usuarios/solicitacoes/**").hasRole("ADMIN")
                .requestMatchers("/api/cursos/pendentes", "/api/cursos/*/aprovar", "/api/cursos/*/rejeitar").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cursos").hasAnyRole("ADMIN", "COLABORADOR")
                .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasAnyRole("ADMIN", "COLABORADOR")
                .requestMatchers("/api/instrutor/**", "/api/colaborador/**").hasAnyRole("ADMIN", "COLABORADOR")
                .requestMatchers("/api/acoes/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
