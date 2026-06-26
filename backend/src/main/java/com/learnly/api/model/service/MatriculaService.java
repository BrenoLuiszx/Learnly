package com.learnly.api.model.service;

import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.repository.MatriculaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class MatriculaService {

    @Autowired
    private MatriculaRepository matriculaRepository;

    public Map<String, Object> matricular(Long usuarioId, Long cursoId) {
        if (matriculaRepository.existsByUsuarioIdAndCursoId(usuarioId, cursoId)) {
            Matricula m = matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                    .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
            return Map.of("matricula", m, "nova", false);
        }
        Matricula m = matriculaRepository.save(new Matricula(usuarioId, cursoId));
        return Map.of("matricula", m, "nova", true);
    }

    public boolean isMatriculado(Long usuarioId, Long cursoId) {
        return matriculaRepository.existsByUsuarioIdAndCursoId(usuarioId, cursoId);
    }

    public List<Matricula> listarPorUsuario(Long usuarioId) {
        return matriculaRepository.findByUsuarioId(usuarioId);
    }

    public List<Matricula> listarConcluidosPorUsuario(Long usuarioId) {
        return matriculaRepository.findByUsuarioIdAndConcluidoTrue(usuarioId);
    }

    public long totalMatriculadosCurso(Long cursoId) {
        return matriculaRepository.countByCursoId(cursoId);
    }

    public long totalCursosUsuario(Long usuarioId) {
        return matriculaRepository.countByUsuarioId(usuarioId);
    }

    public Matricula marcarConcluido(Long usuarioId, Long cursoId) {
        Matricula m = matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
        if (!Boolean.TRUE.equals(m.getConcluido())) {
            m.setConcluido(true);
            m.setDataConclusao(LocalDateTime.now());
        }
        m.setProgresso(BigDecimal.valueOf(100));
        return matriculaRepository.save(m);
    }

    public Matricula desmarcarConcluido(Long usuarioId, Long cursoId) {
        Matricula m = matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
        if (Boolean.TRUE.equals(m.getConcluido())) {
            m.setConcluido(false);
            m.setDataConclusao(null);
        }
        return matriculaRepository.save(m);
    }

    public boolean isConcluido(Long usuarioId, Long cursoId) {
        return matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .map(Matricula::getConcluido)
                .orElse(false);
    }

    public Matricula atualizarProgresso(Long usuarioId, Long cursoId, BigDecimal progresso) {
        Matricula m = matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
        m.setProgresso(progresso.min(BigDecimal.valueOf(100)).max(BigDecimal.ZERO));
        if (progresso.compareTo(BigDecimal.valueOf(100)) >= 0 && !Boolean.TRUE.equals(m.getConcluido())) {
            m.setConcluido(true);
            m.setDataConclusao(LocalDateTime.now());
        }
        return matriculaRepository.save(m);
    }
}
