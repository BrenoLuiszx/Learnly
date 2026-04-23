package com.learnly.api.model.service;

import com.learnly.api.dto.CursoDTO;
import com.learnly.api.dto.CursoDetalhadoDTO;
import com.learnly.api.model.entity.Aula;
import com.learnly.api.model.entity.Categoria;
import com.learnly.api.model.entity.Curso;
import com.learnly.api.model.entity.Instrutor;
import com.learnly.api.model.repository.AulaRepository;
import com.learnly.api.model.repository.CategoriaRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.InstrutorRepository;
import com.learnly.api.model.repository.MatriculaRepository;
import com.learnly.api.model.repository.ProgressoAulaRepository;

import com.learnly.api.model.repository.UsuarioRepository;

import com.learnly.api.model.repository.AvaliacaoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CursoService {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private InstrutorRepository instrutorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;
    
    @Autowired
    private AulaRepository aulaRepository;
    
    @Autowired
    private ProgressoAulaRepository progressoAulaRepository;
    
    @Autowired
    private MatriculaRepository matriculaRepository;

    

    

    // Lista apenas cursos aprovados (público)
    public List<CursoDTO> listarTodos() {
        return cursoRepository.findByAtivoTrueAndStatus("aprovado").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lista cursos pendentes (admin)
    public List<CursoDTO> listarPendentes() {
        return cursoRepository.findByStatus("pendente").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns true if the given usuarioId owns the course.
     * Ownership = the course's Instrutor has usuario_id == usuarioId.
     * Courses whose instructor has no linked user (standalone instructors)
     * are only accessible to admins.
     */
    public boolean isOwner(Curso curso, Long usuarioId) {
        if (curso.getInstrutor() == null) return false;
        Long linked = curso.getInstrutor().getUsuarioId();
        return linked != null && linked.equals(usuarioId);
    }

    // Lista cursos do colaborador
    public List<CursoDTO> listarPorCriador(Long usuarioId) {
        return cursoRepository.findByInstrutorUsuarioId(usuarioId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Criar curso - admin aprova direto, colaborador fica pendente
    @Transactional
    public CursoDTO criar(CursoDTO cursoDTO, Long usuarioId, String role) {
        if (cursoDTO.getTitulo() == null || cursoDTO.getTitulo().isBlank())
            throw new RuntimeException("Título é obrigatório");
        if (cursoDTO.getDescricao() == null || cursoDTO.getDescricao().isBlank())
            throw new RuntimeException("Descrição é obrigatória");
        if (cursoDTO.getUrl() == null || cursoDTO.getUrl().isBlank())
            throw new RuntimeException("URL é obrigatória");
        if (cursoDTO.getCategoria() == null || cursoDTO.getCategoria().isBlank())
            throw new RuntimeException("Categoria é obrigatória");
        if (cursoDTO.getDuracao() == null || cursoDTO.getDuracao() <= 0)
            throw new RuntimeException("Duração deve ser maior que zero");

        Categoria categoria = categoriaRepository.findByNome(cursoDTO.getCategoria())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada: " + cursoDTO.getCategoria()));

        Instrutor instrutor;
        if (!"admin".equals(role)) {
            // Collaborator: auto-link to their own Instrutor record
            instrutor = instrutorRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
                var usuario = usuarioRepository.findById(usuarioId).orElseThrow();
                Instrutor novo = new Instrutor(usuario.getNome(), null);
                novo.setFoto(usuario.getFoto());
                novo.setUsuarioId(usuarioId);
                return instrutorRepository.save(novo);
            });
        } else {
            // Admin: use the instructor name from the form, fall back to "Learnly" if blank
            String nomeInstrutor = (cursoDTO.getInstrutor() != null && !cursoDTO.getInstrutor().isBlank())
                    ? cursoDTO.getInstrutor().trim()
                    : "Learnly";
            instrutor = instrutorRepository.findByNome(nomeInstrutor).orElseGet(() -> {
                Instrutor novo = new Instrutor(nomeInstrutor, null);
                return instrutorRepository.save(novo);
            });
        }

        Curso curso = new Curso(
            cursoDTO.getTitulo(),
            cursoDTO.getDescricao(),
            cursoDTO.getUrl(),
            categoria,
            instrutor,
            cursoDTO.getDuracao()
        );

        curso.setImagem(cursoDTO.getImagem());
        curso.setDescricaoDetalhada(cursoDTO.getDescricaoDetalhada());
        curso.setLinksExternos(cursoDTO.getLinksExternos());
        curso.setAnexos(cursoDTO.getAnexos());

        // Admin aprova direto, colaborador fica pendente
        if ("admin".equals(role)) {
            curso.setStatus("aprovado");
        } else {
            curso.setStatus("pendente");
        }

        Curso cursoSalvo = cursoRepository.save(curso);
        criarPrimeiraAula(cursoSalvo);
        return convertToDTO(cursoSalvo);
    }

    // Atualizar curso - colaborador só pode editar os seus
    public CursoDTO atualizar(Long id, CursoDTO cursoDTO, Long usuarioId, String role) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Colaborador só pode editar cursos cujo instrutor está vinculado a ele
        if ("colaborador".equals(role)) {
            Long instrutorUsuarioId = curso.getInstrutor() != null ? curso.getInstrutor().getUsuarioId() : null;
            if (!usuarioId.equals(instrutorUsuarioId)) {
                throw new RuntimeException("Sem permissão para editar este curso");
            }
        }

        Categoria categoria = categoriaRepository.findByNome(cursoDTO.getCategoria())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        Instrutor instrutor;
        if (!"colaborador".equals(role)) {
            String nomeInstrutor = (cursoDTO.getInstrutor() != null && !cursoDTO.getInstrutor().isBlank())
                    ? cursoDTO.getInstrutor().trim()
                    : "Learnly";
            instrutor = instrutorRepository.findByNome(nomeInstrutor).orElseGet(() -> {
                Instrutor novo = new Instrutor(nomeInstrutor, null);
                return instrutorRepository.save(novo);
            });
        } else {
            instrutor = instrutorRepository.findByUsuarioId(usuarioId)
                    .orElseGet(() -> instrutorRepository.findByNome(cursoDTO.getInstrutor())
                            .orElseGet(() -> {
                                Instrutor novo = new Instrutor(cursoDTO.getInstrutor(), "Instrutor");
                                return instrutorRepository.save(novo);
                            }));
        }

        curso.setTitulo(cursoDTO.getTitulo());
        curso.setDescricao(cursoDTO.getDescricao());
        curso.setUrl(cursoDTO.getUrl());
        curso.setCategoria(categoria);
        curso.setInstrutor(instrutor);
        curso.setDuracao(cursoDTO.getDuracao());
        curso.setImagem(cursoDTO.getImagem());
        curso.setDescricaoDetalhada(cursoDTO.getDescricaoDetalhada());
        curso.setLinksExternos(cursoDTO.getLinksExternos());
        curso.setAnexos(cursoDTO.getAnexos());

        // Colaborador ao editar volta para pendente
        if ("colaborador".equals(role)) {
            curso.setStatus("pendente");
        }

        return convertToDTO(cursoRepository.save(curso));
    }

    // Admin aprova curso
    public CursoDTO aprovarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        curso.setStatus("aprovado");
        return convertToDTO(cursoRepository.save(curso));
    }

    // Admin rejeita curso
    public CursoDTO rejeitarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        curso.setStatus("rejeitado");
        return convertToDTO(cursoRepository.save(curso));
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
        return cursoRepository.findByCategoriaNome(categoria).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CursoDTO> buscarPorTitulo(String titulo) {
        if (titulo == null || titulo.trim().isEmpty()) return listarTodos();
        return cursoRepository.buscarPorTermo(titulo).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CursoDetalhadoDTO buscarDetalhadoPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        return convertToDetalhadoDTO(curso);
    }

    private CursoDTO convertToDTO(Curso curso) {
        CursoDTO dto = new CursoDTO(
            curso.getId(),
            curso.getTitulo(),
            curso.getDescricao(),
            curso.getUrl(),
            curso.getCategoria().getNome(),
            curso.getInstrutor().getNome(),
            curso.getDuracao()
        );
        dto.setStatus(curso.getStatus());
        dto.setInstrutorId(curso.getInstrutor().getId());
        dto.setImagem(curso.getImagem());
        dto.setDescricaoDetalhada(curso.getDescricaoDetalhada());
        dto.setLinksExternos(curso.getLinksExternos());
        dto.setAnexos(curso.getAnexos());
        dto.setMediaAvaliacao(avaliacaoRepository.mediaNotaPorCurso(curso.getId()));
        dto.setTotalAvaliacoes(avaliacaoRepository.totalAvaliacoesPorCurso(curso.getId()));
        if (curso.getDataCriacao() != null) {
            dto.setDataCriacao(curso.getDataCriacao().toString());
        }
        return dto;
    }

    private CursoDetalhadoDTO convertToDetalhadoDTO(Curso curso) {
        CursoDetalhadoDTO dto = new CursoDetalhadoDTO(
            curso.getId(),
            curso.getTitulo(),
            curso.getDescricao(),
            curso.getUrl(),
            curso.getCategoria().getNome(),
            curso.getInstrutor().getNome(),
            curso.getInstrutor().getFoto(),
            curso.getInstrutor().getBio(),
            curso.getDuracao(),
            "Online"
        );
        dto.setImagem(curso.getImagem());
        dto.setDescricaoDetalhada(curso.getDescricaoDetalhada());
        dto.setLinksExternos(curso.getLinksExternos());
        dto.setAnexos(curso.getAnexos());
        dto.setStatus(curso.getStatus());
        dto.setMediaAvaliacao(avaliacaoRepository.mediaNotaPorCurso(curso.getId()));
        dto.setTotalAvaliacoes(avaliacaoRepository.totalAvaliacoesPorCurso(curso.getId()));
        return dto;
    }
    
    // Método auxiliar para criar primeira aula automaticamente
    private void criarPrimeiraAula(Curso curso) {
        try {
            // Verificar se já existe aula para este curso
            long totalAulas = aulaRepository.countByCursoId(curso.getId());
            if (totalAulas > 0) {
                System.out.println("[CursoService] Curso já possui aulas, pulando criação automática");
                return;
            }
            
            Aula primeiraAula = new Aula();
            primeiraAula.setCursoId(curso.getId());
            primeiraAula.setOrdem(1);
            primeiraAula.setTitulo("Aula 1 - " + curso.getTitulo());
            primeiraAula.setUrl(curso.getUrl());
            primeiraAula.setDescricao("Aula principal do curso");
            
            aulaRepository.save(primeiraAula);
            System.out.println("[CursoService] Primeira aula criada automaticamente para curso: " + curso.getId());
        } catch (Exception e) {
            System.err.println("[CursoService] Erro ao criar primeira aula: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
