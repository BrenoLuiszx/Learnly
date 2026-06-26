package com.learnly.api.model.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CursoAcaoService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private CursoRepository cursoRepository;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Set<Long> parseIds(String json) {
        if (json == null || json.isBlank()) return new LinkedHashSet<>();
        try {
            List<Long> list = MAPPER.readValue(json, new TypeReference<List<Long>>() {});
            return new LinkedHashSet<>(list);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao processar lista de IDs: " + e.getMessage(), e);
        }
    }

    private String toJson(Set<Long> ids) {
        try {
            return MAPPER.writeValueAsString(new ArrayList<>(ids));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao serializar lista de IDs: " + e.getMessage(), e);
        }
    }

    private Usuario getUser(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public boolean toggleFavorito(Long usuarioId, Long cursoId) {
        Usuario u = getUser(usuarioId);
        Set<Long> ids = parseIds(u.getFavoritos());
        boolean added = ids.add(cursoId);
        if (!added) ids.remove(cursoId);
        u.setFavoritos(toJson(ids));
        usuarioRepository.save(u);
        return added;
    }

    public boolean isFavorito(Long usuarioId, Long cursoId) {
        return parseIds(getUser(usuarioId).getFavoritos()).contains(cursoId);
    }

    public Set<Long> favoritosPorUsuario(Long usuarioId) {
        return parseIds(getUser(usuarioId).getFavoritos());
    }

    public List<Map<String, Object>> favoritosPorCurso(Long cursoId) {
        return usuarioRepository.findAll().stream()
                .filter(u -> parseIds(u.getFavoritos()).contains(cursoId))
                .map(u -> buildEntrada(u, cursoId))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> todosFavoritos() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Usuario u : usuarioRepository.findAll()) {
            for (Long cursoId : parseIds(u.getFavoritos())) {
                result.add(buildEntrada(u, cursoId));
            }
        }
        return result;
    }

    public boolean toggleAssistirDepois(Long usuarioId, Long cursoId) {
        Usuario u = getUser(usuarioId);
        Set<Long> ids = parseIds(u.getAssistirDepois());
        boolean added = ids.add(cursoId);
        if (!added) ids.remove(cursoId);
        u.setAssistirDepois(toJson(ids));
        usuarioRepository.save(u);
        return added;
    }

    public boolean isAssistirDepois(Long usuarioId, Long cursoId) {
        return parseIds(getUser(usuarioId).getAssistirDepois()).contains(cursoId);
    }

    public Set<Long> assistirDepoisPorUsuario(Long usuarioId) {
        return parseIds(getUser(usuarioId).getAssistirDepois());
    }

    public List<Map<String, Object>> assistirDepoisPorCurso(Long cursoId) {
        return usuarioRepository.findAll().stream()
                .filter(u -> parseIds(u.getAssistirDepois()).contains(cursoId))
                .map(u -> buildEntrada(u, cursoId))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> todosAssistirDepois() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Usuario u : usuarioRepository.findAll()) {
            for (Long cursoId : parseIds(u.getAssistirDepois())) {
                result.add(buildEntrada(u, cursoId));
            }
        }
        return result;
    }

    private Map<String, Object> buildEntrada(Usuario u, Long cursoId) {
        String tituloCurso = cursoRepository.findById(cursoId)
                .map(c -> c.getTitulo()).orElse("Curso #" + cursoId);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("usuarioId",   u.getId());
        entry.put("nomeUsuario", u.getNome());
        entry.put("fotoUsuario", u.getFoto() != null ? u.getFoto() : "");
        entry.put("cursoId",     cursoId);
        entry.put("tituloCurso", tituloCurso);
        return entry;
    }
}
