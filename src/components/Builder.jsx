import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const PALETTE = [
  { type: 'heading', label: 'Heading' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
  { type: 'divider', label: 'Divider' },
]

const defaultPropsByType = (type) => {
  switch (type) {
    case 'heading':
      return { text: 'Your Heading', level: 2, align: 'left' }
    case 'text':
      return { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', align: 'left' }
    case 'image':
      return { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop', alt: 'Image', width: '100%' }
    case 'button':
      return { label: 'Click Me', href: '#', variant: 'primary', align: 'left' }
    case 'divider':
      return { style: 'solid' }
    default:
      return {}
  }
}

function ElementRenderer({ el, isSelected, onSelect, onDragStart }) {
  const base = 'relative group rounded border border-transparent hover:border-blue-300 p-2'
  const selected = isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''

  const alignClass = (align) => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  return (
    <div
      className={`${base} ${selected}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(el.id)
      }}
      draggable
      onDragStart={(e) => onDragStart(e, el)}
    >
      {el.type === 'heading' && (
        <div className={alignClass(el.props.align)}>
          {el.props.level === 1 && (
            <h1 className="text-4xl font-bold">{el.props.text}</h1>
          )}
          {el.props.level === 2 && (
            <h2 className="text-3xl font-semibold">{el.props.text}</h2>
          )}
          {el.props.level === 3 && (
            <h3 className="text-2xl font-semibold">{el.props.text}</h3>
          )}
        </div>
      )}

      {el.type === 'text' && (
        <p className={`${alignClass(el.props.align)} text-gray-700 leading-relaxed`}>
          {el.props.text}
        </p>
      )}

      {el.type === 'image' && (
        <div className="w-full">
          <img
            src={el.props.src}
            alt={el.props.alt}
            style={{ width: el.props.width }}
            className="rounded"
          />
        </div>
      )}

      {el.type === 'button' && (
        <div className={alignClass(el.props.align)}>
          <a
            href={el.props.href}
            className={
              el.props.variant === 'secondary'
                ? 'inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded'
                : 'inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
            }
          >
            {el.props.label}
          </a>
        </div>
      )}

      {el.type === 'divider' && (
        <hr className="border-t border-gray-200" />
      )}

      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
        <span className="text-[10px] bg-gray-800 text-white px-1 py-0.5 rounded">
          {el.type}
        </span>
      </div>
    </div>
  )
}

function Inspector({ selected, onChange, onDelete }) {
  if (!selected) return (
    <div className="text-sm text-gray-500">Select an element to edit its properties.</div>
  )

  const { type, props } = selected

  const set = (key, value) => onChange({ ...selected, props: { ...props, [key]: value } })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Type</h3>
        <div className="text-xs px-2 py-1 bg-gray-100 rounded inline-block">{type}</div>
      </div>

      {(type === 'heading' || type === 'text') && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
          <textarea
            value={props.text}
            onChange={(e) => set('text', e.target.value)}
            className="w-full text-sm border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
      )}

      {type === 'heading' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
          <select
            value={props.level}
            onChange={(e) => set('level', Number(e.target.value))}
            className="w-full text-sm border rounded p-2"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
      )}

      {(type === 'heading' || type === 'text' || type === 'button') && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Align</label>
          <select
            value={props.align}
            onChange={(e) => set('align', e.target.value)}
            className="w-full text-sm border rounded p-2"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}

      {type === 'image' && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <input
              value={props.src}
              onChange={(e) => set('src', e.target.value)}
              className="w-full text-sm border rounded p-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alt</label>
            <input
              value={props.alt}
              onChange={(e) => set('alt', e.target.value)}
              className="w-full text-sm border rounded p-2"
              placeholder="Description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <input
              value={props.width}
              onChange={(e) => set('width', e.target.value)}
              className="w-full text-sm border rounded p-2"
              placeholder="e.g. 100%, 600px"
            />
          </div>
        </>
      )}

      {type === 'button' && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              value={props.label}
              onChange={(e) => set('label', e.target.value)}
              className="w-full text-sm border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
            <input
              value={props.href}
              onChange={(e) => set('href', e.target.value)}
              className="w-full text-sm border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
            <select
              value={props.variant}
              onChange={(e) => set('variant', e.target.value)}
              className="w-full text-sm border rounded p-2"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
        </>
      )}

      {type === 'divider' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
          <select
            value={props.style}
            onChange={(e) => set('style', e.target.value)}
            className="w-full text-sm border rounded p-2"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      )}

      <button
        onClick={() => onDelete(selected.id)}
        className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded"
      >
        Delete Element
      </button>
    </div>
  )
}

export default function Builder() {
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isOver, setIsOver] = useState(false)
  const [pages, setPages] = useState([])
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('My New Page')
  const [message, setMessage] = useState('')

  const selected = useMemo(() => elements.find((e) => e.id === selectedId), [elements, selectedId])

  useEffect(() => {
    refreshPages()
  }, [])

  const refreshPages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pages`)
      const data = await res.json()
      setPages(data.items || [])
    } catch (e) {
      // ignore
    }
  }

  const addElement = (type, index = elements.length) => {
    const id = crypto.randomUUID()
    const el = { id, type, props: defaultPropsByType(type) }
    const next = [...elements]
    next.splice(index, 0, el)
    setElements(next)
    setSelectedId(id)
  }

  const onCanvasDrop = (e, index = elements.length) => {
    e.preventDefault()
    setIsOver(false)
    const payload = e.dataTransfer.getData('application/json')
    if (!payload) return
    const data = JSON.parse(payload)

    if (data.kind === 'new') {
      addElement(data.type, index)
    } else if (data.kind === 'move') {
      const currentIndex = elements.findIndex((x) => x.id === data.id)
      if (currentIndex === -1) return
      const next = [...elements]
      const [moved] = next.splice(currentIndex, 1)
      const targetIndex = index > currentIndex ? index - 1 : index
      next.splice(targetIndex, 0, moved)
      setElements(next)
    }
  }

  const onElementDragStart = (e, el) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'move', id: el.id }))
  }

  const onPaletteDragStart = (e, type) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'new', type }))
  }

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      const payload = { title, layout: elements, status: 'draft' }
      const res = await fetch(`${API_BASE}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setMessage(`Saved ✔ ID: ${data.id}`)
      refreshPages()
    } catch (e) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const load = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/pages/${id}`)
      const data = await res.json()
      setTitle(data.title || 'Untitled')
      setElements(Array.isArray(data.layout) ? data.layout : [])
      setSelectedId(null)
      setMessage(`Loaded ✔`)
    } catch (e) {
      setMessage('Failed to load page')
    }
  }

  const updateSelected = (updated) => {
    setElements((els) => els.map((x) => (x.id === updated.id ? updated : x)))
  }

  const deleteSelected = (id) => {
    setElements((els) => els.filter((x) => x.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-xl font-semibold">Visual Builder</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ml-auto border rounded px-3 py-2 text-sm w-64"
            placeholder="Page title"
          />
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && <div className="text-sm text-gray-600">{message}</div>}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Palette */}
        <aside className="col-span-3 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {PALETTE.map((p) => (
                <div
                  key={p.type}
                  draggable
                  onDragStart={(e) => onPaletteDragStart(e, p.type)}
                  className="cursor-grab select-none text-sm border rounded px-3 py-2 hover:bg-gray-50"
                >
                  {p.label}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Pages</h3>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => load(p.id)}
                  className="w-full text-left text-sm border rounded px-3 py-2 hover:bg-gray-50"
                >
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.id}</div>
                </button>
              ))}
              {pages.length === 0 && (
                <div className="text-xs text-gray-500">No pages yet</div>
              )}
            </div>
            <button onClick={refreshPages} className="mt-3 text-xs text-blue-600 hover:underline">Refresh</button>
          </div>
        </aside>

        {/* Canvas */}
        <section className="col-span-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsOver(true)
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => onCanvasDrop(e)}
            onClick={() => setSelectedId(null)}
            className={`min-h-[70vh] bg-white rounded-lg border p-6 ${isOver ? 'outline outline-2 outline-blue-400' : ''}`}
          >
            {elements.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Drag elements here
              </div>
            )}

            {elements.map((el, idx) => (
              <div key={el.id} className="relative">
                {/* Drop zone before element */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onCanvasDrop(e, idx)}
                  className="h-4 -mt-2 mb-2 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="h-1 bg-blue-200 rounded"></div>
                </div>

                <ElementRenderer
                  el={el}
                  isSelected={selectedId === el.id}
                  onSelect={setSelectedId}
                  onDragStart={onElementDragStart}
                />

                {/* Small controls */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      // duplicate
                      const dupe = { ...el, id: crypto.randomUUID() }
                      const next = [...elements]
                      next.splice(idx + 1, 0, dupe)
                      setElements(next)
                    }}
                    className="bg-white border rounded p-1 text-xs shadow"
                    title="Duplicate"
                  >
                    ⎘
                  </button>
                  <button
                    onClick={() => deleteSelected(el.id)}
                    className="bg-white border rounded p-1 text-xs text-red-600 shadow"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>

                {/* Drop zone after element */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onCanvasDrop(e, idx + 1)}
                  className="h-4 mt-2 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="h-1 bg-blue-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Inspector */}
        <aside className="col-span-3">
          <div className="bg-white rounded-lg border p-4 sticky top-20">
            <h3 className="font-semibold mb-3">Inspector</h3>
            <Inspector selected={selected} onChange={updateSelected} onDelete={deleteSelected} />
          </div>
        </aside>
      </main>
    </div>
  )
}
