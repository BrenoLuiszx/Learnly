package com.learnly.api.model.repository;

import com.learnly.api.model.entity.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AulaRepository extends JpaRepository<Aula, Long> {
    List<Aula> findByCursoIdOrderByOrdem(Long cursoId);
    
    @Modifying
    @Transactional
    void deleteByCursoId(Long cursoId);
    
    long countByCursoId(Long cursoId);
}
