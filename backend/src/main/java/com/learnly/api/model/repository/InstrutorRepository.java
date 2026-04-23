package com.learnly.api.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learnly.api.model.entity.Instrutor;

import java.util.Optional;

@Repository
public interface InstrutorRepository extends JpaRepository<Instrutor, Long> {
    Optional<Instrutor> findByNome(String nome);
    Optional<Instrutor> findByUsuarioId(Long usuarioId);
}