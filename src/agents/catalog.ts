import type { ExpressionId } from '@/bot/expressions'

export const CLASSIC_SHAPES = [
  { id: 'capsule', label: 'Cápsula' },
  { id: 'triangle', label: 'Triángulo' },
  { id: 'cloud', label: 'Nube' },
  { id: 'oval', label: 'Óvalo' },
  { id: 'square', label: 'Cuadrado' }
] as const

export const INGREDIENT_SHAPES = [
  { id: 'croquette', label: 'Croqueta' },
  { id: 'shrimp', label: 'Gamba' },
  { id: 'garlic', label: 'Ajo' },
  { id: 'lemon', label: 'Limón' },
  { id: 'tomato', label: 'Tomate' }
] as const
export const BODY_SHAPES = [...CLASSIC_SHAPES, ...INGREDIENT_SHAPES] as const
export type IngredientShape = typeof INGREDIENT_SHAPES[number]['id']
export type CollectionId = 'classic' | 'ingredients'

export const ACCESSORIES = [
  { id: 'headset', label: 'Auriculares', icon: 'headphones' },
  { id: 'megaphone', label: 'Megáfono', icon: 'megaphone' },
  { id: 'bowtie', label: 'Pajarita', icon: 'bowtie' },
  { id: 'glasses', label: 'Gafas', icon: 'glasses' },
  { id: 'chef', label: 'Gorro de chef', icon: 'chef' }
] as const

export const MOTIONS = [
  { id: 'idle', label: 'En reposo', icon: 'circle', description: 'Respira, parpadea y mira a su alrededor.' },
  { id: 'listening', label: 'Escuchando', icon: 'headphones', description: 'Se inclina y presta atención.' },
  { id: 'thinking', label: 'Pensando', icon: 'sparkles', description: 'Una idea empieza a tomar forma.' },
  { id: 'speaking', label: 'Hablando', icon: 'audio', description: 'Acompaña la conversación con ritmo.' },
  { id: 'happy', label: 'Celebrando', icon: 'smile', description: 'Un pequeño salto para una buena noticia.' },
  { id: 'working', label: 'Trabajando', icon: 'bolt', description: 'Concentrado en lo que importa.' }
] as const

export const MOODS: { id: ExpressionId; label: string }[] = [
  { id: 'neutre', label: 'Natural' }, { id: 'attentif', label: 'Atento' },
  { id: 'heureux', label: 'Alegre' }, { id: 'curieux', label: 'Curioso' },
  { id: 'surpris', label: 'Sorprendido' }, { id: 'confus', label: 'Pensativo' },
  { id: 'fier', label: 'Orgulloso' }, { id: 'somnolent', label: 'Dormilón' }
]

export type BodyShape = typeof BODY_SHAPES[number]['id']
export type Accessory = typeof ACCESSORIES[number]['id']
export type Motion = typeof MOTIONS[number]['id']

export interface AgentConfig {
  id: string
  name: string
  role: string
  shape: BodyShape
  bodyColor: string
  accentColor: string
  eyeColor: string
  expression: ExpressionId
  accessories: Accessory[]
  accessoryScale: number
  depth: number
  tilt: number
  intensity: number
  speed: number
  shadow: boolean
}

const base = {
  bodyColor: '#111112', accentColor: '#ff5d22', eyeColor: '#ffffff',
  expression: 'neutre' as const, accessoryScale: 1, depth: 0.25,
  tilt: 0, intensity: 0.65, speed: 1, shadow: true
}

export const PRESETS: AgentConfig[] = [
  { ...base, id: 'qphone', name: 'QPhone', role: 'Siempre al otro lado', shape: 'capsule', accessories: ['headset'] },
  { ...base, id: 'marketing', name: 'Marketing', role: 'Ideas que se hacen oír', shape: 'triangle', accessories: ['megaphone'] },
  { ...base, id: 'equipo', name: 'Equipo', role: 'El talento de tu restaurante', shape: 'cloud', accessories: ['bowtie'] },
  { ...base, id: 'carta', name: 'Carta', role: 'Cada detalle cuenta', shape: 'oval', accessories: ['glasses'] },
  { ...base, id: 'compras', name: 'Compras', role: 'Todo en su punto', shape: 'square', accessories: ['chef'] }
]

export const INGREDIENT_PRESETS: AgentConfig[] = [
  { ...base, id: 'croqueta', name: 'Croqueta', role: 'Teléfono', shape: 'croquette', bodyColor: '#efa53a', accentColor: '#19262e', eyeColor: '#19262e', depth: 0.18, accessories: ['headset'] },
  { ...base, id: 'gamba', name: 'Gamba', role: 'Marketing', shape: 'shrimp', bodyColor: '#ff6036', accentColor: '#19262e', eyeColor: '#19262e', depth: 0.1, accessories: ['megaphone'] },
  { ...base, id: 'ajo', name: 'Ajo', role: 'Equipo', shape: 'garlic', bodyColor: '#fff4dc', accentColor: '#19262e', eyeColor: '#19262e', depth: 0.08, accessories: ['bowtie'] },
  { ...base, id: 'limon', name: 'Limón', role: 'Carta', shape: 'lemon', bodyColor: '#ffd138', accentColor: '#19262e', eyeColor: '#19262e', depth: 0.14, accessories: ['glasses'] },
  { ...base, id: 'tomate', name: 'Tomate', role: 'Compras', shape: 'tomato', bodyColor: '#ff5135', accentColor: '#19262e', eyeColor: '#19262e', depth: 0.1, accessories: ['chef'] }
]

export const presetsFor = (collection: CollectionId) => collection === 'ingredients' ? INGREDIENT_PRESETS : PRESETS

export interface TimelineBlock { id: string; state: Motion; duration: number }
export interface AgentProject { version: 1; collection?: CollectionId; agents: AgentConfig[]; timeline: TimelineBlock[] }
export const DEFAULT_TIMELINE: TimelineBlock[] = [
  { id: 'intro', state: 'idle', duration: 2 },
  { id: 'listen', state: 'listening', duration: 3 },
  { id: 'think', state: 'thinking', duration: 3 },
  { id: 'done', state: 'happy', duration: 2 }
]

export function freshProject(collection: CollectionId = 'classic'): AgentProject {
  return structuredClone({ version: 1, ...(collection === 'ingredients' ? { collection } : {}), agents: presetsFor(collection), timeline: DEFAULT_TIMELINE })
}

const color = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
const finite = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max

/** Le JSON est aussi une API publique : on valide avant de dessiner ou de sauvegarder. */
export function parseProject(input: unknown): AgentProject {
  if (!input || typeof input !== 'object') throw new Error('El archivo no contiene un proyecto válido.')
  const p = input as Partial<AgentProject>
  if (p.collection !== undefined && p.collection !== 'classic' && p.collection !== 'ingredients') throw new Error('La colección del proyecto no es válida.')
  if (p.version !== 1 || !Array.isArray(p.agents) || p.agents.length < 1 || p.agents.length > 30 || !Array.isArray(p.timeline) || !p.timeline.length || p.timeline.length > 24) {
    throw new Error('Usa un proyecto de agentes versión 1, con 1–30 agentes y 1–24 escenas.')
  }
  const ids = new Set<string>()
  for (const a of p.agents) {
    if (!a || !text(a.id, 80) || !/^[a-z0-9-]+$/.test(a.id) || ids.has(a.id) || !text(a.name, 40) || !text(a.role, 100)
      || !BODY_SHAPES.some(s => s.id === a.shape) || !MOODS.some(m => m.id === a.expression)
      || !color(a.bodyColor) || !color(a.accentColor) || !color(a.eyeColor)
      || !Array.isArray(a.accessories) || new Set(a.accessories).size !== a.accessories.length || a.accessories.some(v => !ACCESSORIES.some(x => x.id === v))
      || !finite(a.accessoryScale, 0.65, 1.3) || !finite(a.depth, 0, 1) || !finite(a.tilt, -15, 15)
      || !finite(a.intensity, 0, 1) || !finite(a.speed, 0.25, 2) || typeof a.shadow !== 'boolean') throw new Error('Hay un agente con propiedades no válidas.')
    ids.add(a.id)
  }
  const blockIds = new Set<string>()
  for (const b of p.timeline) {
    if (!b || !text(b.id, 80) || blockIds.has(b.id) || !MOTIONS.some(m => m.id === b.state) || !finite(b.duration, 0.5, 10)) throw new Error('Hay una escena no válida. Su duración debe estar entre 0,5 y 10 segundos.')
    blockIds.add(b.id)
  }
  return structuredClone(p as AgentProject)
}

export function timelineAt(blocks: TimelineBlock[], time: number) {
  const duration = blocks.reduce((n, b) => n + b.duration, 0)
  let local = ((time % duration) + duration) % duration
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]!
    if (local < block.duration) return { ...block, index, time: local }
    local -= block.duration
  }
  return { ...blocks[0]!, index: 0, time: 0 }
}
