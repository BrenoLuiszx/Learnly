package com.learnly.api.model.service;

import com.learnly.api.dto.AvaliacaoDTO;
import com.learnly.api.model.entity.Avaliacao;
import com.learnly.api.model.entity.Usuario;
import com.learnly.api.model.repository.AvaliacaoRepository;
import com.learnly.api.model.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvaliacaoService {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Avaliacao salvarPorEmail(String email, Long cursoId, Integer nota, String comentario) {
        if (nota < 1 || nota > 5) throw new RuntimeException("Nota deve ser entre 1 e 5");
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Avaliacao avaliacao = avaliacaoRepository.findByUsuarioIdAndCursoId(usuario.getId(), cursoId)
                .orElse(new Avaliacao());

        avaliacao.setUsuarioId(usuario.getId());
        avaliacao.setCursoId(cursoId);
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        return avaliacaoRepository.save(avaliacao);
    }

    public Avaliacao buscarDoUsuarioPorEmail(String email, Long cursoId) {
        return usuarioRepository.findByEmail(email)
                .flatMap(u -> avaliacaoRepository.findByUsuarioIdAndCursoId(u.getId(), cursoId))
                .orElse(null);
    }

    public List<AvaliacaoDTO> listarPorCurso(Long cursoId) {
        return avaliacaoRepository.findByCursoIdWithUsuario(cursoId);
    }

    public Double mediaPorCurso(Long cursoId) {
        Double media = avaliacaoRepository.mediaNotaPorCurso(cursoId);
        return media != null ? Math.round(media * 10.0) / 10.0 : 0.0;
    }

    public Integer totalPorCurso(Long cursoId) {
        Integer total = avaliacaoRepository.totalAvaliacoesPorCurso(cursoId);
        return total != null ? total : 0;
    }

    public Avaliacao buscarDoUsuario(Long usuarioId, Long cursoId) {
        return avaliacaoRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId).orElse(null);
    }
}
