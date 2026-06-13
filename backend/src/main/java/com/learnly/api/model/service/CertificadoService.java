package com.learnly.api.model.service;

import com.learnly.api.model.entity.Certificado;
import com.learnly.api.model.entity.Curso;
import com.learnly.api.model.entity.Matricula;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.CertificadoRepository;
import com.learnly.api.model.repository.CursoRepository;
import com.learnly.api.model.repository.MatriculaRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CertificadoService {

    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    // Cursos concluídos pelo usuário que ainda não têm certificado emitido
    public List<Map<String, Object>> cursosDisponiveisParaCertificado(Long usuarioId) {
        List<Matricula> concluidas = matriculaRepository.findByUsuarioId(usuarioId).stream()
                .filter(m -> Boolean.TRUE.equals(m.getConcluido()))
                .collect(Collectors.toList());

        return concluidas.stream()
                .filter(m -> !certificadoRepository.existsByUsuarioIdAndCursoId(usuarioId, m.getCursoId()))
                .map(m -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("cursoId", m.getCursoId());
                    item.put("dataConclusao", m.getDataConclusao());
                    cursoRepository.findById(m.getCursoId()).ifPresent(c -> {
                        item.put("tituloCurso", c.getTitulo());
                        item.put("categoria", c.getCategoria() != null ? c.getCategoria().getNome() : "");
                        item.put("duracao", c.getDuracao());
                        item.put("imagem", c.getImagem());
                    });
                    return item;
                })
                .collect(Collectors.toList());
    }
    public Certificado emitir(Long usuarioId, Long cursoId, String urlUpload) {
        if (certificadoRepository.existsByUsuarioIdAndCursoId(usuarioId, cursoId)) {
            Certificado existente = certificadoRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId).get();
            if (urlUpload != null) existente.setUrlCertificado(urlUpload);
            return certificadoRepository.save(existente);
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        Certificado cert = new Certificado(usuarioId, cursoId, usuario.getNome(), curso.getTitulo());
        cert.setUrlCertificado(urlUpload);
        return certificadoRepository.save(cert);
    }

    public List<Certificado> listarPorUsuario(Long usuarioId) {
        return certificadoRepository.findByUsuarioId(usuarioId);
    }

    // Certificados públicos de um usuário (visível para empresas)
    public List<Certificado> listarPublicosPorUsuario(Long usuarioId) {
        return certificadoRepository.findByUsuarioIdAndPublicoTrue(usuarioId);
    }

    public Certificado alternarVisibilidade(Long id, Long usuarioId) {
        Certificado cert = certificadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificado não encontrado"));
        if (!cert.getUsuarioId().equals(usuarioId))
            throw new RuntimeException("Sem permissão");
        cert.setPublico(!cert.getPublico());
        return certificadoRepository.save(cert);
    }

    /** Returns enriched certificate details for the certificate page. */
    public Map<String, Object> detalhesCertificado(Long id, Long usuarioId) {
        Certificado cert = certificadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificado não encontrado"));
        if (!cert.getUsuarioId().equals(usuarioId))
            throw new RuntimeException("Sem permissão");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", cert.getId());
        result.put("nomeUsuario", cert.getNomeUsuario());
        result.put("tituloCurso", cert.getTituloCurso());
        result.put("dataEmissao", cert.getDataEmissao());
        result.put("publico", cert.getPublico());

        // Completion date from enrollment
        matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cert.getCursoId()).ifPresent(m -> {
            result.put("dataConclusao", m.getDataConclusao());
            result.put("concluido", m.getConcluido());
        });

        // Instructor name from course
        cursoRepository.findById(cert.getCursoId()).ifPresent(c -> {
            result.put("categoriaCurso", c.getCategoria() != null ? c.getCategoria().getNome() : "");
            if (c.getInstrutor() != null) {
                result.put("nomeInstrutor", c.getInstrutor().getNome());
            }
        });

        return result;
    }

    /** Validates eligibility and issues certificate atomically. */
    public Map<String, Object> emitirERetornarDetalhes(Long usuarioId, Long cursoId) {
        boolean concluido = matriculaRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .map(m -> Boolean.TRUE.equals(m.getConcluido()))
                .orElse(false);
        if (!concluido) throw new RuntimeException("Curso não concluído");

        Certificado cert = emitir(usuarioId, cursoId, null);
        return detalhesCertificado(cert.getId(), usuarioId);
    }
}
