import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  configFile: false,
  root,
  cacheDir: 'node_modules/.vite-agents',
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  server: { middlewareMode: true },
  appType: 'custom'
})
try {
  const { PRESETS, freshProject } = await server.ssrLoadModule('/src/agents/catalog.ts')
  const { renderAgentSvg } = await server.ssrLoadModule('/src/agents/render.ts')
  const { renderAnimatedSvg } = await server.ssrLoadModule('/src/agents/export.ts')
  const folder = new URL('../public/agents/', import.meta.url)
  await mkdir(folder, { recursive: true })
  for (const config of PRESETS) {
    await writeFile(new URL(`${config.id}.svg`, folder), renderAgentSvg(config, 0.6))
    await writeFile(new URL(`${config.id}-animated.svg`, folder), renderAnimatedSvg(config, config.id === 'qphone' ? 'listening' : config.id === 'marketing' ? 'speaking' : config.id === 'compras' ? 'working' : config.id === 'equipo' ? 'happy' : 'thinking'))
  }
  await writeFile(new URL('qamarero-agents.json', folder), JSON.stringify(freshProject(), null, 2) + '\n')
  const characters = PRESETS.map((config, index) => renderAgentSvg(config, 0.6, 'idle', 280).replace('<svg ', `<svg x="${index * 280 + 20}" y="30" `) + `<text x="${index * 280 + 160}" y="300" text-anchor="middle" fill="#171717" font-family="Arial,sans-serif" font-size="22" font-weight="600">${config.name}</text>`).join('')
  await writeFile(new URL('team.svg', folder), `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="350" viewBox="0 0 1440 350"><rect width="1440" height="350" fill="#faf9f6"/>${characters}</svg>`)
  console.log(`Generated ${PRESETS.length} static SVGs, ${PRESETS.length} animated SVGs and the portable project.`)
} finally { await server.close() }
