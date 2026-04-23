package com.learnly.api.model.repository;

import com.learnly.api.model.entity.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    Optional<Matricula> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    List<Matricula> findByUsuarioId(Long usuarioId);
    List<Matricula> findByCursoId(Long cursoId);
    List<Matricula> findByUsuarioIdAndConcluidoTrue(Long usuarioId);
    long countByCursoId(Long cursoId);
    long countByUsuarioId(Long usuarioId);

    @Modifying
    @Transactional
    void deleteByCursoId(Long cursoId);
}
