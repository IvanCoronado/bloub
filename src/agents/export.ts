import { gifIndexe, indexe, nouvellePalette, recense } from '@/ui/anime'
import { timelineAt, type AgentConfig, type Motion, type TimelineBlock } from './catalog'
import { renderAgentSvg } from './render'

function cssTransform(value: string) {
  return value
    .replace(/translate\(([^)]+)\)/g, (_, args: string) => `translate(${args.split(/[ ,]+/).map(v => `${v}px`).join(',')})`)
    .replace(/rotate\(([^)]+)\)/g, (_, angle: string) => `rotate(${angle}deg)`)
    .replace(/scale\(([^)]+)\)/g, (_, args: string) => `scale(${args.split(/[ ,]+/).join(',')})`)
}

/** SVG anime autonome : CSS pour les matrices, SMIL pour les chemins. */
export function renderAnimatedSvg(config: AgentConfig, state: Motion = 'idle', duration = 4, size = 512) {
  const fps = 24
  const count = Math.ceil(duration * fps)
  const frames = Array.from({ length: count + 1 }, (_, i) => renderAgentSvg(config, i === count ? 0 : i / fps, state, size))
  const tags = frames.map(frame => [...frame.matchAll(/<(path|g|circle|ellipse)\b[^>]*>/g)])
  let tagIndex = 0
  const styles: string[] = []
  const classes: string[] = []
  const attributes = ['d', 'transform', 'opacity', 'cx', 'cy', 'rx', 'ry']
  const markup = frames[0]!.replace(/<(path|g|circle|ellipse)\b[^>]*>/g, (tag: string, name: string) => {
    const index = tagIndex++
    const animations = attributes.flatMap(attribute => {
      const pattern = new RegExp(`\\b${attribute}="([^"]*)"`)
      const values = tags.map(frame => frame[index]?.[0].match(pattern)?.[1])
      if (values.some(v => v === undefined) || values.every(v => v === values[0])) return []
      if (attribute === 'transform') {
        const className = `qa-${config.id.replace(/[^a-z0-9-]/gi, '')}-${index}`
        classes.push(`.${className}`)
        styles.push(`.${className}{transform-box:view-box;transform-origin:0 0;animation:${className} ${duration}s linear infinite}@keyframes ${className}{${values.map((value, i) => `${+(i / count * 100).toFixed(4)}%{transform:${cssTransform(value!)}}`).join('')}}`)
        tag = tag.replace(/\/?\>$/, ending => ` class="${className}"${ending}`)
        return []
      }
      return [`<animate attributeName="${attribute}" values="${values.join(';')}" dur="${duration}s" repeatCount="indefinite"/>`]
    }).join('')
    if (!animations) return tag
    return tag.endsWith('/>') ? `${tag.slice(0, -2)}>${animations}</${name}>` : `${tag}${animations}`
  })
  return markup.replace('</svg>', `<style>${styles.join('')}@media(prefers-reduced-motion:reduce){${classes.join(',')}{animation:none}}</style></svg>`)
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'animated-svg' | 'gif' | 'mp4'
  size: number
  state: Motion
  time: number
  timeline?: TimelineBlock[]
  background: string | null
  signal?: AbortSignal
  progress?: (value: number) => void
}

async function rasterize(svg: string, canvas: HTMLCanvasElement) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Tu navegador no permite crear imágenes.')
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return context
  } finally { URL.revokeObjectURL(url) }
}

export async function exportAgent(config: AgentConfig, options: ExportOptions): Promise<Blob> {
  const { format, size, state, time, timeline, signal } = options
  const background = format === 'mp4' ? options.background ?? '#faf9f6' : options.background
  if (format === 'svg') return new Blob([renderAgentSvg(config, time, state, size, config.id, background)], { type: 'image/svg+xml' })
  if (format === 'animated-svg') return new Blob([renderAnimatedSvg(config, state, 4, size)], { type: 'image/svg+xml' })
  if (format === 'png') {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    await rasterize(renderAgentSvg(config, time, state, size, config.id, background), canvas)
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo crear el PNG.')), 'image/png'))
  }
  const duration = timeline ? timeline.reduce((n, b) => n + b.duration, 0) : 4
  const fps = format === 'gif' ? 20 : 30
  const images = Math.ceil(duration * fps)
  if (format === 'gif' && images * size * size > 128 * 1024 * 1024) throw new Error('Esta secuencia es demasiado grande para GIF. Reduce la resolución o exporta MP4.')
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const draw = async (i: number) => {
    signal?.throwIfAborted()
    const at = timeline ? timelineAt(timeline, i / fps) : { state, time: i / fps }
    return rasterize(renderAgentSvg(config, at.time, at.state, size, config.id, background), canvas)
  }
  if (format === 'mp4') {
    const { versMp4 } = await import('@/ui/video')
    return versMp4(canvas, images, fps, async i => { await draw(i) }, (done, total) => options.progress?.(done / total), signal)
  }
  const palette = nouvellePalette()
  for (let i = 0; i < images; i++) {
    const context = await draw(i)
    recense(palette, context.getImageData(0, 0, size, size).data)
    options.progress?.((i + 1) / (images * 2))
  }
  const indexed: Uint8Array[] = []
  for (let i = 0; i < images; i++) {
    const context = await draw(i)
    indexed.push(indexe(palette, context.getImageData(0, 0, size, size).data))
    options.progress?.((images + i + 1) / (images * 2))
  }
  return new Blob([gifIndexe(palette, indexed, size, size, 1000 / fps)], { type: 'image/gif' })
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
