package com.learnly.api.model.repository;

import com.learnly.api.model.entity.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    List<Certificado> findByUsuarioId(Long usuarioId);
    List<Certificado> findByUsuarioIdAndPublicoTrue(Long usuarioId);
    Optional<Certificado> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
}
