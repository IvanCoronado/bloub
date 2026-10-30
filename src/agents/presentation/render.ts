import type { AgentConfig, CollectionId } from '../catalog'
import { renderAgentSvg } from '../render'
import { INGREDIENT_BOUNDS, isIngredientShape } from '../ingredients'
import { CAST, PRESENTATION, presentationAt, presentationCast } from './story'

const PAPER = '#faf8f3'
const INK = '#181816'
const ORANGE = '#ff5d22'
const MUTED = '#8b857a'
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (v: number) => 1 - (1 - clamp(v)) ** 4
const n = (v: number) => +v.toFixed(4)
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)

function text(x: number, y: number, value: string, size: number, weight = 400, fill = INK, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(value)}</text>`
}

function character(config: AgentConfig, x: number, y: number, size: number, time: number, state: Parameters<typeof renderAgentSvg>[2], uid: string) {
  return renderAgentSvg(config, time, state, size, uid)
    .replace('<svg ', `<svg x="${n(x - size / 2)}" y="${n(y - size / 2)}" `)
    .replace('role="img"', 'role="img" overflow="visible"')
}

/** Le meme dessin sert a la lecture, aux images de controle et au fichier video. */
export function renderPresentationSvg(time: number, agents?: AgentConfig[], uid = 'presentation', collection: CollectionId = 'classic') {
  const scene = presentationAt(time)
  const cast = presentationCast(agents, collection)
  let content = ''
  const brand = `<g transform="translate(116 76)"><text font-size="43" font-weight="700" fill="${ORANGE}">q</text>${text(38, 0, 'qamarero', 32, 700, INK, 'letter-spacing="-1.5"')}</g>${text(1804, 72, 'EL EQUIPO', 15, 600, MUTED, 'text-anchor="end" letter-spacing="3"')}`

  if (scene.kind === 'intro') {
    const incoming = ease(scene.time / 0.5)
    const outgoing = 1 - clamp((scene.time - 0.88) / 0.32)
    content = `<g opacity="${n(incoming * outgoing)}" transform="translate(0 ${n((1 - incoming) * 30)})">${text(960, 438, collection === 'ingredients' ? 'Los ingredientes' : 'Conoce a tu', 91, 700, INK, 'text-anchor="middle" letter-spacing="-4"')}${text(960, 547, collection === 'ingredients' ? 'de un gran equipo.' : 'nuevo equipo.', 111, 700, ORANGE, 'text-anchor="middle" letter-spacing="-5"')}${text(960, 641, 'Cinco agentes que cuidan de tu restaurante.', 30, 400, MUTED, 'text-anchor="middle"')}</g>`
  }

  if (scene.kind === 'solo') {
    const member = cast[scene.index]!
    const incoming = ease(scene.time / 0.65)
    const outgoing = clamp((scene.time - (PRESENTATION.solo - 0.35)) / 0.35)
    const alpha = 1 - outgoing
    const textIn = ease((scene.time - 0.12) / 0.6)
    const detailIn = ease((scene.time - 0.32) / 0.65)
    const size = 790 * (0.86 + 0.14 * incoming)
    const mascotX = 1400 + (1 - incoming) * 100 - outgoing * 24
    const copyY = (1 - textIn) * 28 - outgoing * 12
    content = `<g opacity="${n(alpha)}">
      <circle cx="1410" cy="517" r="310" fill="#f4eee4" opacity="${n(incoming * 0.65)}"/>
      <circle cx="1410" cy="517" r="354" fill="none" stroke="#eae3d7" stroke-width="1.4" opacity="${n(incoming)}"/>
      ${character(member.config, mascotX, 566, size, scene.time + 0.6, member.motion, `${uid}-${member.id}`)}
      <g opacity="${n(textIn)}" transform="translate(${n((1 - textIn) * -28)} ${n(copyY)})">
        <rect x="153" y="294" width="36" height="4" rx="2" fill="${ORANGE}"/>
        ${text(208, 302, member.area.toLocaleUpperCase('es'), 19, 700, ORANGE, 'letter-spacing="3.6"')}
        ${text(148, 457, member.name, 145, 700, INK, 'letter-spacing="-7"')}
        ${text(153, 536, member.role, 35, 600, INK, 'letter-spacing="-.6"')}
      </g>
      <g opacity="${n(detailIn)}" transform="translate(0 ${n((1 - detailIn) * 22)})">
        ${member.description.map((line, i) => text(153, 616 + i * 43, line, 27, 400, MUTED)).join('')}
        ${member.tags.map((tag, i) => { const x = 153 + i * 205; return `<rect x="${x}" y="760" width="187" height="49" rx="24.5" fill="#f0e9de"/>${text(x + 93.5, 792, tag, 18, 500, '#9b7256', 'text-anchor="middle"')}` }).join('')}
      </g>
    </g>
    ${text(1804, 982, `${String(scene.index + 1).padStart(2, '0')} / 05`, 19, 500, MUTED, 'text-anchor="end" letter-spacing="2"')}
    <g>${CAST.map((_, index) => `<rect x="${153 + index * 85}" y="970" width="69" height="4" rx="2" fill="${index < scene.index ? ORANGE : '#e7e0d5'}"/>${index === scene.index ? `<rect x="${153 + index * 85}" y="970" width="${n(69 * clamp(scene.time / PRESENTATION.solo))}" height="4" rx="2" fill="${ORANGE}"/>` : ''}`).join('')}</g>`
  }

  if (scene.kind === 'team') {
    const headlineIn = ease(scene.time / 0.7)
    content = `<g opacity="${n(headlineIn)}" transform="translate(0 ${n((1 - headlineIn) * 25)})">${text(960, 222, collection === 'ingredients' ? 'Cinco ingredientes.' : 'Cinco agentes.', 76, 700, INK, 'text-anchor="middle" letter-spacing="-3"')}${text(960, 310, collection === 'ingredients' ? 'Un gran equipo.' : 'Un solo equipo.', 83, 700, ORANGE, 'text-anchor="middle" letter-spacing="-3"')}</g>`
    content += cast.map((member, index) => {
      const incoming = ease((scene.time - 0.22 - index * 0.14) / 0.8)
      const x = 260 + index * 350
      const size = 376 * (0.7 + 0.3 * incoming)
      const baseline = collection === 'ingredients' && isIngredientShape(member.config.shape) ? 705 - INGREDIENT_BOUNDS[member.config.shape].bottom * size / 360 : 606
      const y = baseline + (1 - incoming) * 175
      return `<g data-member="${member.id}" opacity="${n(incoming)}">${character(member.config, x, y, size, scene.time + index * 0.19, 'happy', `${uid}-team-${member.id}`)}<g opacity="${n(incoming)}">${text(x, 836 + (1 - incoming) * 30, member.name, 43, 700, INK, 'text-anchor="middle" letter-spacing="-1.5"')}${text(x, 883 + (1 - incoming) * 30, member.area, 23, 400, MUTED, 'text-anchor="middle"')}</g></g>`
    }).join('')
    const footerIn = ease((scene.time - 1.4) / 0.7)
    content += `<g opacity="${n(footerIn)}">${text(960, 997, 'Tu restaurante, bien acompañado.', 28, 400, MUTED, 'text-anchor="middle"')}</g>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PRESENTATION.width}" height="${PRESENTATION.height}" viewBox="0 0 ${PRESENTATION.width} ${PRESENTATION.height}" role="img" aria-label="Presentación del equipo de Qamarero" font-family="Arial, Helvetica, sans-serif"><rect width="1920" height="1080" fill="${PAPER}"/>${brand}${content}</svg>`
}
