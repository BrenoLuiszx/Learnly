import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import { cursosAPI, aulasAPI, usuarioDashboardAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/planning.css'

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
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
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
  dueDate: '', dueTime: '', status: 'pending',
}

/* ── Status helpers ── */
const isOverdue = (card) => {
  if (!card.dueDate || card.status === 'completed') return false
  const today = new Date(); today.setHours(0,0,0,0)
  return new Date(card.dueDate + 'T00:00:00') < today
}
const isUpcoming = (card) => {
  if (!card.dueDate || card.status === 'completed') return false
  const today = new Date(); today.setHours(0,0,0,0)
  const due = new Date(card.dueDate + 'T00:00:00')
  const diff = (due - today) / 86400000
  return diff >= 0 && diff <= 3
}
const STATUS_LABEL = { pending: 'Pendente', completed: 'Concluído' }
const STATUS_COLOR = { pending: '#c9a84c', completed: '#4aab7e' }

// Module-level refs kept in sync with Planning state so CardForm/PlanningCard can read them
let COLS    = DEFAULT_COLS
let COL_IDS = DEFAULT_COLS.map(c => c.id)

/* ── Storage helpers ── */
const LS_CARDS = (uid) => `learnly_planner_cards_${uid}`
const LS_COLS  = (uid) => `learnly_planner_cols_${uid}`

const lsLoadCards = (uid) => { try { return JSON.parse(localStorage.getItem(LS_CARDS(uid))) || [] } catch { return [] } }
const lsLoadCols  = (uid) => { try { return JSON.parse(localStorage.getItem(LS_COLS(uid)))  || DEFAULT_COLS } catch { return DEFAULT_COLS } }
const lsSave      = (uid, cards, cols) => {
  localStorage.setItem(LS_CARDS(uid), JSON.stringify(cards))
  localStorage.setItem(LS_COLS(uid),  JSON.stringify(cols))
}

/* Derive a stable, non-guessable key for unauthenticated visitors.
   Each anonymous browser gets its own slot so guest data never
   bleeds into a real account that later logs in on the same device. */
const getAnonKey = () => {
  const k = 'learnly_anon_id'
  let id = localStorage.getItem(k)
  if (!id) { id = 'anon_' + Math.random().toString(36).slice(2, 10); localStorage.setItem(k, id) }
  return id
}
const resolveUid = (usuario) => usuario?.id ? String(usuario.id) : getAnonKey()

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
          {filtered.slice(0, 20).map(c => (
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

      {/* Column + Status */}
      <div className="planning-form-row">
        <div className="planning-modal-field" style={{ flex: 1 }}>
          <label className="planning-modal-label">Coluna</label>
          <select className="planning-select" value={value.col} onChange={e => set({ col: e.target.value })} style={{ width: '100%' }}>
            {COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="planning-modal-field" style={{ flex: 1 }}>
          <label className="planning-modal-label">Status</label>
          <select className="planning-select" value={value.status || 'pending'} onChange={e => set({ status: e.target.value })} style={{ width: '100%' }}>
            <option value="pending">Pendente</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>
      {/* Date + Time */}
      <div className="planning-form-row">
        <div className="planning-modal-field" style={{ flex: 1 }}>
          <label className="planning-modal-label">Data</label>
          <input type="date" className="planning-input planning-input--date" value={value.dueDate || ''} onChange={e => set({ dueDate: e.target.value })} />
        </div>
        <div className="planning-modal-field" style={{ flex: 1 }}>
          <label className="planning-modal-label">Horário</label>
          <input type="time" className="planning-input planning-input--date" value={value.dueTime || ''} onChange={e => set({ dueTime: e.target.value })} />
        </div>
      </div>
      <div className="planning-modal-field">
        <label className="planning-modal-label">Nota</label>
        <input className="planning-input" placeholder="Nota opcional..." value={value.nota || ''} onChange={e => set({ nota: e.target.value })} />
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
   ScheduleInline — compact date+time picker
───────────────────────────────────────── */
const ScheduleInline = ({ cardId, dueDate, dueTime, onSchedule, onClear }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(dueDate || '')
  const [time, setTime] = useState(dueTime || '')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const commit = () => {
    if (!date) return
    onSchedule(cardId, date, time)
    setOpen(false)
  }

  if (!open) return (
    <button
      className={`pc-schedule-btn${dueDate ? ' pc-schedule-btn--set' : ''}`}
      onClick={e => { e.stopPropagation(); setDate(dueDate || ''); setTime(dueTime || ''); setOpen(true) }}
      title={dueDate ? 'Reagendar' : 'Agendar no calendário'}
    >
      <IconCalendar />
      {dueDate
        ? new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : 'Agendar'}
    </button>
  )

  return (
    <div className="pc-schedule-popover" ref={ref} onClick={e => e.stopPropagation()}>
      <input
        type="date"
        className="planning-input planning-input--date pc-schedule-date"
        value={date}
        onChange={e => setDate(e.target.value)}
        autoFocus
      />
      <input
        type="time"
        className="planning-input planning-input--date pc-schedule-time"
        value={time}
        onChange={e => setTime(e.target.value)}
      />
      <div className="pc-schedule-actions">
        <button className="pc-schedule-confirm" onClick={commit} disabled={!date}>OK</button>
        {dueDate && <button className="pc-schedule-clear" onClick={e => { e.stopPropagation(); onClear(cardId); setOpen(false) }}>Remover</button>}
        <button className="pc-schedule-cancel" onClick={e => { e.stopPropagation(); setOpen(false) }}>✕</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PlanningCard
───────────────────────────────────────── */
const PlanningCard = ({ card, highlighted, flashing, dimmed, onDelete, onMove, onEditCard, onToggleStatus, onScheduleCard }) => {
  const tipo     = TIPO_MAP[card.tipo] || TIPO_MAP['Meta']
  const isDone   = card.status === 'completed'
  const overdue  = isOverdue(card)
  const upcoming = isUpcoming(card)
  const colIndex = COL_IDS.indexOf(card.col)
  const prevCol  = colIndex > 0              ? COLS[colIndex - 1] : null
  const nextCol  = colIndex < COLS.length - 1 ? COLS[colIndex + 1] : null
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`pc pc--${card.tipo.toLowerCase()}${overdue ? ' pc--overdue' : ''}${upcoming ? ' pc--upcoming' : ''}${isDone ? ' pc--done' : ''}${highlighted ? ' pc--highlighted' : ''}${flashing ? ' pc--flash' : ''}${dimmed ? ' pc--dimmed' : ''}`}
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
        <div className="pc-footer">
          <ScheduleInline
            cardId={card.id}
            dueDate={card.dueDate}
            dueTime={card.dueTime}
            onSchedule={onScheduleCard}
            onClear={(id) => onScheduleCard(id, '', '')}
          />
          {card.dueDate && (
            <span className={`pc-due${overdue ? ' pc-due--overdue' : ''}${upcoming ? ' pc-due--upcoming' : ''}${isDone ? ' pc-due--done' : ''}`}>
              {card.dueTime && <><IconClock />{card.dueTime}</>}
              {overdue  && <span className="pc-overdue-badge">Atrasado</span>}
              {upcoming && !overdue && <span className="pc-upcoming-badge">Em breve</span>}
            </span>
          )}
          <button
            className={`pc-status-toggle pc-status-dot--${card.status || 'pending'}`}
            title={isDone ? 'Marcar como pendente' : 'Marcar como concluído'}
            onClick={e => { e.stopPropagation(); onToggleStatus(card.id) }}
          >
            {isDone ? <IconCheckCircle /> : <IconCircle />}
          </button>
        </div>
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
   InlineAdd — quick add card inside a column
───────────────────────────────────────── */
const InlineAdd = ({ colId, onAdd }) => {
  const [active, setActive] = useState(false)
  const [title,  setTitle]  = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (active) inputRef.current?.focus() }, [active])

  const commit = () => {
    if (title.trim()) onAdd(colId, title.trim())
    setTitle('')
    setActive(false)
  }

  if (!active) return (
    <button className="kb-inline-add-btn" onClick={() => setActive(true)}>
      <IconPlus /> Adicionar card
    </button>
  )

  return (
    <div className="kb-inline-add-form">
      <input
        ref={inputRef}
        className="planning-input"
        placeholder="Título do card..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setActive(false); setTitle('') } }}
      />
      <div className="planning-form-row">
        <button className="planning-confirm-btn" style={{ flex: 1 }} onClick={commit} disabled={!title.trim()}>Adicionar</button>
        <button className="planning-cancel-btn" onClick={() => { setActive(false); setTitle('') }}>✕</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   CalendarView
───────────────────────────────────────── */
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

/* ── state pill helper ── */
const cardStatePill = (card) => {
  if (card.status === 'completed') return { label: 'Concluído', cls: 'cal-state--done' }
  if (isOverdue(card))             return { label: 'Atrasado',  cls: 'cal-state--overdue' }
  if (isUpcoming(card))            return { label: 'Em breve',  cls: 'cal-state--upcoming' }
  return                                  { label: 'Pendente',  cls: 'cal-state--pending' }
}

const CalendarView = ({ cards, selectedDate, onSelectDate, onEditCard, onAssignDate, onToggleStatus, onScheduleCard }) => {
  const today = new Date()
  const [cursor,   setCursor]   = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [dragOver, setDragOver] = useState(null)

  // When a date with cards is selected, auto-navigate the calendar to that month
  useEffect(() => {
    if (!selectedDate) return
    const [y, m] = selectedDate.split('-').map(Number)
    setCursor({ year: y, month: m - 1 })
  }, [selectedDate])

  const { year, month } = cursor
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const toKey    = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  const byDate = {}
  cards.forEach(c => {
    if (c.dueDate) { byDate[c.dueDate] = byDate[c.dueDate] || []; byDate[c.dueDate].push(c) }
  })

  const prevMonth = () => setCursor(c => c.month === 0 ? { year: c.year-1, month: 11 } : { ...c, month: c.month-1 })
  const nextMonth = () => setCursor(c => c.month === 11 ? { year: c.year+1, month: 0  } : { ...c, month: c.month+1 })

  const sortByTime    = (arr) => [...arr].sort((a,b) => (a.dueTime||'99:99').localeCompare(b.dueTime||'99:99'))
  const selectedCards = selectedDate ? sortByTime(byDate[selectedDate] || []) : []
  const unscheduled   = cards.filter(c => !c.dueDate)

  const handleCellDragOver  = (e, key) => { e.preventDefault(); setDragOver(key) }
  const handleCellDragLeave = ()       => setDragOver(null)
  const handleCellDrop = (e, key) => {
    e.preventDefault()
    setDragOver(null)
    const id = Number(e.dataTransfer.getData('cardId'))
    if (id) { onScheduleCard(id, key, ''); onSelectDate(key) }
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="cal-layout">
      <div className="cal-panel">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth}><IconArrowLeft /></button>
          <span className="cal-nav-title">{MONTHS_PT[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth}><IconArrowRight /></button>
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map(w => <div key={w} className="cal-weekday">{w}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} className="cal-cell cal-cell--empty" />
            const key        = toKey(year, month, day)
            const dayCards   = byDate[key] || []
            const isToday    = key === todayKey
            const isSelected = key === selectedDate
            const isDragOver = key === dragOver
            const hasOverdue = dayCards.some(c => isOverdue(c))
            const allDone    = dayCards.length > 0 && dayCards.every(c => c.status === 'completed')
            const hasPending = dayCards.some(c => c.status !== 'completed')
            return (
              <div
                key={key}
                className={[
                  'cal-cell',
                  isToday    ? 'cal-cell--today'     : '',
                  isSelected ? 'cal-cell--selected'  : '',
                  isDragOver ? 'cal-cell--drag-over' : '',
                  dayCards.length ? 'cal-cell--has-events' : '',
                  hasOverdue ? 'cal-cell--overdue'   : '',
                  allDone    ? 'cal-cell--all-done'  : '',
                  hasPending && !hasOverdue ? 'cal-cell--has-pending' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => onSelectDate(isSelected ? null : key)}
                onDragOver={e => handleCellDragOver(e, key)}
                onDragLeave={handleCellDragLeave}
                onDrop={e => handleCellDrop(e, key)}
              >
                <span className="cal-day-num">{day}</span>
                {dayCards.length > 0 && (
                  <div className="cal-dots">
                    {dayCards.slice(0, 3).map(c => {
                      const t    = TIPO_MAP[c.tipo] || TIPO_MAP['Meta']
                      const pill = cardStatePill(c)
                      return <span key={c.id} className={`cal-dot cal-dot--${c.status === 'completed' ? 'done' : isOverdue(c) ? 'overdue' : 'pending'}`} style={{ background: t.color }} title={`${c.titulo} · ${pill.label}`} />
                    })}
                    {dayCards.length > 3 && <span className="cal-dot-more">+{dayCards.length - 3}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Side panel ── */}
      <div className="cal-side">
        {selectedDate ? (
          <>
            <div className="cal-side-header">
              <span className="cal-side-date">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button className="cal-side-close" onClick={() => onSelectDate(null)}>✕</button>
            </div>

            {selectedCards.length === 0 ? (
              <div className="cal-side-empty">
                <p>Nenhum item neste dia.</p>
                <button className="cal-side-add-btn" onClick={() => onAssignDate(selectedDate)}>
                  <IconPlus /> Adicionar item
                </button>
              </div>
            ) : (
              <>
                <div className="cal-side-cards">
                  {selectedCards.map(card => {
                    const t       = TIPO_MAP[card.tipo] || TIPO_MAP['Meta']
                    const done    = card.status === 'completed'
                    const overdue = isOverdue(card)
                    const pill    = cardStatePill(card)
                    return (
                      <div
                        key={card.id}
                        className={`cal-event-card${done ? ' cal-event-card--done' : ''}${overdue ? ' cal-event-card--overdue' : ''}`}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('cardId', card.id) }}
                      >
                        <span className="cal-event-accent" style={{ background: t.color }} />
                        <div className="cal-event-body">
                          <div className="cal-event-top">
                            <span className="cal-event-icon" style={{ color: t.color }}>{t.icon}</span>
                            <span className="cal-event-badge" style={{ color: t.color, borderColor: t.color+'40' }}>{t.label}</span>
                            {card.dueTime && <span className="cal-event-time"><IconClock />{card.dueTime}</span>}
                            <span className={`cal-state-pill ${pill.cls}`}>{pill.label}</span>
                            <button
                              className={`cal-event-status-btn${done ? ' cal-event-status-btn--done' : ''}`}
                              onClick={e => { e.stopPropagation(); onToggleStatus(card.id) }}
                              title={done ? 'Marcar como pendente' : 'Marcar como concluído'}
                            >
                              {done ? <IconCheckCircle /> : <IconCircle />}
                            </button>
                          </div>
                          <p
                            className="cal-event-title"
                            style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.45 : 1 }}
                            onClick={() => onEditCard(card)}
                          >
                            {card.titulo}
                          </p>
                          {card.nota && <p className="cal-event-nota">{card.nota}</p>}
                          <ScheduleInline
                            cardId={card.id}
                            dueDate={card.dueDate}
                            dueTime={card.dueTime}
                            onSchedule={(id, date, time) => { onScheduleCard(id, date, time); onSelectDate(date || null) }}
                            onClear={(id) => { onScheduleCard(id, '', ''); onSelectDate(null) }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="cal-side-add-btn" onClick={() => onAssignDate(selectedDate)}>
                  <IconPlus /> Adicionar item neste dia
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="cal-side-header">
              <span className="cal-side-date">Não agendados</span>
              {unscheduled.length > 0 && (
                <span className="cal-side-unscheduled-count">{unscheduled.length}</span>
              )}
            </div>
            {unscheduled.length === 0 ? (
              <p className="cal-side-hint">✓ Todos os itens têm data atribuída.</p>
            ) : (
              <>
                <p className="cal-side-hint cal-side-hint--top">Arraste um item para um dia do calendário ou use o botão Agendar.</p>
                <div className="cal-side-cards">
                  {unscheduled.map(card => {
                    const t    = TIPO_MAP[card.tipo] || TIPO_MAP['Meta']
                    const done = card.status === 'completed'
                    const pill = cardStatePill(card)
                    return (
                      <div
                        key={card.id}
                        className={`cal-event-card cal-event-card--unscheduled${done ? ' cal-event-card--done' : ''}`}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('cardId', card.id) }}
                      >
                        <span className="cal-event-accent" style={{ background: t.color }} />
                        <div className="cal-event-body">
                          <div className="cal-event-top">
                            <span className="cal-event-icon" style={{ color: t.color }}>{t.icon}</span>
                            <span className="cal-event-badge" style={{ color: t.color, borderColor: t.color+'40' }}>{t.label}</span>
                            <span className={`cal-state-pill ${pill.cls}`}>{pill.label}</span>
                            <button
                              className={`cal-event-status-btn${done ? ' cal-event-status-btn--done' : ''}`}
                              onClick={e => { e.stopPropagation(); onToggleStatus(card.id) }}
                              title={done ? 'Marcar como pendente' : 'Marcar como concluído'}
                            >
                              {done ? <IconCheckCircle /> : <IconCircle />}
                            </button>
                          </div>
                          <p
                            className="cal-event-title"
                            style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.45 : 1 }}
                            onClick={() => onEditCard(card)}
                          >
                            {card.titulo}
                          </p>
                          <ScheduleInline
                            cardId={card.id}
                            dueDate={card.dueDate}
                            dueTime={card.dueTime}
                            onSchedule={(id, date, time) => { onScheduleCard(id, date, time); onSelectDate(date || null) }}
                            onClear={(id) => onScheduleCard(id, '', '')}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
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

  // uid is derived reactively — changes when user logs in/out
  const uid = resolveUid(usuario)

  // Hard-reset all board state whenever the identity changes so
  // User B never sees User A's in-memory data after a same-tab login swap.
  const [cards, setCards] = useState(() => lsLoadCards(uid))
  const [cols,  setCols]  = useState(() => { const c = lsLoadCols(uid); COLS = c; COL_IDS = c.map(x => x.id); return c })

  const prevUidRef = useRef(uid)
  useEffect(() => {
    if (prevUidRef.current === uid) return
    prevUidRef.current = uid
    // Identity changed: wipe in-memory state and reload from the new user's slot
    const c = lsLoadCols(uid); COLS = c; COL_IDS = c.map(x => x.id)
    setCards(lsLoadCards(uid))
    setCols(c)
  }, [uid])
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [adding,         setAdding]         = useState(false)
  const [editingCard,    setEditingCard]     = useState(null)
  const [courses,        setCourses]        = useState([])
  const [loaded,         setLoaded]         = useState(false)
  const [prefillModal,   setPrefillModal]   = useState(null)
  const [selectedDate,   setSelectedDate]   = useState(null)  // shared calendar ↔ board signal
  const [flashIds,       setFlashIds]       = useState(new Set()) // ids of newly created cards

  // Debounce ref for API saves
  const saveTimer = useRef(null)

  // Load from API on mount and whenever uid changes (login/logout)
  useEffect(() => {
    setLoaded(false)
    if (!usuario) {
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
        lsSave(uid, remoteCards, resolvedCols)
      })
      .catch(() => {
        // API failed — localStorage copy already loaded by useState / uid-change effect
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

  const flash = (ids) => {
    setFlashIds(new Set(ids))
    setTimeout(() => setFlashIds(new Set()), 900)
  }

  const addCard    = () => {
    if (!form.titulo.trim()) return
    const id   = Date.now()
    const next = [...cards, { id, ...form, titulo: form.titulo.trim() }]
    persistCards(next)
    flash([id])
    if (form.dueDate) setSelectedDate(form.dueDate)
    setForm(EMPTY_FORM)
    setAdding(false)
  }
  const addInlineCard = (colId, titulo) => {
    const id = Date.now()
    // Pre-fill dueDate from the active calendar selection so the new card
    // immediately appears on the selected day in both sections
    const dueDate = selectedDate || ''
    const next = [...cards, { id, ...EMPTY_FORM, col: colId, titulo, dueDate }]
    persistCards(next)
    flash([id])
  }
  const toggleStatus = (id) => {
    persistCards(cards.map(c => c.id === id ? { ...c, status: c.status === 'completed' ? 'pending' : 'completed' } : c))
  }

  const moveCard = (id, col) => persistCards(cards.map(c => c.id === id ? { ...c, col } : c))

  const deleteCard = (id) => {
    const next = cards.filter(c => c.id !== id)
    persistCards(next)
    // If the deleted card was the last one on the selected date, clear the selection
    if (selectedDate && !next.some(c => c.dueDate === selectedDate)) {
      setSelectedDate(null)
    }
  }

  const saveCard = (updated) => {
    persistCards(cards.map(c => c.id === updated.id ? updated : c))
    setEditingCard(null)
    // Follow the card to its new date if it changed
    if (updated.dueDate) {
      setSelectedDate(updated.dueDate)
    } else if (selectedDate) {
      const next = cards.map(c => c.id === updated.id ? updated : c)
      if (!next.some(c => c.dueDate === selectedDate)) setSelectedDate(null)
    }
  }

  const scheduleCard = (id, dueDate, dueTime) => {
    persistCards(cards.map(c => c.id === id ? { ...c, dueDate, dueTime } : c))
    if (dueDate) {
      setSelectedDate(dueDate)
    } else if (selectedDate) {
      const remaining = cards.filter(c => c.id !== id && c.dueDate === selectedDate)
      if (remaining.length === 0) setSelectedDate(null)
    }
  }

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
    flash(newCards.map(c => c.id))
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
  const done  = cards.filter(c => c.status === 'completed').length

  const pending  = cards.filter(c => c.status !== 'completed').length
  const overdue  = cards.filter(c => isOverdue(c)).length
  const scheduled = cards.filter(c => c.dueDate).length

  return (
    <div className="planning-page">
      <Header />

      {/* ── Workspace header ── */}
      <div className="planning-workspace-header">
        <div className="planning-workspace-title-row">
          <div className="planning-workspace-icon"><IconKanban /></div>
          <div>
            <h1 className="planning-title">Espaço de Trabalho</h1>
            <p className="planning-subtitle">Calendário e planejamento integrados</p>
          </div>
        </div>

        <div className="planning-stats-row">
          <div className="planning-stat">
            <span className="planning-stat-value">{total}</span>
            <span className="planning-stat-label">Total</span>
          </div>
          <div className="planning-stat planning-stat--done">
            <span className="planning-stat-value">{done}</span>
            <span className="planning-stat-label">Concluídos</span>
          </div>
          <div className="planning-stat planning-stat--pending">
            <span className="planning-stat-value">{pending}</span>
            <span className="planning-stat-label">Pendentes</span>
          </div>
          {overdue > 0 && (
            <div className="planning-stat planning-stat--overdue">
              <span className="planning-stat-value">{overdue}</span>
              <span className="planning-stat-label">Atrasados</span>
            </div>
          )}
          <div className="planning-stat">
            <span className="planning-stat-value">{scheduled}</span>
            <span className="planning-stat-label">Agendados</span>
          </div>
        </div>

        <button className="planning-add-btn" onClick={() => { setAdding(a => !a); setForm(EMPTY_FORM) }}>
          <IconPlus /> Novo item
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="planning-progress-wrap">
          <div className="planning-progress-track">
            <div className="planning-progress-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </div>
          <span className="planning-progress-label">{Math.round((done / total) * 100)}% concluído</span>
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

      {/* Prefill modal */}
      {prefillModal && (
        <PrefillModal
          suggestions={prefillModal}
          onConfirm={confirmPrefill}
          onClose={() => setPrefillModal(null)}
        />
      )}

      {/* ── Unified workspace body ── */}
      <div className="planning-workspace-body">

        {/* Calendar zone */}
        <section className="planning-zone planning-zone--calendar">
          <div className="planning-zone-header">
            <span className="planning-zone-icon"><IconCalendar /></span>
            <span className="planning-zone-title">Agenda</span>
            <span className="planning-zone-hint">Clique num dia para ver ou adicionar itens</span>
          </div>
          {loaded && (
            <CalendarView
              cards={cards}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEditCard={setEditingCard}
              onAssignDate={(date) => { setForm({ ...EMPTY_FORM, dueDate: date }); setAdding(true) }}
              onToggleStatus={toggleStatus}
              onScheduleCard={scheduleCard}
            />
          )}
        </section>

        {/* Connector bridge */}
        <div className="planning-bridge">
          <div className="planning-bridge-line" />
          <div className="planning-bridge-node">
            <IconArrowRight />
          </div>
          <div className="planning-bridge-line" />
        </div>

        {/* Board zone */}
        <section className="planning-zone planning-zone--board">
          <div className="planning-zone-header">
            <span className="planning-zone-icon"><IconKanban /></span>
            <span className="planning-zone-title">Quadro de Tarefas</span>
            <span className="planning-zone-hint">Arraste cards entre colunas ou para o calendário</span>
          </div>
          {selectedDate && (
            <div className="board-filter-banner">
              <IconCalendar />
              Filtrando por{' '}
              <strong>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </strong>
              <button className="board-filter-clear" onClick={() => setSelectedDate(null)}>✕ Limpar filtro</button>
            </div>
          )}
          <div className="planning-board">
            {!loaded ? (
              <div className="planning-board-loading">
                <IconSpinner /> Carregando planejamento...
              </div>
            ) : (
              <div className="planning-board-inner">
                {cols.map(col => {
                  const colCards = cards.filter(c => c.col === col.id)
                  const visibleCards = selectedDate
                    ? colCards.filter(c => c.dueDate === selectedDate)
                    : colCards
                  const dimmedCards = selectedDate
                    ? colCards.filter(c => c.dueDate !== selectedDate)
                    : []
                  return (
                    <div key={col.id} className="kb-list">
                      <ColumnHeader
                        col={col}
                        cardCount={selectedDate ? visibleCards.length : colCards.length}
                        onRename={renameCol}
                        onDelete={deleteCol}
                      />
                      <div
                        className="kb-list-cards"
                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
                        onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const id = Number(e.dataTransfer.getData('cardId')); if (id) moveCard(id, col.id) }}
                      >
                        {visibleCards.map(card => (
                          <PlanningCard
                            key={card.id}
                            card={card}
                            highlighted={!!selectedDate}
                            flashing={flashIds.has(card.id)}
                            onDelete={deleteCard}
                            onMove={moveCard}
                            onEditCard={setEditingCard}
                            onToggleStatus={toggleStatus}
                            onScheduleCard={scheduleCard}
                          />
                        ))}
                        {dimmedCards.map(card => (
                          <PlanningCard
                            key={card.id}
                            card={card}
                            highlighted={false}
                            flashing={false}
                            dimmed
                            onDelete={deleteCard}
                            onMove={moveCard}
                            onEditCard={setEditingCard}
                            onToggleStatus={toggleStatus}
                            onScheduleCard={scheduleCard}
                          />
                        ))}
                        {colCards.length === 0 && (
                          <div className="kb-list-empty">Nenhum item</div>
                        )}
                        {selectedDate && visibleCards.length === 0 && colCards.length > 0 && (
                          <div className="kb-list-empty">Nenhum item nesta data</div>
                        )}
                      </div>
                      <InlineAdd colId={col.id} onAdd={addInlineCard} />
                    </div>
                  )
                })}
                <AddColumn
                  colCount={cols.length}
                  onAdd={(label, color) => persistCols([...cols, { id: `col_${Date.now()}`, label, color }])}
                />
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

export default Planning
