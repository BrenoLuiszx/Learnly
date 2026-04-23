import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cursosAPI, aulasAPI, progressoAPI, avaliacoesAPI, certificadosAPI, matriculasAPI, acoesAPI } from '../services/api';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const StarRating = ({ value, onChange, readonly, theme }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <TouchableOpacity key={s} onPress={() => !readonly && onChange && onChange(s)} disabled={readonly}>
        <Ionicons name={s <= value ? 'star' : 'star-outline'} size={20} color={theme?.primary || '#FACC15'} />
      </TouchableOpacity>
    ))}
  </View>
);

const CourseDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [matriculado, setMatriculado] = useState(false);
  const [totalMatriculados, setTotalMatriculados] = useState(0);
  const [progressoAulas, setProgressoAulas] = useState([]);
  const [percentual, setPercentual] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [temCertificado, setTemCertificado] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [isWL, setIsWL] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      carregarTudo();
    }, [id])
  );

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [cursoRes, aulasRes, avalRes, matriculaRes, favRes, wlRes] = await Promise.all([
        cursosAPI.buscarPorId(id),
        aulasAPI.listarPorCurso(id).catch(() => ({ data: [] })),
        avaliacoesAPI.listarPorCurso(id).catch(() => ({ data: [] })),
        matriculasAPI.status(id).catch(() => ({ data: {} })),
        acoesAPI.meusFavoritos().catch(() => ({ data: { favoritos: [] } })),
        acoesAPI.meusAssistirDepois().catch(() => ({ data: { assistirDepois: [] } })),
      ]);
      const aulasData = aulasRes.data || [];
      setCurso(cursoRes.data);
      setAulas(aulasData);
      setAvaliacoes(Array.isArray(avalRes.data) ? avalRes.data : []);
      setMatriculado(matriculaRes.data?.matriculado === true);
      setTotalMatriculados(matriculaRes.data?.totalMatriculados || 0);
      setIsFav((favRes.data?.favoritos || []).includes(Number(id)));
      setIsWL((wlRes.data?.assistirDepois || []).includes(Number(id)));

      // Pre-select lesson from "Continue Learning" deep-link, else first lesson
      const aulaIdParam = route.params?.aulaId;
      const target = aulaIdParam ? aulasData.find(a => a.id === Number(aulaIdParam)) : null;
      if (target || aulasData.length > 0) setAulaAtual(target || aulasData[0]);

      if (user) {
        const [progRes, percRes, certRes, statusRes, minhaAvalRes] = await Promise.all([
          aulasAPI.progresso(id).catch(() => ({ data: [] })),
          aulasAPI.percentual(id).catch(() => ({ data: { percentual: 0 } })),
          certificadosAPI.meusCertificados().catch(() => ({ data: [] })),
          progressoAPI.statusCurso(id).catch(() => ({ data: {} })),
          avaliacoesAPI.minhaAvaliacao(id).catch(() => ({ data: null })),
        ]);
        setProgressoAulas(progRes.data || []);
        setPercentual(percRes.data?.percentual || 0);
        setTemCertificado((certRes.data || []).some((c) => c.cursoId === Number(id)));
        setConcluido(statusRes.data?.concluido === true);
        if (minhaAvalRes.data) {
          setNota(minhaAvalRes.data.nota);
          setComentario(minhaAvalRes.data.comentario || '');
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o curso.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const recarregarProgresso = async () => {
    const [progRes, percRes] = await Promise.all([
      aulasAPI.progresso(id).catch(() => ({ data: [] })),
      aulasAPI.percentual(id).catch(() => ({ data: { percentual: 0 } })),
    ]);
    setProgressoAulas(progRes.data || []);
    setPercentual(percRes.data?.percentual || 0);
  };

  const aulaAcessivel = (aula) => matriculado || aula.ordem === 1;

  const confirmarMatricula = () => {
    Alert.alert(
      'Matricular-se no curso',
      `Deseja se matricular em "${curso?.titulo}"? Sua matrícula será registrada e você poderá acompanhar seu progresso.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Matrícula',
          onPress: async () => {
            try {
              await matriculasAPI.matricular(id);
              setMatriculado(true);
              setTotalMatriculados(prev => prev + 1);
              // Reload user-specific data now that enrollment is confirmed
              const [progRes, percRes, statusRes] = await Promise.all([
                aulasAPI.progresso(id).catch(() => ({ data: [] })),
                aulasAPI.percentual(id).catch(() => ({ data: { percentual: 0 } })),
                progressoAPI.statusCurso(id).catch(() => ({ data: {} })),
              ]);
              setProgressoAulas(progRes.data || []);
              setPercentual(percRes.data?.percentual || 0);
              setConcluido(statusRes.data?.concluido === true);
            } catch {
              showMsg('Erro ao realizar matrícula. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const assistirAula = (aula) => {
    if (!aulaAcessivel(aula)) { confirmarMatricula(); return; }
    setAulaAtual(aula);
  };

  const toggleAula = async (aula) => {
    if (!user) return navigation.navigate('Login');
    if (!matriculado) { confirmarMatricula(); return; }
    const jaConcluida = progressoAulas.some((p) => p.aulaId === aula.id && p.concluido);
    try {
      if (jaConcluida) await aulasAPI.desconcluir(aula.id);
      else await aulasAPI.concluir(aula.id);
      await recarregarProgresso();
      showMsg(jaConcluida ? 'Aula desmarcada!' : 'Aula concluída!');
    } catch {
      showMsg('Erro ao atualizar progresso da aula.');
    }
  };

  const toggleConcluido = async () => {
    if (!user) return navigation.navigate('Login');
    if (!concluido && aulas.length > 0) {
      const todas = aulas.every((a) => progressoAulas.some((p) => p.aulaId === a.id && p.concluido));
      if (!todas) {
        showMsg('Conclua todas as aulas antes de marcar o curso como concluído.');
        return;
      }
    }
    try {
      if (concluido) await progressoAPI.desmarcarConcluido(id);
      else await progressoAPI.marcarConcluido(id);
      setConcluido(!concluido);
    } catch {
      showMsg('Erro ao atualizar progresso.');
    }
  };

  const emitirCertificado = async () => {
    if (!concluido) { showMsg('Conclua o curso antes de emitir o certificado.'); return; }
    try {
      await certificadosAPI.emitir(id);
      setTemCertificado(true);
      showMsg('Certificado emitido! Veja em Meu Perfil.');
    } catch {
      showMsg('Erro ao emitir certificado.');
    }
  };

  const enviarAvaliacao = async () => {
    if (!user) return navigation.navigate('Login');
    if (nota < 1) { showMsg('Selecione uma nota.'); return; }
    try {
      await avaliacoesAPI.avaliar(id, { nota, comentario });
      showMsg('Avaliação enviada!');
      const res = await avaliacoesAPI.listarPorCurso(id);
      setAvaliacoes(Array.isArray(res.data) ? res.data : []);
    } catch {
      showMsg('Erro ao enviar avaliação.');
    }
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const toggleFav = async () => {
    setIsFav(v => !v);
    try { const r = await acoesAPI.toggleFavorito(id); setIsFav(r.data.favorito); } catch {}
  };

  const toggleWL = async () => {
    setIsWL(v => !v);
    try { const r = await acoesAPI.toggleAssistirDepois(id); setIsWL(r.data.assistirDepois); } catch {}
  };

  const formatDuracao = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const mediaAval = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={[styles.backText, { color: theme.textSecondary }]}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? '#EF4444' : theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWL} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isWL ? 'bookmark' : 'bookmark-outline'} size={24} color={isWL ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Cover image */}
        {curso.imagem ? (
          <View style={styles.coverWrap}>
            <Image source={{ uri: curso.imagem }} style={styles.coverImg} resizeMode="cover" />
          </View>
        ) : null}

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.badgeText, { color: isDark ? '#000' : '#FFF' }]}>{curso.categoria}</Text>
          </View>
        </View>
        <Text style={[styles.titulo, { color: theme.text }]}>{curso.titulo}</Text>
        <Text style={[styles.descricao, { color: theme.textSecondary }]}>{curso.descricao}</Text>
        {mediaAval && (
          <View style={styles.ratingRow}>
            <StarRating value={Math.round(Number(mediaAval))} readonly theme={theme} />
            <Text style={[styles.ratingVal, { color: theme.primary }]}>{mediaAval}</Text>
            <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>({avaliacoes.length} avaliações)</Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDuracao(curso.duracao)}</Text>
          <Ionicons name="person-outline" size={14} color={theme.textSecondary} style={{ marginLeft: 16 }} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>{curso.instrutor}</Text>
        </View>
      </View>

      {/* Player */}
      {aulaAtual ? (
        <View style={[styles.playerContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.playerHeader}>
            <Text style={[styles.playerBadge, { backgroundColor: theme.primary, color: isDark ? '#000' : '#FFF' }]}>Aula {aulaAtual.ordem}</Text>
            <Text style={[styles.playerTitle, { color: theme.text }]} numberOfLines={1}>{aulaAtual.titulo}</Text>
          </View>
          {getYouTubeId(aulaAtual.url) ? (
            <YoutubePlayer
              height={220}
              videoId={getYouTubeId(aulaAtual.url)}
              play={false}
            />
          ) : (
            <View style={[styles.playerFallback, { backgroundColor: theme.surface }]}>
              <Ionicons name="videocam-off-outline" size={32} color={theme.textTertiary} />
              <Text style={[styles.playerFallbackText, { color: theme.textTertiary }]}>Vídeo não disponível</Text>
            </View>
          )}
          {user && matriculado && (
            <TouchableOpacity
              style={[
                styles.btnCheckAula,
                { borderColor: theme.primary },
                progressoAulas.some((p) => p.aulaId === aulaAtual.id && p.concluido) && { backgroundColor: theme.primary },
              ]}
              onPress={() => toggleAula(aulaAtual)}
            >
              <Ionicons name="checkmark" size={16} color={progressoAulas.some((p) => p.aulaId === aulaAtual.id && p.concluido) ? (isDark ? '#000' : '#FFF') : theme.primary} />
              <Text style={[styles.btnCheckAulaText, { color: theme.primary }, progressoAulas.some((p) => p.aulaId === aulaAtual.id && p.concluido) && { color: isDark ? '#000' : '#FFF' }]}>
                {progressoAulas.some((p) => p.aulaId === aulaAtual.id && p.concluido) ? 'Concluída' : 'Marcar como Concluída'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Ações */}
      {!user ? (
        <View style={styles.acoes}>
          <TouchableOpacity style={[styles.btnLogin, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.btnLoginText, { color: isDark ? '#000' : '#FFF' }]}>Fazer Login para Acessar</Text>
          </TouchableOpacity>
        </View>
      ) : !matriculado ? (
        <View style={styles.acoes}>
          <View style={[styles.matriculaPrompt, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Ionicons name="school-outline" size={28} color={theme.primary} />
            <Text style={[styles.matriculaPromptTitle, { color: theme.text }]}>Matricule-se neste curso</Text>
            <Text style={[styles.matriculaPromptSub, { color: theme.textSecondary }]}>
              Faça sua matrícula para acompanhar seu progresso e acessar todo o conteúdo.
            </Text>
            {totalMatriculados > 0 && (
              <Text style={[styles.matriculaCount, { color: theme.textTertiary }]}>
                {totalMatriculados} {totalMatriculados === 1 ? 'aluno matriculado' : 'alunos matriculados'}
              </Text>
            )}
            <TouchableOpacity style={[styles.btnLogin, { backgroundColor: theme.primary }]} onPress={confirmarMatricula}>
              <Text style={[styles.btnLoginText, { color: isDark ? '#000' : '#FFF' }]}>Matricular-se no Curso</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.acoes}>
          {percentual > 0 && (
            <View style={styles.progressoContainer}>
              <View style={styles.progressoLabel}>
                <Text style={[styles.progressoText, { color: theme.textSecondary }]}>Progresso do curso</Text>
                <Text style={[styles.progressoText, { color: '#34D399' }]}>{percentual}%</Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                <View style={[styles.progressFill, { width: `${percentual}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>
          )}
          <TouchableOpacity
            style={[styles.btnProgresso, { borderColor: theme.primary }, concluido && { backgroundColor: theme.primary }]}
            onPress={toggleConcluido}
          >
            {concluido && <Ionicons name="checkmark" size={16} color={isDark ? '#000' : '#FFF'} />}
            <Text style={[styles.btnProgressoText, { color: theme.primary }, concluido && { color: isDark ? '#000' : '#FFF' }]}>
              {concluido ? 'Concluído' : 'Marcar como Concluído'}
            </Text>
          </TouchableOpacity>
          {concluido && !temCertificado && (
            <TouchableOpacity style={[styles.btnCert, { backgroundColor: theme.primary }]} onPress={emitirCertificado}>
              <Ionicons name="shield-checkmark" size={16} color={isDark ? '#000' : '#FFF'} />
              <Text style={[styles.btnCertText, { color: isDark ? '#000' : '#FFF' }]}>Emitir Certificado</Text>
            </TouchableOpacity>
          )}
          {temCertificado && (
            <View style={styles.certBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#34D399" />
              <Text style={styles.certBadgeText}>Certificado emitido — veja em Meu Perfil</Text>
            </View>
          )}
          {msg ? <Text style={[styles.msg, { color: theme.primary }]}>{msg}</Text> : null}
        </View>
      )}

      {/* Lista de Aulas */}
      {aulas.length > 0 && (
        <View style={[styles.section, { borderTopColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aulas do Curso</Text>

          {/* Lock banner for non-enrolled users */}
          {user && !matriculado && aulas.length > 1 && (
            <TouchableOpacity
              style={[styles.lockBanner, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              onPress={confirmarMatricula}
            >
              <Ionicons name="lock-closed" size={16} color={theme.primary} />
              <Text style={[styles.lockBannerText, { color: theme.textSecondary }]}>
                Você tem acesso à primeira aula gratuitamente.{' '}
                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                  Matricule-se para desbloquear todas as {aulas.length} aulas.
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          {aulas.map((aula) => {
            const concluida = progressoAulas.some((p) => p.aulaId === aula.id && p.concluido);
            const ativa = aulaAtual?.id === aula.id;
            const acessivel = aulaAcessivel(aula);
            return (
              <View
                key={aula.id}
                style={[
                  styles.aulaItem,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                  ativa && { borderColor: theme.primary },
                  !acessivel && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.aulaNumero, { backgroundColor: theme.border }]}>
                  {acessivel
                    ? <Text style={[styles.aulaNumeroText, { color: theme.textSecondary }]}>{aula.ordem}</Text>
                    : <Ionicons name="lock-closed" size={14} color={theme.textSecondary} />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aulaTitulo, { color: theme.text }]}>{aula.titulo}</Text>
                  {aula.descricao ? <Text style={[styles.aulaDesc, { color: theme.textSecondary }]} numberOfLines={1}>{aula.descricao}</Text> : null}
                  {!acessivel && (
                    <Text style={[styles.aulaDesc, { color: theme.primary }]}>Matricule-se para acessar</Text>
                  )}
                </View>
                <View style={styles.aulaAcoes}>
                  {user && matriculado && (
                    <TouchableOpacity
                      style={[styles.btnCheck, { borderColor: theme.primary }, concluida && { backgroundColor: theme.primary }]}
                      onPress={() => toggleAula(aula)}
                    >
                      <Ionicons name="checkmark" size={14} color={concluida ? (isDark ? '#000' : '#FFF') : theme.primary} />
                    </TouchableOpacity>
                  )}
                  {acessivel ? (
                    <TouchableOpacity
                      style={[styles.btnAssistir, { backgroundColor: theme.primary }]}
                      onPress={() => assistirAula(aula)}
                    >
                      <Ionicons name="play" size={12} color={isDark ? '#000' : '#FFF'} />
                      <Text style={[styles.btnAssistirText, { color: isDark ? '#000' : '#FFF' }]}>Assistir</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.btnAssistir, { backgroundColor: theme.border }]}
                      onPress={confirmarMatricula}
                    >
                      <Ionicons name="lock-closed" size={12} color={theme.textSecondary} />
                      <Text style={[styles.btnAssistirText, { color: theme.textSecondary }]}>Desbloquear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Sobre o Curso */}
      <View style={[styles.section, { borderTopColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre o Curso</Text>
        <Text style={[styles.sobreText, { color: theme.textSecondary }]}>{curso.descricaoDetalhada || curso.descricao}</Text>
        <View style={styles.highlights}>
          {[
            { label: 'Duração', value: formatDuracao(curso.duracao) },
            { label: 'Categoria', value: curso.categoria },
            { label: 'Modalidade', value: curso.formaAplicacao || 'Online' },
          ].map((h) => (
            <View key={h.label} style={[styles.highlight, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={[styles.highlightLabel, { color: theme.textTertiary }]}>{h.label}</Text>
              <Text style={[styles.highlightValue, { color: theme.text }]}>{h.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Avaliações */}
      <View style={[styles.section, { borderTopColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Avaliações</Text>
        {user && (
          <View style={styles.avalForm}>
            <Text style={[styles.avalLabel, { color: theme.textSecondary }]}>Avalie este curso:</Text>
            <StarRating value={nota} onChange={setNota} theme={theme} />
            <TextInput
              style={[styles.avalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
              placeholder="Deixe um comentário (opcional)..."
              placeholderTextColor={theme.textTertiary}
              value={comentario}
              onChangeText={setComentario}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={[styles.btnAvaliar, { backgroundColor: theme.primary }]} onPress={enviarAvaliacao}>
              <Text style={[styles.btnAvaliarText, { color: isDark ? '#000' : '#FFF' }]}>Enviar Avaliação</Text>
            </TouchableOpacity>
          </View>
        )}
        {avaliacoes.length === 0 ? (
          <Text style={[styles.emptyAval, { color: theme.textTertiary }]}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
        ) : (
          avaliacoes.map((av) => (
            <View key={av.id} style={[styles.avalItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.avalHeader}>
                <Text style={[styles.avalAutor, { color: theme.text }]}>{av.nomeUsuario || 'Usuário'}</Text>
                <StarRating value={av.nota} readonly theme={theme} />
              </View>
              {av.comentario ? <Text style={[styles.avalComentario, { color: theme.textSecondary }]}>{av.comentario}</Text> : null}
              <Text style={[styles.avalData, { color: theme.textTertiary }]}>
                {new Date(av.dataCriacao).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24 },
  coverWrap: { marginHorizontal: -24, marginBottom: 20, height: 200, overflow: 'hidden' },
  coverImg: { width: '100%', height: '100%' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  backText: { fontSize: 16, flex: 1 },
  headerActions: { position: 'absolute', top: 24, right: 24, flexDirection: 'row', gap: 16 },
  badgeRow: { marginBottom: 12 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  descricao: { fontSize: 14, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ratingVal: { fontWeight: '700' },
  ratingCount: { fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  playerContainer: { marginBottom: 2 },
  playerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  playerBadge: {
    fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  playerTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  playerFallback: {
    height: 220, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  playerFallbackText: { fontSize: 14 },
  btnCheckAula: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, padding: 10, borderRadius: 8, borderWidth: 1,
  },
  btnCheckAulaText: { fontSize: 14, fontWeight: '600' },
  acoes: { padding: 16, gap: 12 },
  progressoContainer: { gap: 8 },
  progressoLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  progressoText: { fontSize: 14 },
  progressBg: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  btnProgresso: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 8, borderWidth: 1,
  },
  btnProgressoText: { fontSize: 15, fontWeight: '600' },
  btnCert: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 8,
  },
  btnCertText: { fontSize: 15, fontWeight: '600' },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(52,211,153,0.1)', padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)',
  },
  certBadgeText: { color: '#34D399', fontSize: 13 },
  msg: { textAlign: 'center', fontSize: 13 },
  matriculaPrompt: {
    borderRadius: 12, borderWidth: 1, padding: 20,
    alignItems: 'center', gap: 10,
  },
  matriculaPromptTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  matriculaPromptSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  matriculaCount: { fontSize: 12 },
  lockBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 12,
  },
  lockBannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  btnLogin: {
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  btnLoginText: { fontSize: 15, fontWeight: '600' },
  section: { padding: 16, borderTopWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  aulaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1,
  },
  aulaNumero: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  aulaNumeroText: { fontSize: 13, fontWeight: '600' },
  aulaTitulo: { fontSize: 14, fontWeight: '600' },
  aulaDesc: { fontSize: 12, marginTop: 2 },
  aulaAcoes: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnCheck: {
    width: 30, height: 30, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  btnAssistir: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6,
  },
  btnAssistirText: { fontSize: 12, fontWeight: '600' },
  sobreText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  highlights: { flexDirection: 'row', gap: 8 },
  highlight: {
    flex: 1, borderRadius: 8, padding: 12, borderWidth: 1,
  },
  highlightLabel: { fontSize: 12, marginBottom: 4 },
  highlightValue: { fontSize: 13, fontWeight: '600' },
  avalForm: { marginBottom: 20, gap: 12 },
  avalLabel: { fontSize: 14 },
  avalInput: {
    borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, textAlignVertical: 'top',
  },
  btnAvaliar: {
    padding: 12, borderRadius: 8, alignItems: 'center',
  },
  btnAvaliarText: { fontSize: 14, fontWeight: '600' },
  emptyAval: { textAlign: 'center', padding: 20 },
  avalItem: {
    borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1,
  },
  avalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  avalAutor: { fontSize: 14, fontWeight: '600' },
  avalComentario: { fontSize: 14, marginBottom: 8 },
  avalData: { fontSize: 12 },
});

export default CourseDetailsScreen;
