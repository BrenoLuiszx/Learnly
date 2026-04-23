import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { cursosAPI, aulasAPI, planejamentoAPI } from '../services/api';

const DEFAULT_COLS = [
  { id: 'todo',  label: 'A Estudar',    color: '#5b8dd9' },
  { id: 'doing', label: 'Em Progresso', color: '#c9a84c' },
  { id: 'done',  label: 'Concluído',    color: '#4aab7e' },
];

const TIPOS = [
  { id: 'Meta',  label: 'Meta',   icon: 'flag',    color: '#5b8dd9' },
  { id: 'Curso', label: 'Curso',  icon: 'book',    color: '#c9a84c' },
  { id: 'Aula',  label: 'Aula',   icon: 'play',    color: '#8b72c8' },
];

const EMPTY_FORM = { col: 'todo', tipo: 'Meta', titulo: '', descricao: '', nota: '', cursoId: null, cursoNome: '', aulaId: null, aulaNome: '' };

const PlanningScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [cards, setCards] = useState([]);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [aulas, setAulas] = useState([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const saveTimer = useRef(null);

  useFocusEffect(
    useCallback(() => {
      load();
      cursosAPI.listarTodos().then(r => setCourses(r.data || [])).catch(() => {});
    }, [])
  );

  const load = async () => {
    try {
      setLoading(true);
      const r = await planejamentoAPI.get();
      const remoteCards = JSON.parse(r.data.cards || '[]');
      const remoteCols  = JSON.parse(r.data.cols  || '[]');
      setCards(remoteCards);
      setCols(remoteCols.length > 0 ? remoteCols : DEFAULT_COLS);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  const persist = (nextCards, nextCols) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      planejamentoAPI.save(JSON.stringify(nextCards), JSON.stringify(nextCols)).catch(() => {});
    }, 600);
  };

  const updateCards = (next) => { setCards(next); persist(next, cols); };

  const openAdd = () => {
    setEditCard(null);
    setForm(EMPTY_FORM);
    setAulas([]);
    setCourseSearch('');
    setModalVisible(true);
  };

  const openEdit = (card) => {
    setEditCard(card);
    setForm({ ...card });
    setAulas([]);
    setCourseSearch(card.cursoNome || '');
    if (card.cursoId && card.tipo === 'Aula') loadAulas(card.cursoId);
    setModalVisible(true);
  };

  const loadAulas = async (cursoId) => {
    setLoadingAulas(true);
    try {
      const r = await aulasAPI.listarPorCurso(cursoId);
      setAulas(r.data || []);
    } catch {
      setAulas([]);
    } finally {
      setLoadingAulas(false);
    }
  };

  const selectCourse = (curso) => {
    setCourseSearch(curso.titulo);
    setForm(f => ({ ...f, cursoId: curso.id, cursoNome: curso.titulo, titulo: f.tipo === 'Curso' ? curso.titulo : f.titulo, aulaId: null, aulaNome: '' }));
    if (form.tipo === 'Aula') loadAulas(curso.id);
  };

  const submit = () => {
    if (!form.titulo.trim()) return;
    if (editCard) {
      const next = cards.map(c => c.id === editCard.id ? { ...form, id: editCard.id, titulo: form.titulo.trim() } : c);
      updateCards(next);
    } else {
      updateCards([...cards, { ...form, id: Date.now(), titulo: form.titulo.trim() }]);
    }
    setModalVisible(false);
  };

  const deleteCard = (id) => {
    Alert.alert('Remover', 'Remover este card?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => updateCards(cards.filter(c => c.id !== id)) },
    ]);
  };

  const moveCard = (id, colId) => updateCards(cards.map(c => c.id === id ? { ...c, col: colId } : c));

  const total = cards.length;
  const done  = cards.filter(c => c.col === 'done').length;

  const filteredCourses = courseSearch.trim()
    ? courses.filter(c => c.titulo.toLowerCase().includes(courseSearch.toLowerCase()))
    : courses.slice(0, 8);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={20} color={isDark ? '#000' : '#FFF'} />
          </View>
          <Text style={[styles.logoText, { color: theme.primary }]}>LEARNLY</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={openAdd}
          >
            <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
            <Text style={[styles.addBtnText, { color: isDark ? '#000' : '#FFF' }]}>Novo</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Meu Planejamento</Text>
        {total > 0 && (
          <>
            <Text style={[styles.pageSub, { color: theme.textSecondary }]}>{done} de {total} itens concluídos</Text>
            <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${Math.round((done / total) * 100)}%`, backgroundColor: theme.primary }]} />
            </View>
          </>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.board}>
          {cols.map(col => {
            const colCards = cards.filter(c => c.col === col.id);
            return (
              <View key={col.id} style={styles.colSection}>
                <View style={styles.colHeader}>
                  <View style={[styles.colAccent, { backgroundColor: col.color }]} />
                  <Text style={[styles.colLabel, { color: theme.text }]}>{col.label}</Text>
                  <View style={[styles.colCount, { backgroundColor: col.color + '33' }]}>
                    <Text style={[styles.colCountText, { color: col.color }]}>{colCards.length}</Text>
                  </View>
                </View>

                {colCards.length === 0 ? (
                  <View style={[styles.emptyCol, { borderColor: theme.border }]}>
                    <Text style={[styles.emptyColText, { color: theme.textTertiary }]}>Nenhum item</Text>
                  </View>
                ) : (
                  colCards.map(card => {
                    const tipo = TIPOS.find(t => t.id === card.tipo) || TIPOS[0];
                    const colIndex = cols.findIndex(c => c.id === card.col);
                    const prevCol = colIndex > 0 ? cols[colIndex - 1] : null;
                    const nextCol = colIndex < cols.length - 1 ? cols[colIndex + 1] : null;
                    return (
                      <View key={card.id} style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <View style={[styles.cardAccent, { backgroundColor: tipo.color }]} />
                        <View style={styles.cardBody}>
                          <View style={styles.cardTop}>
                            <View style={[styles.tipoBadge, { backgroundColor: tipo.color + '22' }]}>
                              <Ionicons name={tipo.icon} size={12} color={tipo.color} />
                              <Text style={[styles.tipoText, { color: tipo.color }]}>{tipo.label}</Text>
                            </View>
                            <View style={styles.cardActions}>
                              <TouchableOpacity onPress={() => openEdit(card)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => deleteCard(card.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Text style={[styles.cardTitle, { color: theme.text, textDecorationLine: card.col === 'done' ? 'line-through' : 'none', opacity: card.col === 'done' ? 0.5 : 1 }]}>
                            {card.titulo}
                          </Text>
                          {card.tipo === 'Aula' && card.cursoNome ? (
                            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{card.cursoNome}</Text>
                          ) : null}
                          {card.tipo === 'Meta' && card.descricao ? (
                            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{card.descricao}</Text>
                          ) : null}
                          {card.nota ? <Text style={[styles.cardNota, { color: theme.textTertiary }]}>{card.nota}</Text> : null}
                          <View style={styles.moveRow}>
                            {prevCol && (
                              <TouchableOpacity
                                style={[styles.moveBtn, { borderColor: prevCol.color + '66' }]}
                                onPress={() => moveCard(card.id, prevCol.id)}
                              >
                                <Ionicons name="arrow-back" size={12} color={prevCol.color} />
                                <Text style={[styles.moveBtnText, { color: prevCol.color }]}>{prevCol.label}</Text>
                              </TouchableOpacity>
                            )}
                            {nextCol && (
                              <TouchableOpacity
                                style={[styles.moveBtn, { borderColor: nextCol.color + '66' }]}
                                onPress={() => moveCard(card.id, nextCol.id)}
                              >
                                <Text style={[styles.moveBtnText, { color: nextCol.color }]}>{nextCol.label}</Text>
                                <Ionicons name="arrow-forward" size={12} color={nextCol.color} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{editCard ? 'Editar card' : 'Novo card'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Tipo tabs */}
              <View style={styles.tipoTabs}>
                {TIPOS.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tipoTab, form.tipo === t.id && { borderColor: t.color, backgroundColor: t.color + '18' }]}
                    onPress={() => setForm(f => ({ ...f, tipo: t.id, titulo: '', cursoId: null, cursoNome: '', aulaId: null, aulaNome: '' }))}
                  >
                    <Ionicons name={t.icon} size={14} color={form.tipo === t.id ? t.color : theme.textSecondary} />
                    <Text style={[styles.tipoTabText, { color: form.tipo === t.id ? t.color : theme.textSecondary }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Meta fields */}
              {form.tipo === 'Meta' && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Título</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                    placeholder="Título da meta..."
                    placeholderTextColor={theme.textTertiary}
                    value={form.titulo}
                    onChangeText={v => setForm(f => ({ ...f, titulo: v }))}
                  />
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Descrição</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                    placeholder="Descrição opcional..."
                    placeholderTextColor={theme.textTertiary}
                    value={form.descricao}
                    onChangeText={v => setForm(f => ({ ...f, descricao: v }))}
                  />
                </>
              )}

              {/* Curso / Aula fields */}
              {(form.tipo === 'Curso' || form.tipo === 'Aula') && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Curso</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                    placeholder="Buscar curso..."
                    placeholderTextColor={theme.textTertiary}
                    value={courseSearch}
                    onChangeText={v => { setCourseSearch(v); setForm(f => ({ ...f, cursoId: null, cursoNome: v, titulo: f.tipo === 'Curso' ? v : f.titulo })); }}
                  />
                  {filteredCourses.length > 0 && !form.cursoId && (
                    <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                      {filteredCourses.map(c => (
                        <TouchableOpacity key={c.id} style={styles.dropdownItem} onPress={() => selectCourse(c)}>
                          <Text style={[styles.dropdownTitle, { color: theme.text }]} numberOfLines={1}>{c.titulo}</Text>
                          <Text style={[styles.dropdownBadge, { color: theme.primary }]}>{c.categoria}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              {/* Aula picker */}
              {form.tipo === 'Aula' && form.cursoId && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Aula</Text>
                  {loadingAulas ? (
                    <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 8 }} />
                  ) : aulas.length === 0 ? (
                    <Text style={[styles.hint, { color: theme.textTertiary }]}>Nenhuma aula encontrada.</Text>
                  ) : (
                    aulas.map((a, i) => (
                      <TouchableOpacity
                        key={a.id}
                        style={[styles.aulaItem, { borderColor: form.aulaId === a.id ? theme.primary : theme.border, backgroundColor: form.aulaId === a.id ? theme.primary + '18' : theme.inputBg }]}
                        onPress={() => setForm(f => ({ ...f, aulaId: a.id, aulaNome: a.titulo, titulo: a.titulo }))}
                      >
                        <Text style={[styles.aulaNum, { color: theme.textTertiary }]}>{i + 1}</Text>
                        <Text style={[styles.aulaTitulo, { color: theme.text }]} numberOfLines={1}>{a.titulo}</Text>
                        {form.aulaId === a.id && <Ionicons name="checkmark" size={16} color={theme.primary} />}
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}

              {/* Column */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Coluna</Text>
              <View style={styles.colPicker}>
                {cols.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.colPickerBtn, { borderColor: form.col === c.id ? c.color : theme.border, backgroundColor: form.col === c.id ? c.color + '22' : 'transparent' }]}
                    onPress={() => setForm(f => ({ ...f, col: c.id }))}
                  >
                    <Text style={[styles.colPickerText, { color: form.col === c.id ? c.color : theme.textSecondary }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note */}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nota</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Nota opcional..."
                placeholderTextColor={theme.textTertiary}
                value={form.nota}
                onChangeText={v => setForm(f => ({ ...f, nota: v }))}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: form.titulo.trim() ? 1 : 0.5 }]}
                onPress={submit}
                disabled={!form.titulo.trim()}
              >
                <Text style={[styles.submitBtnText, { color: isDark ? '#000' : '#FFF' }]}>
                  {editCard ? 'Salvar alterações' : 'Adicionar card'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontSize: 16, fontWeight: '600', letterSpacing: 2, flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  pageSub: { fontSize: 14, marginBottom: 12 },
  progressBg: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  board: { padding: 16, gap: 24 },
  colSection: { gap: 8 },
  colHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  colAccent: { width: 4, height: 20, borderRadius: 2 },
  colLabel: { fontSize: 16, fontWeight: '700', flex: 1 },
  colCount: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  colCountText: { fontSize: 12, fontWeight: '700' },
  emptyCol: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, padding: 16, alignItems: 'center' },
  emptyColText: { fontSize: 13 },
  card: { borderRadius: 10, borderWidth: 1, flexDirection: 'row', overflow: 'hidden', marginBottom: 8 },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 12, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  tipoText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12 },
  cardNota: { fontSize: 12, fontStyle: 'italic' },
  moveRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  moveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  moveBtnText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  tipoTabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tipoTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingVertical: 8, borderColor: 'transparent' },
  tipoTabText: { fontSize: 12, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  dropdown: { borderWidth: 1, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(128,128,128,0.2)' },
  dropdownTitle: { fontSize: 14, flex: 1 },
  dropdownBadge: { fontSize: 11, fontWeight: '600', marginLeft: 8 },
  hint: { fontSize: 13, marginVertical: 8 },
  aulaItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 6 },
  aulaNum: { fontSize: 12, fontWeight: '600', minWidth: 20 },
  aulaTitulo: { flex: 1, fontSize: 14 },
  colPicker: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  colPickerBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  colPickerText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 20 },
  submitBtnText: { fontSize: 15, fontWeight: '700' },
});

export default PlanningScreen;
