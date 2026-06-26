package com.learnly.api.model.service;

import com.learnly.api.dto.CursoDTO;
import com.learnly.api.dto.CursoDetalhadoDTO;
import com.learnly.api.enums.StatusCurso;
import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Categoria;
import com.learnly.api.model.entity.Curso;
import com.learnly.api.model.entity.Instrutor;
import com.learnly.api.model.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CursoService {

    @Autowired private CursoRepository cursoRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private InstrutorRepository instrutorRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private AvaliacaoRepository avaliacaoRepository;
    @Autowired private AulaRepository aulaRepository;
    @Autowired private ProgressoAulaRepository progressoAulaRepository;
    @Autowired private MatriculaRepository matriculaRepository;

    public List<CursoDTO> listarTodos() {
        return cursoRepository.findByAtivoTrueAndStatus(StatusCurso.APROVADO).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<CursoDTO> listarPendentes() {
        return cursoRepository.findByStatus(StatusCurso.PENDENTE).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public boolean isOwner(Curso curso, Long usuarioId) {
        if (curso.getInstrutor() == null) return false;
        Long linked = curso.getInstrutor().getUsuarioId();
        return linked != null && linked.equals(usuarioId);
    }

    public List<CursoDTO> listarPorCriador(Long usuarioId) {
        return cursoRepository.findByInstrutorUsuarioId(usuarioId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CursoDTO criar(CursoDTO dto, Long usuarioId, String role) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank())
            throw new RuntimeException("Título é obrigatório");
        if (dto.getDescricao() == null || dto.getDescricao().isBlank())
            throw new RuntimeException("Descrição é obrigatória");
        if (dto.getUrl() == null || dto.getUrl().isBlank())
            throw new RuntimeException("URL é obrigatória");
        if (dto.getCategoria() == null || dto.getCategoria().isBlank())
            throw new RuntimeException("Categoria é obrigatória");
        if (dto.getDuracao() == null || dto.getDuracao() <= 0)
            throw new RuntimeException("Duração deve ser maior que zero");

        Categoria categoria = categoriaRepository.findByNome(dto.getCategoria())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada: " + dto.getCategoria()));

        Instrutor instrutor = resolverInstrutor(dto, usuarioId, role);

        Curso curso = new Curso(dto.getTitulo(), dto.getDescricao(), dto.getUrl(), categoria, instrutor, dto.getDuracao());
        curso.setImagem(dto.getImagem());
        curso.setDescricaoDetalhada(dto.getDescricaoDetalhada());
        curso.setLinksExternos(dto.getLinksExternos());
        curso.setAnexos(dto.getAnexos());
        curso.setStatus("admin".equals(role) ? StatusCurso.APROVADO : StatusCurso.PENDENTE);

        Curso salvo = cursoRepository.save(curso);
        criarPrimeiraAula(salvo);
        return toDTO(salvo);
    }

    public CursoDTO atualizar(Long id, CursoDTO dto, Long usuarioId, String role) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        if ("colaborador".equals(role)) {
            Long vinculado = curso.getInstrutor() != null ? curso.getInstrutor().getUsuarioId() : null;
            if (!usuarioId.equals(vinculado))
                throw new RuntimeException("Sem permissão para editar este curso");
        }

        Categoria categoria = categoriaRepository.findByNome(dto.getCategoria())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        Instrutor instrutor = resolverInstrutor(dto, usuarioId, role);

        String urlAntiga = curso.getUrl();
        if (dto.getUrl() != null && !dto.getUrl().equals(urlAntiga)) {
            aulaRepository.findByCursoIdAndOrdem(curso.getId(), 1).ifPresent(aula1 -> {
                if (urlAntiga != null && urlAntiga.equals(aula1.getUrl())) {
                    aula1.setUrl(dto.getUrl());
                    aulaRepository.save(aula1);
                }
            });
        }

        curso.setTitulo(dto.getTitulo());
        curso.setDescricao(dto.getDescricao());
        curso.setUrl(dto.getUrl());
        curso.setCategoria(categoria);
        curso.setInstrutor(instrutor);
        curso.setDuracao(dto.getDuracao());
        curso.setImagem(dto.getImagem());
        curso.setDescricaoDetalhada(dto.getDescricaoDetalhada());
        curso.setLinksExternos(dto.getLinksExternos());
        curso.setAnexos(dto.getAnexos());

        if ("colaborador".equals(role)) curso.setStatus(StatusCurso.PENDENTE);

        return toDTO(cursoRepository.save(curso));
    }

    public CursoDTO aprovarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        curso.setStatus(StatusCurso.APROVADO);
        return toDTO(cursoRepository.save(curso));
    }

    public CursoDTO rejeitarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        curso.setStatus(StatusCurso.REJEITADO);
        return toDTO(cursoRepository.save(curso));
    }

    @Transactional
    public void deletar(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        matriculaRepository.deleteByCursoId(id);
        progressoAulaRepository.deleteByCursoId(id);
        aulaRepository.deleteByCursoId(id);
        cursoRepository.delete(curso);
    }

    public List<CursoDTO> buscarPorCategoria(String categoria) {
        return cursoRepository.findByCategoriaNome(categoria, StatusCurso.APROVADO).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<CursoDTO> buscarPorTitulo(String titulo) {
        if (titulo == null || titulo.trim().isEmpty()) return listarTodos();
        return cursoRepository.buscarPorTermo(titulo, StatusCurso.APROVADO).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public CursoDetalhadoDTO buscarDetalhadoPorId(Long id) {
        return toDTODetalhado(cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado")));
    }

    private Instrutor resolverInstrutor(CursoDTO dto, Long usuarioId, String role) {
        if ("colaborador".equals(role)) {
            return instrutorRepository.findByUsuarioId(usuarioId)
                    .orElseGet(() -> {
                        var usuario = usuarioRepository.findById(usuarioId).orElseThrow();
                        Instrutor novo = new Instrutor(usuario.getNome(), null);
                        novo.setFoto(usuario.getFoto());
                        novo.setUsuarioId(usuarioId);
                        return instrutorRepository.save(novo);
                    });
        }
        String nome = (dto.getInstrutor() != null && !dto.getInstrutor().isBlank())
                ? dto.getInstrutor().trim() : "Learnly";
        return instrutorRepository.findByNome(nome)
                .orElseGet(() -> instrutorRepository.save(new Instrutor(nome, null)));
    }

    private CursoDTO toDTO(Curso curso) {
        CursoDTO dto = new CursoDTO(curso.getId(), curso.getTitulo(), curso.getDescricao(),
                curso.getUrl(), curso.getCategoria().getNome(), curso.getInstrutor().getNome(), curso.getDuracao());
        dto.setStatus(curso.getStatus().getValor());
        dto.setInstrutorId(curso.getInstrutor().getId());
        dto.setImagem(curso.getImagem());
        dto.setDescricaoDetalhada(curso.getDescricaoDetalhada());
        dto.setLinksExternos(curso.getLinksExternos());
        dto.setAnexos(curso.getAnexos());
        dto.setMediaAvaliacao(avaliacaoRepository.mediaNotaPorCurso(curso.getId()));
        dto.setTotalAvaliacoes(avaliacaoRepository.totalAvaliacoesPorCurso(curso.getId()));
        if (curso.getDataCriacao() != null) dto.setDataCriacao(curso.getDataCriacao().toString());
        return dto;
    }

    private CursoDetalhadoDTO toDTODetalhado(Curso curso) {
        CursoDetalhadoDTO dto = new CursoDetalhadoDTO(curso.getId(), curso.getTitulo(), curso.getDescricao(),
                curso.getUrl(), curso.getCategoria().getNome(), curso.getInstrutor().getNome(),
                curso.getInstrutor().getFoto(), curso.getInstrutor().getBio(), curso.getDuracao(), "Online");
        dto.setImagem(curso.getImagem());
        dto.setDescricaoDetalhada(curso.getDescricaoDetalhada());
        dto.setLinksExternos(curso.getLinksExternos());
        dto.setAnexos(curso.getAnexos());
        dto.setStatus(curso.getStatus().getValor());
        dto.setMediaAvaliacao(avaliacaoRepository.mediaNotaPorCurso(curso.getId()));
        dto.setTotalAvaliacoes(avaliacaoRepository.totalAvaliacoesPorCurso(curso.getId()));
        return dto;
    }

    private void criarPrimeiraAula(Curso curso) {
        if (aulaRepository.countByCursoId(curso.getId()) > 0) return;
        Aula aula = new Aula();
        aula.setCursoId(curso.getId());
        aula.setOrdem(1);
        aula.setTitulo("Aula 1 - " + curso.getTitulo());
        aula.setUrl(curso.getUrl());
        aula.setDescricao("Aula principal do curso");
        aulaRepository.save(aula);
    }
}
