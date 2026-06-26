package com.learnly.api.model.service;

import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.entity.ProgressoAula;
import com.learnly.api.model.repository.AulaRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.MatriculaRepository;
import com.learnly.api.model.repository.ProgressoAulaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AulaService {

    @Autowired private AulaRepository aulaRepository;
    @Autowired private ProgressoAulaRepository progressoAulaRepository;
    @Autowired private CursoRepository cursoRepository;
    @Autowired private MatriculaRepository matriculaRepository;

    public List<Aula> listarPorCurso(Long cursoId) {
        return aulaRepository.findByCursoIdOrderByOrdem(cursoId);
    }

    @Transactional
    public List<Aula> salvarAulas(Long cursoId, List<Aula> aulas) {
        aulaRepository.deleteByCursoId(cursoId);

        for (int i = 0; i < aulas.size(); i++) {
            aulas.get(i).setCursoId(cursoId);
            aulas.get(i).setOrdem(i + 1);
        }

        List<Aula> salvas = aulaRepository.saveAll(aulas);

        if (!salvas.isEmpty()) {
            cursoRepository.findById(cursoId).ifPresent(c -> {
                c.setUrl(salvas.get(0).getUrl());
                cursoRepository.save(c);
            });
        }

        return salvas;
    }

    @Transactional
    public ProgressoAula toggleAula(Long usuarioId, Long aulaId, boolean concluir) {
        Aula aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> new RuntimeException("Aula não encontrada"));

        ProgressoAula p = progressoAulaRepository
                .findByUsuarioIdAndAulaId(usuarioId, aulaId)
                .orElse(new ProgressoAula(usuarioId, aulaId, aula.getCursoId()));

        p.setConcluido(concluir);
        p.setDataConclusao(concluir ? LocalDateTime.now() : null);
        progressoAulaRepository.save(p);

        atualizarMatricula(usuarioId, aula.getCursoId());
        return p;
    }

    public List<ProgressoAula> progressoPorCurso(Long usuarioId, Long cursoId) {
        return progressoAulaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId);
    }

    public Map<String, Object> percentualConclusao(Long usuarioId, Long cursoId) {
        long total = aulaRepository.countByCursoId(cursoId);
        long concluidas = progressoAulaRepository.countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, cursoId);
        int percentual = total > 0 ? (int) ((concluidas * 100) / total) : 0;
        return Map.of("total", total, "concluidas", concluidas, "percentual", percentual);
    }

    private void atualizarMatricula(Long usuarioId, Long cursoId) {
        long total = aulaRepository.countByCursoId(cursoId);
        long concluidas = progressoAulaRepository.countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, cursoId);

        BigDecimal progresso = total > 0
                ? BigDecimal.valueOf(concluidas * 100).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Matricula m = matriculaRepository
                .findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .orElseGet(() -> matriculaRepository.save(new Matricula(usuarioId, cursoId)));

        m.setProgresso(progresso);

        boolean todasConcluidas = total > 0 && concluidas == total;
        if (todasConcluidas && !Boolean.TRUE.equals(m.getConcluido())) {
            m.setConcluido(true);
            m.setDataConclusao(LocalDateTime.now());
        } else if (!todasConcluidas && Boolean.TRUE.equals(m.getConcluido())) {
            m.setConcluido(false);
            m.setDataConclusao(null);
        }

        matriculaRepository.save(m);
    }
}
