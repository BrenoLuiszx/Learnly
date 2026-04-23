package com.learnly.api.model.repository;

import com.learnly.api.model.entity.ProgressoAula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoAulaRepository extends JpaRepository<ProgressoAula, Long> {
    Optional<ProgressoAula> findByUsuarioIdAndAulaId(Long usuarioId, Long aulaId);
    List<ProgressoAula> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    List<ProgressoAula> findByCursoIdAndConcluidoTrue(Long cursoId);
    long countByUsuarioIdAndCursoIdAndConcluidoTrue(Long usuarioId, Long cursoId);
    
    @Modifying
    @Transactional
    void deleteByCursoId(Long cursoId);
}
