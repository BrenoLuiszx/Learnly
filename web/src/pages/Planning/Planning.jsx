import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../Header/Header'
import { cursosAPI, aulasAPI, usuarioDashboardAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import './planning.css'

/* ── Icons ── */
const IconKanban = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconPencil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
)
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pl-spinner">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)

/* ── Config ── */
const DEFAULT_COLS = [
  { id: 'todo',  label: 'A Estudar',    color: '#5b8dd9' },
  { id: 'doing', label: 'Em Progresso', color: '#c9a84c' },
  { id: 'done',  label: 'Concluído',    color: '#4aab7e' },
]
const TIPOS = [
  { id: 'Meta',  label: 'Meta de Estudo', color: '#5b8dd9', icon: <IconTarget /> },
  { id: 'Curso', label: 'Curso',          color: '#c9a84c', icon: <IconBook />   },
  { id: 'Aula',  label: 'Aula',           color: '#8b72c8', icon: <IconPlay />   },
]
const TIPO_MAP = Object.fromEntries(TIPOS.map(t => [t.id, t]))

const EMPTY_FORM = {
  col: 'todo', tipo: 'Meta',
  titulo: '', categoria: '', descricao: '', nota: '',
  cursoId: null, cursoNome: '', aulaId: null, aulaNome: '',
}

// Module-level refs kept in sync with Planning state so CardForm/PlanningCard can read them
let COLS    = DEFAULT_COLS
let COL_IDS = DEFAULT_COLS.map(c => c.id)

/* ── Storage helpers (localStorage used as instant cache only) ── */
const LS_CARDS = (uid) => `learnly_planner_cards_${uid}`
const LS_COLS  = (uid) => `learnly_planner_cols_${uid}`

const lsLoadCards = (uid) => { try { return JSON.parse(localStorage.getItem(LS_CARDS(uid))) || [] } catch { return [] } }
const lsLoadCols  = (uid) => { try { return JSON.parse(localStorage.getItem(LS_COLS(uid)))  || DEFAULT_COLS } catch { return DEFAULT_COLS } }
const lsSave      = (uid, cards, cols) => {
  localStorage.setItem(LS_CARDS(uid), JSON.stringify(cards))
  localStorage.setItem(LS_COLS(uid),  JSON.stringify(cols))
}

/* ─────────────────────────────────────────
   AddColumn
───────────────────────────────────────── */
const COL_COLORS = ['#5b8dd9','#c9a84c','#4aab7e','#8b72c8','#d97b5b','#5bbdd9','#c84c7a']
const AddColumn = ({ colCount, onAdd }) => {
  const [active, setActive] = useState(false)
  const [label,  setLabel]  = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (active) inputRef.current?.focus() }, [active])

  const commit = () => {
    const trimmed = label.trim()
    if (trimmed) onAdd(trimmed, COL_COLORS[colCount % COL_COLORS.length])
    setLabel('')
    setActive(false)
  }

  if (!active) return (
    <div className="kb-add-list-btn" onClick={() => setActive(true)}>
      <IconPlus /> Adicionar lista
    </div>
  )

  return (
    <div className="kb-add-list-form">
      <input
        ref={inputRef}
        className="kb-add-list-input"
        placeholder="Nome da lista..."
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setActive(false); setLabel('') } }}
      />
      <div className="kb-add-list-actions">
        <button className="kb-add-list-confirm" onClick={commit} disabled={!label.trim()}>Adicionar lista</button>
        <button className="kb-add-list-cancel" onClick={() => { setActive(false); setLabel('') }}>✕</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   ColumnHeader — rename + delete
───────────────────────────────────────── */
const ColumnHeader = ({ col, cardCount, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(col.label)
  const [confirm, setConfirm] = useState(false)
  const inputRef = useRef(null)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== col.label) onRename(col.id, trimmed)
    setEditing(false)
  }

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  return (
    <div className="planning-col-header">
      <span className="planning-col-accent" style={{ background: col.color }} />
      {editing ? (
        <input
          ref={inputRef}
          className="planning-col-rename-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        />
      ) : (
        <span className="planning-col-label" title="Clique para renomear" onClick={() => { setDraft(col.label); setEditing(true) }}>
          {col.label}
        </span>
      )}
      <span className="planning-col-count">{cardCount}</span>
      {confirm ? (
        <>
          <button className="planning-col-ctrl-btn planning-col-ctrl-btn--confirm" onClick={() => onDelete(col.id)}>Sim</button>
          <button className="planning-col-ctrl-btn" onClick={() => setConfirm(false)}>Não</button>
        </>
      ) : (
        <button className="planning-col-ctrl-btn planning-col-ctrl-btn--del" onClick={() => setConfirm(true)} title="Excluir coluna">
          <IconTrash />
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   CourseSelect — searchable course picker
───────────────────────────────────────── */
const CourseSelect = ({ value, cursoId, onChange, courses, placeholder = 'Buscar curso...' }) => {
  const [query,  setQuery]  = useState(value || '')
  const [open,   setOpen]   = useState(false)
  const ref = useRef(null)

  // Sync external value reset
  useEffect(() => { setQuery(value || '') }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim()
    ? courses.filter(c => c.titulo.toLowerCase().includes(query.toLowerCase()))
    : courses

  const handleSelect = (course) => {
    setQuery(course.titulo)
    setOpen(false)
    onChange({ cursoId: course.id, cursoNome: course.titulo, categoria: course.categoria || '' })
  }

  const handleInput = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    // Clear selection if user edits after picking
    if (cursoId) onChange({ cursoId: null, cursoNome: e.target.value, categoria: '' })
  }

  return (
    <div className="pl-combobox" ref={ref}>
      <div className="pl-combobox-input-wrap">
        <input
          className="planning-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        <span className="pl-combobox-chevron" onClick={() => setOpen(o => !o)}>
          <IconChevronDown />
        </span>
      </div>
      {open && filtered.length > 0 && (
        <ul className="pl-dropdown">
          {filtered.slice(0, 8).map(c => (
            <li
              key={c.id}
              className={`pl-dropdown-item${c.id === cursoId ? ' selected' : ''}`}
              onMouseDown={() => handleSelect(c)}
            >
              <span className="pl-dropdown-item-title">{c.titulo}</span>
              {c.categoria && <span className="pl-dropdown-item-badge">{c.categoria}</span>}
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="pl-dropdown pl-dropdown--empty">Nenhum curso encontrado</div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   LessonSelect — lesson list for a course
───────────────────────────────────────── */
const LessonSelect = ({ cursoId, aulaId, onChange }) => {
  const [aulas,   setAulas]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cursoId) { setAulas([]); return }
    setLoading(true)
    aulasAPI.listarPorCurso(cursoId)
      .then(r => setAulas(r.data || []))
      .catch(() => setAulas([]))
      .finally(() => setLoading(false))
  }, [cursoId])

  if (!cursoId) return (
    <p className="pl-lesson-hint">Selecione um curso para ver as aulas disponíveis.</p>
  )

  if (loading) return (
    <div className="pl-lesson-loading"><IconSpinner /> Carregando aulas...</div>
  )

  if (aulas.length === 0) return (
    <p className="pl-lesson-hint">Nenhuma aula encontrada para este curso.</p>
  )

  return (
    <ul className="pl-lesson-list">
      {aulas.map((aula, i) => (
        <li
          key={aula.id}
          className={`pl-lesson-item${aula.id === aulaId ? ' selected' : ''}`}
          onClick={() => onChange({ aulaId: aula.id, aulaNome: aula.titulo })}
        >
          <span className="pl-lesson-num">{i + 1}</span>
          <span className="pl-lesson-title">{aula.titulo}</span>
          {aula.id === aulaId && <span className="pl-lesson-check">✓</span>}
        </li>
      ))}
    </ul>
  )
}

/* ─────────────────────────────────────────
   CardForm — shared between add + edit
───────────────────────────────────────── */
const CardForm = ({ value, onChange, courses, onSubmit, onCancel, submitLabel }) => {
  const tipo = TIPO_MAP[value.tipo] || TIPO_MAP['Meta']

  const set = (patch) => onChange({ ...value, ...patch })

  return (
    <div className="planning-form">
      {/* Type tabs */}
      <div className="planning-tipo-tabs">
        {TIPOS.map(t => (
          <button
            key={t.id}
            className={`planning-tipo-tab${value.tipo === t.id ? ' active' : ''}`}
            style={value.tipo === t.id ? { borderColor: t.color, color: t.color } : {}}
            onClick={() => set({ tipo: t.id, titulo: '', cursoId: null, cursoNome: '', aulaId: null, aulaNome: '' })}
          >
            <span className="planning-tipo-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Curso type ── */}
      {value.tipo === 'Curso' && (
        <>
          <div className="planning-modal-field">
            <label className="planning-modal-label">Curso</label>
            <CourseSelect
              value={value.cursoNome}
              cursoId={value.cursoId}
              courses={courses}
              placeholder="Buscar curso..."
              onChange={({ cursoId, cursoNome, categoria }) =>
                set({ cursoId, cursoNome, titulo: cursoNome, categoria })
              }
            />
          </div>
          {value.cursoId && value.categoria && (
            <div className="pl-selected-meta">
              <span className="pl-dropdown-item-badge">{value.categoria}</span>
            </div>
          )}
        </>
      )}

      {/* ── Aula type ── */}
      {value.tipo === 'Aula' && (
        <>
          <div className="planning-modal-field">
            <label className="planning-modal-label">Curso</label>
            <CourseSelect
              value={value.cursoNome}
              cursoId={value.cursoId}
              courses={courses}
              placeholder="Buscar curso..."
              onChange={({ cursoId, cursoNome }) =>
                set({ cursoId, cursoNome, aulaId: null, aulaNome: '', titulo: '' })
              }
            />
          </div>
          <div className="planning-modal-field">
            <label className="planning-modal-label">
              Aula {value.cursoId ? `— ${value.cursoNome}` : ''}
            </label>
            <LessonSelect
              cursoId={value.cursoId}
              aulaId={value.aulaId}
              onChange={({ aulaId, aulaNome }) => set({ aulaId, aulaNome, titulo: aulaNome })}
            />
          </div>
        </>
      )}

      {/* ── Meta type ── */}
      {value.tipo === 'Meta' && (
        <>
          <div className="planning-modal-field">
            <label className="planning-modal-label">Título</label>
            <input
              className="planning-input"
              placeholder="Título da meta..."
              value={value.titulo}
              onChange={e => set({ titulo: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && onSubmit()}
              autoFocus
            />
          </div>
          <div className="planning-modal-field">
            <label className="planning-modal-label">Descrição</label>
            <input
              className="planning-input"
              placeholder="Descrição opcional..."
              value={value.descricao || ''}
              onChange={e => set({ descricao: e.target.value })}
            />
          </div>
        </>
      )}

      {/* Column + Note (all types) */}
      <div className="planning-form-row">
        <div className="planning-modal-field" style={{ flex: 1 }}>
          <label className="planning-modal-label">Coluna</label>
          <select
            className="planning-select"
            value={value.col}
            onChange={e => set({ col: e.target.value })}
            style={{ width: '100%' }}
          >
            {COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="planning-modal-field" style={{ flex: 2 }}>
          <label className="planning-modal-label">Nota</label>
          <input
            className="planning-input"
            placeholder="Nota opcional..."
            value={value.nota || ''}
            onChange={e => set({ nota: e.target.value })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="planning-form-row">
        <button
          className="planning-confirm-btn"
          style={{ background: tipo.color }}
          onClick={onSubmit}
          disabled={!value.titulo.trim()}
        >
          {submitLabel}
        </button>
        <button className="planning-cancel-btn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PlanningCard
───────────────────────────────────────── */
const PlanningCard = ({ card, onDelete, onMove, onEditCard }) => {
  const tipo     = TIPO_MAP[card.tipo] || TIPO_MAP['Meta']
  const isDone   = card.col === 'done'
  const colIndex = COL_IDS.indexOf(card.col)
  const prevCol  = colIndex > 0              ? COLS[colIndex - 1] : null
  const nextCol  = colIndex < COLS.length - 1 ? COLS[colIndex + 1] : null
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`pc pc--${card.tipo.toLowerCase()}`}
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('cardId', card.id) }}
    >
      <span className="pc-accent" style={{ background: tipo.color }} />
      <div className="pc-body">

        {/* Header */}
        <div className="pc-top">
          <span className="pc-icon" style={{ color: tipo.color, background: tipo.color + '18' }}>
            {tipo.icon}
          </span>
          <span className="pc-tipo-badge" style={{ color: tipo.color, borderColor: tipo.color + '40' }}>
            {tipo.label}
          </span>
          <div className="pc-actions">
            <button className="pc-action-btn" onClick={() => onEditCard(card)} title="Editar">
              <IconPencil />
            </button>
            {confirmDelete ? (
              <>
                <button className="pc-action-btn pc-action-btn--confirm" onClick={() => onDelete(card.id)}>Sim</button>
                <button className="pc-action-btn" onClick={() => setConfirmDelete(false)}>Não</button>
              </>
            ) : (
              <button className="pc-action-btn pc-action-btn--del" onClick={() => setConfirmDelete(true)} title="Remover">
                <IconTrash />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <p className="pc-title" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.45 : 1 }}>
          {card.titulo}
        </p>

        {/* Metadata */}
        {card.tipo === 'Curso' && card.categoria && (
          <span className="pc-meta-badge">{card.categoria}</span>
        )}
        {card.tipo === 'Aula' && card.cursoNome && (
          <p className="pc-meta-line"><IconBook /> {card.cursoNome}</p>
        )}
        {card.tipo === 'Meta' && card.descricao && (
          <p className="pc-desc">{card.descricao}</p>
        )}
        {card.nota && <p className="pc-nota">{card.nota}</p>}

        {/* Move */}
        <div className="pc-move-row">
          {prevCol && (
            <button
              className="pc-move-btn pc-move-btn--prev"
              style={{ borderColor: prevCol.color + '50', color: prevCol.color }}
              onClick={() => onMove(card.id, prevCol.id)}
              title={`Mover para ${prevCol.label}`}
            >
              <IconArrowLeft /> {prevCol.label}
            </button>
          )}
          {nextCol && (
            <button
              className="pc-move-btn pc-move-btn--next"
              style={{ borderColor: nextCol.color + '50', color: nextCol.color }}
              onClick={() => onMove(card.id, nextCol.id)}
              title={`Mover para ${nextCol.label}`}
            >
              {nextCol.label} <IconArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PrefillModal — Study Plan import
───────────────────────────────────────── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)

const PrefillModal = ({ suggestions, onConfirm, onClose }) => {
  const [selected, setSelected] = useState(() => new Set(suggestions.map((_, i) => i)))
  const [col, setCol] = useState('todo')

  const toggle = (i) => setSelected(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  const toggleAll = () =>
    setSelected(selected.size === suggestions.length ? new Set() : new Set(suggestions.map((_, i) => i)))

  const handleConfirm = () => {
    const chosen = suggestions.filter((_, i) => selected.has(i))
    if (!chosen.length) return
    onConfirm(chosen, col)
  }

  return (
    <div className="planning-modal-overlay" onClick={onClose}>
      <div className="planning-modal planning-modal--prefill" onClick={e => e.stopPropagation()}>

        <div className="planning-modal-header">
          <span className="planning-modal-icon" style={{ color: '#c9a84c', background: '#c9a84c18' }}>
            <IconMap />
          </span>
          <p className="planning-modal-title">Importar do Plano de Estudo</p>
          <button className="planning-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="planning-modal-body">
          <p className="pl-prefill-hint">
            Selecione os cursos que deseja adicionar ao quadro. Cada um vira um card separado.
          </p>

          <div className="pl-prefill-toggle-all">
            <button className="pl-prefill-toggle-btn" onClick={toggleAll}>
              {selected.size === suggestions.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            <span className="pl-prefill-count">{selected.size} de {suggestions.length} selecionados</span>
          </div>

          <ul className="pl-prefill-list">
            {suggestions.map((s, i) => {
              const active = selected.has(i)
              return (
                <li
                  key={i}
                  className={`pl-prefill-item${active ? ' pl-prefill-item--on' : ''}`}
                  onClick={() => toggle(i)}
                >
                  <span className={`pl-prefill-checkbox${active ? ' pl-prefill-checkbox--on' : ''}`}>
                    {active && <IconCheck />}
                  </span>
                  <span className="pl-prefill-item-body">
                    <span className="pl-prefill-item-title">{s.titulo}</span>
                    {s.categoria && <span className="pl-prefill-item-badge">{s.categoria}</span>}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="planning-modal-field" style={{ marginTop: 4 }}>
            <label className="planning-modal-label">Adicionar na coluna</label>
            <select
              className="planning-select"
              value={col}
              onChange={e => setCol(e.target.value)}
              style={{ width: '100%' }}
            >
              {COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="planning-modal-footer">
          <button
            className="planning-confirm-btn"
            style={{ background: '#c9a84c', flex: 1 }}
            onClick={handleConfirm}
            disabled={selected.size === 0}
          >
            Adicionar {selected.size > 1 ? `${selected.size} cursos` : 'curso'} ao quadro
          </button>
          <button className="planning-cancel-btn" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   EditModal
───────────────────────────────────────── */
const EditModal = ({ card, courses, onSave, onClose }) => {
  const [draft, setDraft] = useState({ ...card })
  const tipo = TIPO_MAP[draft.tipo] || TIPO_MAP['Meta']

  const handleSave = () => {
    if (!draft.titulo.trim()) return
    onSave({ ...draft, titulo: draft.titulo.trim() })
  }

  return (
    <div className="planning-modal-overlay" onClick={onClose}>
      <div className="planning-modal" onClick={e => e.stopPropagation()}>
        <div className="planning-modal-header">
          <span className="planning-modal-icon" style={{ color: tipo.color, background: tipo.color + '18' }}>
            {tipo.icon}
          </span>
          <p className="planning-modal-title">Editar card</p>
          <button className="planning-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="planning-modal-body">
          <CardForm
            value={draft}
            onChange={setDraft}
            courses={courses}
            onSubmit={handleSave}
            onCancel={onClose}
            submitLabel="Salvar alterações"
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Planning (main)
───────────────────────────────────────── */
const Planning = () => {
  const { usuario } = useAuth()
  const location = useLocation()
  const uid = usuario?.id ?? 'guest'

  const [cards,          setCards]          = useState(() => lsLoadCards(uid))
  const [cols,           setCols]           = useState(() => { const c = lsLoadCols(uid); COLS = c; COL_IDS = c.map(x => x.id); return c })
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [adding,         setAdding]         = useState(false)
  const [editingCard,    setEditingCard]     = useState(null)
  const [courses,        setCourses]        = useState([])
  const [loaded,         setLoaded]         = useState(false)
  const [prefillModal,   setPrefillModal]   = useState(null) // array of suggestions | null

  // Debounce ref for API saves
  const saveTimer = useRef(null)

  // Load from API on mount / user change
  useEffect(() => {
    setLoaded(false)
    if (!usuario) {
      // Not logged in: use guest localStorage slot
      const c = lsLoadCols(uid); COLS = c; COL_IDS = c.map(x => x.id)
      setCards(lsLoadCards(uid))
      setCols(c)
      setLoaded(true)
      return
    }
    usuarioDashboardAPI.getPlanejamento()
      .then(r => {
        const remoteCards = JSON.parse(r.data.cards || '[]')
        const remoteCols  = JSON.parse(r.data.cols  || '[]')
        const resolvedCols = remoteCols.length > 0 ? remoteCols : DEFAULT_COLS
        COLS = resolvedCols; COL_IDS = resolvedCols.map(x => x.id)
        setCards(remoteCards)
        setCols(resolvedCols)
        // Keep localStorage in sync as cache
        lsSave(uid, remoteCards, resolvedCols)
      })
      .catch(() => {
        // API failed: fall back to localStorage cache
        const c = lsLoadCols(uid); COLS = c; COL_IDS = c.map(x => x.id)
        setCards(lsLoadCards(uid))
        setCols(c)
      })
      .finally(() => setLoaded(true))
  }, [uid])

  // Persist to API (debounced 600ms) + localStorage immediately
  const persist = useCallback((nextCards, nextCols) => {
    lsSave(uid, nextCards, nextCols)
    clearTimeout(saveTimer.current)
    if (usuario) {
      saveTimer.current = setTimeout(() => {
        usuarioDashboardAPI.savePlanejamento(
          JSON.stringify(nextCards),
          JSON.stringify(nextCols)
        ).catch(() => {})
      }, 600)
    }
  }, [uid, usuario])

  const persistCards = (next) => { setCards(next); persist(next, cols) }
  const persistCols  = (next) => { COLS = next; COL_IDS = next.map(c => c.id); setCols(next); persist(cards, next) }

  const renameCol   = (id, label) => persistCols(cols.map(c => c.id === id ? { ...c, label } : c))
  const deleteCol   = (id) => {
    const nextCols  = cols.filter(c => c.id !== id)
    const nextCards = cards.filter(c => c.col !== id)
    COLS = nextCols; COL_IDS = nextCols.map(c => c.id)
    setCols(nextCols); setCards(nextCards); persist(nextCards, nextCols)
  }

  // Load all courses once
  useEffect(() => {
    cursosAPI.listarTodos()
      .then(r => setCourses(r.data || []))
      .catch(() => {})
  }, [])

  const addCard    = ()        => {
    if (!form.titulo.trim()) return
    const next = [...cards, { id: Date.now(), ...form, titulo: form.titulo.trim() }]
    persistCards(next)
    setForm(EMPTY_FORM)
    setAdding(false)
  }
  const moveCard   = (id, col) => persistCards(cards.map(c => c.id === id ? { ...c, col } : c))
  const deleteCard = (id)      => persistCards(cards.filter(c => c.id !== id))
  const saveCard   = (updated) => { persistCards(cards.map(c => c.id === updated.id ? updated : c)); setEditingCard(null) }

  // Bulk-add confirmed courses from PrefillModal — each becomes its own card
  const confirmPrefill = (chosen, col) => {
    const now = Date.now()
    const newCards = chosen.map((c, i) => ({
      id: now + i,
      tipo: 'Curso',
      col,
      titulo: c.titulo,
      cursoId: c.cursoId,
      cursoNome: c.cursoNome,
      categoria: c.categoria || '',
      nota: c.nota || '',
      descricao: '',
    }))
    persistCards([...cards, ...newCards])
    setPrefillModal(null)
  }

  // Open the prefill modal as soon as location.state carries suggestions.
  // Using a key derived from the state object means re-navigation always
  // triggers the modal without needing a page refresh.
  useEffect(() => {
    const suggestions = location.state?.prefillCards
    if (!suggestions?.length) return
    setPrefillModal(suggestions)
    // Clear the state so back-navigation doesn't re-open the modal
    window.history.replaceState({}, '')
  }, [location.state])

  const total = cards.length
  const done  = cards.filter(c => c.col === 'done').length

  return (
    <div className="planning-page">
      <Header />

      {/* Top bar */}
      <div className="planning-topbar">
        <div className="planning-topbar-left">
          <IconKanban />
          <div>
            <h1 className="planning-title">Meu Planejamento</h1>
            {total > 0 && <p className="planning-subtitle">{done} de {total} itens concluídos</p>}
          </div>
        </div>
        <button className="planning-add-btn" onClick={() => { setAdding(a => !a); setForm(EMPTY_FORM) }}>
          <IconPlus /> Novo card
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="planning-progress-wrap">
          <div className="planning-progress-track">
            <div className="planning-progress-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="planning-form-wrap">
          <CardForm
            value={form}
            onChange={setForm}
            courses={courses}
            onSubmit={addCard}
            onCancel={() => setAdding(false)}
            submitLabel={`Adicionar ${TIPO_MAP[form.tipo]?.label || 'card'}`}
          />
        </div>
      )}

      {/* Edit modal */}
      {editingCard && (
        <EditModal
          card={editingCard}
          courses={courses}
          onSave={saveCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {/* Prefill modal — Study Plan import */}
      {prefillModal && (
        <PrefillModal
          suggestions={prefillModal}
          onConfirm={confirmPrefill}
          onClose={() => setPrefillModal(null)}
        />
      )}

      {/* Board */}
      <div className="planning-board">
        {!loaded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--pl-text-3)', fontSize: '0.85rem', padding: '24px' }}>
            <IconSpinner /> Carregando planejamento...
          </div>
        ) : (
          <>
            {cols.map(col => {
              const colCards = cards.filter(c => c.col === col.id)
              return (
                <div key={col.id} className="kb-list">
                  <ColumnHeader
                    col={col}
                    cardCount={colCards.length}
                    onRename={renameCol}
                    onDelete={deleteCol}
                  />
                  <div
                    className="kb-list-cards"
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
                    onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const id = Number(e.dataTransfer.getData('cardId')); if (id) moveCard(id, col.id) }}
                  >
                    {colCards.map(card => (
                      <PlanningCard
                        key={card.id}
                        card={card}
                        onDelete={deleteCard}
                        onMove={moveCard}
                        onEditCard={setEditingCard}
                      />
                    ))}
                    {colCards.length === 0 && (
                      <div className="kb-list-empty">Nenhum item</div>
                    )}
                  </div>
                </div>
              )
            })}
            <AddColumn
              colCount={cols.length}
              onAdd={(label, color) => persistCols([...cols, { id: `col_${Date.now()}`, label, color }])}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Planning
