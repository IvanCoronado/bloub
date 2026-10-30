import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const collection = process.argv.includes('--ingredients') ? 'ingredients' : 'classic'
const server = await createServer({
  configFile: false,
  root,
  cacheDir: 'node_modules/.vite-agents',
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
  appType: 'custom'
})
try {
  const { presetsFor, freshProject } = await server.ssrLoadModule('/src/agents/catalog.ts')
  const presets = presetsFor(collection)
  const { renderAgentSvg } = await server.ssrLoadModule('/src/agents/render.ts')
  const { renderAnimatedSvg } = await server.ssrLoadModule('/src/agents/export.ts')
  const folder = new URL(collection === 'ingredients' ? '../public/agents/ingredients/' : '../public/agents/', import.meta.url)
  await mkdir(folder, { recursive: true })
  for (const [index, config] of presets.entries()) {
    await writeFile(new URL(`${config.id}.svg`, folder), renderAgentSvg(config, 0.6))
    await writeFile(new URL(`${config.id}-animated.svg`, folder), renderAnimatedSvg(config, ['listening', 'speaking', 'happy', 'thinking', 'working'][index]))
  }
  await writeFile(new URL(collection === 'ingredients' ? 'qamarero-ingredients.json' : 'qamarero-agents.json', folder), JSON.stringify(freshProject(collection), null, 2) + '\n')
  if (collection === 'ingredients') {
    const { renderIngredientSheet } = await server.ssrLoadModule('/src/agents/ingredientSheet.ts')
    const { default: sharp } = await import('sharp')
    const sheet = renderIngredientSheet()
    await writeFile(new URL('team.svg', folder), sheet)
    await sharp(Buffer.from(sheet)).jpeg({ quality: 94 }).toFile(new URL('team.jpg', folder).pathname)
  } else {
    const characters = presets.map((config, index) => renderAgentSvg(config, 0.6, 'idle', 280).replace('<svg ', `<svg x="${index * 280 + 20}" y="30" `) + `<text x="${index * 280 + 160}" y="300" text-anchor="middle" fill="#171717" font-family="Arial,sans-serif" font-size="22" font-weight="600">${config.name}</text>`).join('')
    await writeFile(new URL('team.svg', folder), `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="350" viewBox="0 0 1440 350"><rect width="1440" height="350" fill="#faf9f6"/>${characters}</svg>`)
  }
  console.log(`Generated ${presets.length} static SVGs, ${presets.length} animated SVGs and the ${collection} project.`)
} finally { await server.close() }
