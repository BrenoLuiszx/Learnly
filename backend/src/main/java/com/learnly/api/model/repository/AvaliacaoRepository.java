package com.learnly.api.model.repository;

import com.learnly.api.dto.AvaliacaoDTO;
import com.learnly.api.model.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Optional<Avaliacao> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);

    /**
     * Join Avaliacoes with Usuarios at query time so nomeUsuario and fotoUsuario
     * always reflect the current user profile — no denormalized columns needed.
     */
    @Query("""
        SELECT new com.learnly.api.dto.AvaliacaoDTO(
            a.id, a.usuarioId, a.cursoId,
            a.nota, a.comentario, a.dataCriacao,
            u.nome, u.foto
        )
        FROM Avaliacao a
        JOIN Usuario u ON u.id = a.usuarioId
        WHERE a.cursoId = :cursoId
        ORDER BY a.dataCriacao DESC
        """)
    List<AvaliacaoDTO> findByCursoIdWithUsuario(@Param("cursoId") Long cursoId);

    @Query("SELECT AVG(CAST(a.nota AS double)) FROM Avaliacao a WHERE a.cursoId = :cursoId")
    Double mediaNotaPorCurso(@Param("cursoId") Long cursoId);

    @Query("SELECT COUNT(a) FROM Avaliacao a WHERE a.cursoId = :cursoId")
    Integer totalAvaliacoesPorCurso(@Param("cursoId") Long cursoId);
}
