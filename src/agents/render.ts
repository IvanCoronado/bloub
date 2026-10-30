import { BotEngine } from '@/bot/engine'
import { EXPRESSION_BY_ID, type ExpressionId } from '@/bot/expressions'
import { profileFromPolygon, regularPolygonProfile, superellipseProfile, unionOfCirclesProfile, radiusAtAngle } from '@/bot/shape'
import { mixHex } from '@/bot/skins'
import type { AgentConfig, BodyShape, Motion } from './catalog'
import { glassesLayout } from './glasses'
import { INGREDIENT_PROFILES, ingredientDrawing } from './ingredients'

export const AGENT_VIEWBOX = '-180 -180 360 360'
const profiles: Record<BodyShape, number[]> = {
  capsule: superellipseProfile(2.8, 1.12, 0.66),
  triangle: regularPolygonProfile(3, 1.12, 0.21, -90),
  cloud: unionOfCirclesProfile([{ x: 0, y: -0.22, r: 0.64 }, { x: -0.53, y: 0.23, r: 0.55 }, { x: 0.53, y: 0.23, r: 0.55 }, { x: 0, y: 0.36, r: 0.48 }]),
  oval: superellipseProfile(2.4, 0.85, 0.94),
  square: superellipseProfile(4.6, 0.88, 0.79),
  ...INGREDIENT_PROFILES
}
// La base du triangle est elargie comme dans la reference Qamarero.
profiles.triangle = profileFromPolygon(profiles.triangle.map((r, i, a) => ({ x: r * Math.cos(i / a.length * Math.PI * 2) * 1.15, y: r * Math.sin(i / a.length * Math.PI * 2) })), 0, 0)

const engines = new Map<string, BotEngine>()
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)
const n = (v: number) => +v.toFixed(4)

function engineFor(config: AgentConfig, state: Motion) {
  const mood: ExpressionId = state === 'happy' ? 'heureux' : state === 'thinking' ? 'curieux' : state === 'listening' || state === 'working' ? 'attentif' : config.expression
  const glasses = config.accessories.includes('glasses')
  const key = `${config.shape}:${mood}:${glasses}`
  let engine = engines.get(key)
  if (!engine) {
    const source = EXPRESSION_BY_ID.get(mood)!
    const expression = {
      ...source,
      split: glasses ? Math.max(source.split, 23) : source.split,
      gaze: mood === 'neutre' ? { yaw: 2, pitch: -1, roll: -18 } : { yaw: source.gaze.yaw * 0.45, pitch: source.gaze.pitch * 0.35 - 1, roll: -18 + source.gaze.roll * 0.25 }
    }
    engine = new BotEngine(100, 'idle', profiles[config.shape], expression)
    engines.set(key, engine)
  }
  return engine
}

/** Un seul rendu pour le composant, les fichiers SVG et chaque image GIF/MP4. */
export function renderAgentSvg(config: AgentConfig, time = 0, state: Motion = 'idle', size = 512, uid = config.id, background: string | null = null): string {
  const t = Math.max(0, time) * config.speed
  const k = config.intensity
  const wave = Math.sin(t * Math.PI * 2)
  const fast = Math.sin(t * Math.PI * 5)
  const frame = engineFor(config, state).sample(t)
  const ingredient = ingredientDrawing(config, t)
  if (ingredient) {
    if (ingredient.bodyPath) frame.bodyPath = ingredient.bodyPath
    frame.eyes = frame.eyes.map(eye => {
      const m = eye.matrix.slice(7, -1).split(',').map(Number)
      return { ...eye, matrix: `matrix(${m.map((v, i) => n(v * ingredient.faceScale + (i === 4 ? ingredient.faceX : i === 5 ? ingredient.faceY : 0))).join(',')})` }
    })
  }
  let y = 0, rotation = config.tilt, sx = 1, sy = 1
  if (state === 'listening') { rotation += Math.sin(t * 2) * 5 * k; sy += wave * 0.018 * k }
  if (state === 'thinking') { y = Math.sin(t * 2) * 3 * k; rotation += Math.sin(t * 1.5) * 6 * k }
  if (state === 'speaking') { sy += fast * 0.045 * k; sx -= fast * 0.022 * k; y = fast * 1.5 * k }
  if (state === 'happy') { y = -Math.abs(wave) * 19 * k; rotation += wave * 7 * k; sx += Math.cos(t * Math.PI * 4) * 0.025 * k; sy -= Math.cos(t * Math.PI * 4) * 0.025 * k }
  if (state === 'working') { rotation += Math.sin(t * 4) * 3 * k; y = Math.sin(t * 8) * 1.5 * k }
  const id = esc(uid)
  const accent = config.accentColor
  const top = ingredient?.bounds.top ?? -radiusAtAngle(profiles[config.shape], -Math.PI / 2) * 100
  const left = ingredient?.bounds.left ?? -radiusAtAngle(profiles[config.shape], Math.PI) * 100
  const right = ingredient?.bounds.right ?? radiusAtAngle(profiles[config.shape], 0) * 100
  const bottom = ingredient?.bounds.bottom ?? radiusAtAngle(profiles[config.shape], Math.PI / 2) * 100
  const accessory = config.accessoryScale
  const front: string[] = [], back: string[] = []
  if (config.accessories.includes('headset')) {
    back.push(`<path d="M${left - 2} 3 C${left - 17} ${top - 37} ${right - 8} ${top - 37} ${right - 3} -8" fill="none" stroke="${accent}" stroke-width="8"/>`)
    front.push(`<g transform="translate(${left + 2} 0) scale(${accessory})"><ellipse rx="19" ry="25" fill="${accent}"/><path d="M-3 20 C-6 50 28 53 58 53" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/><rect x="45" y="45" width="27" height="17" rx="8.5" fill="${accent}"/></g>`)
  }
  if (config.accessories.includes('megaphone')) front.push(`<g transform="translate(${ingredient && config.shape === 'shrimp' ? 90 : right - 2} ${ingredient && config.shape === 'shrimp' ? -56 : -13}) rotate(-9) scale(${accessory})"><path d="M0 -12 L54 -32 Q60 -31 60 -24 V25 Q60 32 54 31 L0 12 Q-6 10 -6 0 Q-6 -10 0 -12Z" fill="${accent}"/><ellipse cx="57" cy="0" rx="8" ry="29" fill="${ingredient ? accent : config.bodyColor}" stroke="${ingredient ? '#fff4df' : accent}" stroke-width="3"/><path d="M12 12 L16 32 L27 31 L25 15Z" fill="${accent}"/></g>`)
  if (config.accessories.includes('bowtie')) front.push(`<g transform="translate(0 ${bottom - 23}) scale(${accessory})"><path d="M0 0 L-22 -12 Q-29 -16 -29 -7 V9 Q-29 17 -22 13 L0 2 L22 13 Q29 17 29 9 V-7 Q29 -16 22 -12Z" fill="${accent}"/><circle r="6" cy="1" fill="${accent}"/></g>`)
  if (config.accessories.includes('glasses')) {
    const glasses = glassesLayout(frame.eyes, accessory)
    if (glasses) front.push(`<g data-accessory="glasses" transform="translate(${n(glasses.x)} ${n(glasses.y)}) rotate(${n(glasses.rotation)}) scale(${accessory})" fill="none" stroke="${accent}" stroke-width="${glasses.stroke}" stroke-linecap="round"><path d="M${n(glasses.bridgeStart)} 0 Q0 -4 ${n(glasses.bridgeEnd)} 0"/><circle cx="${n(-glasses.halfSpacing)}" cy="0" r="${glasses.radius}"/><circle cx="${n(glasses.halfSpacing)}" cy="0" r="${glasses.radius}"/></g>`)
  }
  if (config.accessories.includes('chef')) front.push(`<g transform="translate(0 ${top + (ingredient ? 17 : 10)}) scale(${ingredient ? accessory * 0.88 : accessory})"><path d="M-43 0 V-31 C-70 -31 -76 -67 -54 -76 C-41 -82 -32 -77 -26 -72 C-22 -101 20 -104 29 -74 C52 -90 77 -72 70 -51 C67 -39 57 -33 44 -32 V0Z" fill="${ingredient ? '#fff5df' : accent}"${ingredient ? ` stroke="${accent}" stroke-width="4.5" stroke-linejoin="round"` : ''}/><path d="M-42 -8 H43" stroke="${mixHex(accent, '#000000', 0.1)}" stroke-width="3"${ingredient ? ' opacity=".16"' : ''}/></g>`)
  const dots = state === 'thinking' ? [0, 1, 2].map(i => `<circle cx="${55 + i * 18}" cy="${top - 27 - Math.sin(t * 4 - i * 0.8) * 4}" r="${3.5 + k}" fill="${accent}" opacity="${n(0.4 + (Math.sin(t * 4 - i) + 1) * 0.3)}"/>`).join('') : ''
  const audio = state === 'speaking' || state === 'listening' ? [0, 1, 2].map(i => `<path d="M${right + 18 + i * 11} ${-10 - i * 9} Q${right + 25 + i * 15} 0 ${right + 18 + i * 11} ${10 + i * 9}" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="${n(0.2 + (Math.sin(t * 5 - i) + 1) * 0.3)}"/>`).join('') : ''
  const sparks = state === 'happy' ? [-1, 1].map((d, i) => `<path d="M-6 0 H6 M0 -6 V6" stroke="${accent}" stroke-width="3" stroke-linecap="round" transform="translate(${d * (108 + Math.sin(t * 3 + i) * 8)} ${-65 + Math.cos(t * 3 + i) * 13}) rotate(${n(t * 30)})" opacity="${n(0.5 + (wave + 1) * 0.25)}"/>`).join('') : ''
  const eyes = frame.eyes.map(eye => `<path d="${eye.d}" transform="${eye.matrix}" fill="${config.eyeColor}" opacity="${eye.alpha}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${AGENT_VIEWBOX}" role="img" aria-label="${esc(config.name)} · ${state}"><title>${esc(config.name)}</title><defs><radialGradient id="${id}-body" cx="30%" cy="15%" r="90%"><stop stop-color="${mixHex(config.bodyColor, '#ffffff', config.depth * 0.28)}"/><stop offset="1" stop-color="${config.bodyColor}"/></radialGradient><clipPath id="${id}-clip"><path d="${frame.bodyPath}"/></clipPath></defs>${background ? `<rect x="-180" y="-180" width="360" height="360" fill="${background}"/>` : ''}${config.shadow ? `<ellipse cx="0" cy="${n(bottom + 22)}" rx="${n(70 + y * 0.6)}" ry="7" fill="#151515" opacity="${n(0.065 + y * 0.001)}"/>` : ''}<g transform="translate(0 ${n(y)}) rotate(${n(rotation)}) scale(${n(sx)} ${n(sy)})">${back.join('')}<path d="${frame.bodyPath}" fill="url(#${id}-body)"${ingredient?.outline ?? ''}/>${ingredient?.inside ? `<g clip-path="url(#${id}-clip)">${ingredient.inside}</g>` : ''}${ingredient?.outside ?? ''}<g clip-path="url(#${id}-clip)">${eyes}</g>${front.join('')}${dots}${audio}${sparks}</g></svg>`
}
