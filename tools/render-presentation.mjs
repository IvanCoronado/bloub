import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const collection = process.argv.includes('--ingredients') ? 'ingredients' : 'classic'
const stem = collection === 'ingredients' ? 'equipo-qamarero-ingredientes' : 'equipo-qamarero'
const server = await createServer({ configFile: false, root, cacheDir: 'node_modules/.vite-presentation', resolve: { alias: { '@': `${root}src` } }, server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true }, appType: 'custom' })
try {
  const { renderPresentationSvg } = await server.ssrLoadModule('/src/agents/presentation/render.ts')
  const { PRESENTATION } = await server.ssrLoadModule('/src/agents/presentation/story.ts')
  const draw = time => renderPresentationSvg(time, undefined, 'presentation', collection)
  const output = new URL('../public/presentations/', import.meta.url)
  await mkdir(output, { recursive: true })
  await sharp(Buffer.from(draw(28))).jpeg({ quality: 94 }).toFile(fileURLToPath(new URL(`${stem}.jpg`, output)))
  for (const [name, time] of collection === 'ingredients' ? [['croqueta', 2.5], ['limon', 16.3], ['tomate', 20.9]] : [['nico', 2.5], ['vera', 16.3], ['bruno', 20.9]]) {
    await sharp(Buffer.from(draw(time))).jpeg({ quality: 94 }).toFile(`${root}docs/presentation-${name}.jpg`)
  }
  const temporary = fileURLToPath(new URL(`${stem}.rendering.mp4`, output))
  const final = fileURLToPath(new URL(`${stem}.mp4`, output))
  const child = spawn(process.env.QAMARERO_FFMPEG ?? 'ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${PRESENTATION.width}x${PRESENTATION.height}`, '-framerate', String(PRESENTATION.fps), '-i', 'pipe:0', '-an',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', temporary
  ], { stdio: ['pipe', 'ignore', 'pipe'] })
  let errors = ''
  child.stderr.on('data', data => { errors = (errors + data.toString()).slice(-4000) })
  const finished = new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${errors}`)))
  })
  sharp.concurrency(2)
  const frames = PRESENTATION.duration * PRESENTATION.fps
  try {
    for (let frame = 0; frame < frames; frame++) {
      const svg = draw(frame / PRESENTATION.fps)
      const pixels = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer()
      if (!child.stdin.write(pixels)) await once(child.stdin, 'drain')
      if (frame % 90 === 0) console.log(`Rendering ${Math.round(frame / frames * 100)}%`)
    }
    child.stdin.end()
    await finished
    await rename(temporary, final)
  } catch (error) { child.kill(); throw error }
  await writeFile(new URL(collection === 'ingredients' ? 'README-ingredientes.md' : 'README.md', output), `# El equipo de Qamarero\n\n30 segundos · 1920 × 1080 · 30 fps · H.264 · sin audio.\n\n${collection === 'ingredients' ? 'Croqueta → Gamba → Ajo → Limón → Tomate' : 'Nico → Lola → Alex → Vera → Bruno'} → los cinco juntos.\n\nGenerado con \`pnpm ${collection === 'ingredients' ? 'render:presentation:ingredients' : 'render:presentation'}\`. Fuente y tiempos: \`src/agents/presentation/\`.\n`)
  console.log(`Rendered ${final}`)
} finally { await server.close() }
