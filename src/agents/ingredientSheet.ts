import { INGREDIENT_PRESETS } from './catalog'
import { INGREDIENT_BOUNDS, isIngredientShape } from './ingredients'
import { renderAgentSvg } from './render'

export function renderIngredientSheet(time = 0.6) {
  const size = 460
  const characters = INGREDIENT_PRESETS.map((config, index) => {
    const center = 220 + index * 370
    const bottom = isIngredientShape(config.shape) ? INGREDIENT_BOUNDS[config.shape].bottom : 100
    const y = 510 - bottom * size / 360
    const svg = renderAgentSvg(config, time, 'idle', size, `sheet-${config.id}`).replace('<svg ', `<svg x="${center - size / 2}" y="${y - size / 2}" `)
    return `${svg}<text x="${center}" y="600" font-size="44" font-weight="700" text-anchor="middle">${config.name}</text><text x="${center}" y="646" font-size="29" text-anchor="middle">${config.role}</text>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720" font-family="Arial, Helvetica, sans-serif" fill="#19262e"><rect width="1920" height="720" fill="#fdfcf9"/><text x="960" y="93" font-size="58" font-weight="700" text-anchor="middle" letter-spacing="-1.6">El equipo de Qamarero</text>${characters}</svg>`
}
