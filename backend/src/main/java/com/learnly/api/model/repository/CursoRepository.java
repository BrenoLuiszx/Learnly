package com.learnly.api.model.repository;

import com.learnly.api.enums.StatusCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learnly.api.model.entity.Curso;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    @Query("SELECT c FROM Curso c WHERE c.categoria.nome = :categoria AND c.ativo = true AND c.status = :status")
    List<Curso> findByCategoriaNome(@Param("categoria") String categoria, @Param("status") StatusCurso status);

    @Query("SELECT c FROM Curso c WHERE " +
           "(LOWER(c.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.instrutor.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.categoria.nome) LIKE LOWER(CONCAT('%', :termo, '%'))) " +
           "AND c.ativo = true AND c.status = :status")
    List<Curso> buscarPorTermo(@Param("termo") String termo, @Param("status") StatusCurso status);

    List<Curso> findByAtivoTrueAndStatus(StatusCurso status);

    long countByAtivoTrueAndStatus(StatusCurso status);

    List<Curso> findByStatus(StatusCurso status);

    List<Curso> findByInstrutorUsuarioId(Long usuarioId);
}
