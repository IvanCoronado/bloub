import { profileFromPolygon, superellipseProfile } from '@/bot/shape'
import { mixHex } from '@/bot/skins'
import type { AgentConfig, BodyShape, IngredientShape } from './catalog'

const garlicPath = 'M-16 -118 L16 -118 C18 -83 24 -70 44 -59 C87 -39 111 -10 111 30 C111 75 76 91 53 85 C21 105 -13 105 -46 88 C-72 98 -109 77 -109 39 C-109 -7 -83 -37 -45 -57 C-23 -71 -19 -92 -16 -118Z'
const shrimpPath = 'M45 -112 C-50 -125 -114 -57 -112 20 C-110 86 -55 123 15 113 C40 110 57 92 67 67 L42 40 C14 58 -8 63 -28 44 C-48 25 -45 5 -34 -11 C-15 -31 14 -21 38 -30 C70 -41 88 -67 76 -90 C70 -104 58 -112 45 -112Z M42 77 L48 100 L98 112 Q120 113 120 95 Q120 76 83 76 Q112 62 99 44 Q87 26 74 37Z'
const lemonPath = 'M-112 23 C-102 6 -101 -34 -70 -64 C-42 -94 8 -101 49 -77 C68 -66 74 -56 94 -54 C118 -50 128 -32 112 -18 C97 -6 103 17 78 48 C48 86 -10 99 -58 72 C-72 63 -82 52 -101 52 C-129 51 -130 38 -112 23Z'
const tomatoPath = 'M0 -94 C48 -105 98 -74 108 -25 C131 47 96 96 36 98 L-32 98 C-89 98 -122 54 -109 -3 C-104 -59 -64 -101 0 -94Z'

const polygon = (points: number[][]) => profileFromPolygon(points.map(([x, y]) => ({ x: x! / 100, y: y! / 100 })), 0, 0)
export const INGREDIENT_PROFILES: Record<IngredientShape, number[]> = {
  croquette: superellipseProfile(2.8, 1.12, 0.74),
  // Le profil de la gamba est celui de son visage ; son corps en C est un path concave.
  shrimp: superellipseProfile(2, 0.9, 0.8),
  garlic: polygon([[-16, -118], [16, -118], [24, -70], [75, -45], [111, 20], [100, 66], [54, 85], [18, 100], [-45, 88], [-82, 89], [-109, 42], [-99, 0], [-45, -57], [-24, -80]]),
  lemon: superellipseProfile(2, 1.05, 0.85),
  tomato: superellipseProfile(2.7, 1.1, 1)
}

export const isIngredientShape = (shape: BodyShape): shape is IngredientShape => Object.hasOwn(INGREDIENT_PROFILES, shape)

export const INGREDIENT_BOUNDS: Record<IngredientShape, { top: number; bottom: number; left: number; right: number }> = {
  croquette: { top: -74, bottom: 74, left: -112, right: 112 },
  shrimp: { top: -112, bottom: 115, left: -112, right: 120 },
  garlic: { top: -118, bottom: 100, left: -109, right: 111 },
  lemon: { top: -94, bottom: 91, left: -123, right: 120 },
  tomato: { top: -98, bottom: 98, left: -112, right: 114 }
}

export function ingredientDrawing(config: AgentConfig, time: number) {
  if (!isIngredientShape(config.shape)) return null
  const common = { bounds: INGREDIENT_BOUNDS[config.shape], bodyPath: '', faceX: 0, faceY: 0, faceScale: 1, inside: '', outside: '', outline: '' }
  if (config.shape === 'croquette') {
    const crumb = mixHex(config.bodyColor, '#9c4f10', 0.3)
    return { ...common, faceX: 24, faceScale: 0.94, inside: [[-51, -32, 4.5], [-36, -42, 6.5], [69, 38, 4.3], [82, 30, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${crumb}"/>`).join('') }
  }
  if (config.shape === 'shrimp') return {
    ...common, bodyPath: shrimpPath, faceX: 21, faceY: -61, faceScale: 0.85,
    inside: '<g fill="none" stroke="#ffd4b1" stroke-width="5" opacity=".56"><path d="M-110 13 C-83 31 -60 33 -35 21"/><path d="M-89 74 C-68 69 -51 53 -43 39"/><path d="M-31 110 C-21 89 -9 72 9 59"/></g>',
    outside: `<path d="M68 -81 C110 -123 68 -151 8 -151" transform="rotate(${(Math.sin(time * 2.5) * 2).toFixed(4)} 68 -81)" fill="none" stroke="${config.bodyColor}" stroke-width="7" stroke-linecap="round"/>`
  }
  if (config.shape === 'garlic') return {
    ...common, bodyPath: garlicPath, faceY: 15, faceScale: 0.94, outline: ` stroke="${config.accentColor}" stroke-width="4.5" stroke-linejoin="round"`,
    inside: '<g fill="none" stroke="#e3d5ba" stroke-width="2" opacity=".4"><path d="M-6 -80 C-7 -34 -57 15 -39 80"/><path d="M7 -78 C10 -31 62 21 41 82"/></g>'
  }
  if (config.shape === 'lemon') return { ...common, bodyPath: lemonPath, faceScale: 0.96 }
  return {
    ...common, bodyPath: tomatoPath, faceY: 10, faceScale: 0.96,
    outside: '<path d="M-47 -93 Q-29 -108 -6 -94 Q15 -110 41 -93 L23 -80 L31 -61 L9 -72 L-5 -51 L-18 -76 L-43 -65 L-30 -85Z" fill="#398e4b"/>'
  }
}
