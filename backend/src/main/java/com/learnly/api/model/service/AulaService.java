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

    @Autowired
    private AulaRepository aulaRepository;

    @Autowired
    private ProgressoAulaRepository progressoAulaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    // Lista aulas de um curso ordenadas
    public List<Aula> listarPorCurso(Long cursoId) {
        return aulaRepository.findByCursoIdOrderByOrdem(cursoId);
    }

    // Salva lista completa de aulas de um curso (substitui as existentes)
    @Transactional
    public List<Aula> salvarAulas(Long cursoId, List<Aula> aulas) {
        System.out.println("[AulaService] Iniciando salvamento de aulas para curso: " + cursoId);
        System.out.println("[AulaService] Quantidade de aulas recebidas: " + aulas.size());
        
        aulaRepository.deleteByCursoId(cursoId);
        System.out.println("[AulaService] Aulas antigas deletadas");
        
        for (int i = 0; i < aulas.size(); i++) {
            Aula a = aulas.get(i);
            a.setCursoId(cursoId);
            a.setOrdem(i + 1);
            System.out.println("[AulaService] Aula " + (i+1) + ": " + a.getTitulo() + " | URL: " + a.getUrl());
        }
        
        List<Aula> aulasSalvas = aulaRepository.saveAll(aulas);
        System.out.println("[AulaService] Aulas salvas no banco: " + aulasSalvas.size());
        
        // Atualizar URL do curso com a primeira aula
        if (!aulasSalvas.isEmpty()) {
            String urlPrimeiraAula = aulasSalvas.get(0).getUrl();
            System.out.println("[AulaService] Chamando atualizarUrlCurso com URL: " + urlPrimeiraAula);
            atualizarUrlCurso(cursoId, urlPrimeiraAula);
        } else {
            System.out.println("[AulaService] AVISO: Lista de aulas salvas está vazia!");
        }
        
        return aulasSalvas;
    }
    
    // Método auxiliar para atualizar URL do curso
    private void atualizarUrlCurso(Long cursoId, String urlPrimeiraAula) {
        try {
            System.out.println("[AulaService] Atualizando URL do curso " + cursoId + " para: " + urlPrimeiraAula);
            
            var curso = cursoRepository.findById(cursoId);
            if (curso.isPresent()) {
                var c = curso.get();
                System.out.println("[AulaService] URL atual do curso: " + c.getUrl());
                c.setUrl(urlPrimeiraAula);
                cursoRepository.save(c);
                System.out.println("[AulaService] URL do curso atualizada com sucesso!");
            } else {
                System.err.println("[AulaService] Curso não encontrado: " + cursoId);
            }
        } catch (Exception e) {
            System.err.println("[AulaService] Erro ao atualizar URL do curso: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Marks/unmarks a lesson as complete and syncs progress into Matriculas
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

        sincronizarMatricula(usuarioId, aula.getCursoId());
        return p;
    }

    // Recalculates progress in Matriculas based on completed lessons
    private void sincronizarMatricula(Long usuarioId, Long cursoId) {
        long total = aulaRepository.countByCursoId(cursoId);
        long concluidas = progressoAulaRepository
                .countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, cursoId);

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

    // Retorna progresso do usuário em todas as aulas de um curso
    public List<ProgressoAula> progressoPorCurso(Long usuarioId, Long cursoId) {
        return progressoAulaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId);
    }

    // Retorna percentual de conclusão (0-100)
    public Map<String, Object> percentualConclusao(Long usuarioId, Long cursoId) {
        long total = aulaRepository.countByCursoId(cursoId);
        long concluidas = progressoAulaRepository
                .countByUsuarioIdAndCursoIdAndConcluidoTrue(usuarioId, cursoId);
        int percentual = total > 0 ? (int) ((concluidas * 100) / total) : 0;
        return Map.of("total", total, "concluidas", concluidas, "percentual", percentual);
    }
}
