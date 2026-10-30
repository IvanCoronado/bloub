import { describe, expect, it } from 'vitest'
import { freshProject, parseProject, PRESETS, MOTIONS, timelineAt } from './catalog'
import { renderAgentSvg } from './render'
import { renderAnimatedSvg } from './export'

describe('project portability', () => {
  it('round-trips agents, combinations and timeline without sharing mutable defaults', () => {
    const project = freshProject()
    project.agents[0]!.accessories.push('chef')
    const restored = parseProject(JSON.parse(JSON.stringify(project)))
    expect(restored).toEqual(project)
    expect(PRESETS[0]!.accessories).toEqual(['headset'])
  })
  it('rejects unsafe colors, unknown accessories, nonfinite controls and duplicate ids', () => {
    for (const mutate of [
      (p: ReturnType<typeof freshProject>) => { p.agents[0]!.bodyColor = 'url(https://example.com)' },
      (p: ReturnType<typeof freshProject>) => { p.agents[0]!.speed = Infinity },
      (p: ReturnType<typeof freshProject>) => { p.agents[0]!.accessories = ['unknown' as never] },
      (p: ReturnType<typeof freshProject>) => { p.agents[1]!.id = p.agents[0]!.id },
      (p: ReturnType<typeof freshProject>) => { p.timeline[0]!.duration = 0 }
    ]) {
      const project = freshProject()
      mutate(project)
      expect(() => parseProject(project)).toThrow()
    }
  })
  it('locates exact scene boundaries and wraps the full sequence', () => {
    const { timeline } = freshProject()
    expect(timelineAt(timeline, 1.99).state).toBe('idle')
    expect(timelineAt(timeline, 2)).toMatchObject({ state: 'listening', time: 0, index: 1 })
    expect(timelineAt(timeline, 10)).toMatchObject({ state: 'idle', time: 0 })
    expect(timelineAt(timeline, -1).state).toBe('happy')
  })
})

describe('shared animation renderer', () => {
  it('renders every identity and motion without invalid coordinates', () => {
    for (const config of PRESETS) for (const motion of MOTIONS) for (const time of [0, 0.25, 1.4, 3.99]) {
      const svg = renderAgentSvg(config, time, motion.id)
      expect(svg).not.toMatch(/NaN|Infinity|undefined/)
      expect(svg).toContain(`aria-label="${config.name} · ${motion.id}"`)
      expect(svg).toContain(config.accentColor)
    }
  })
  it('is replayable after sampling later frames', () => {
    const first = renderAgentSvg(PRESETS[0]!, 0.2, 'speaking')
    renderAgentSvg(PRESETS[0]!, 25, 'speaking')
    expect(renderAgentSvg(PRESETS[0]!, 0.2, 'speaking')).toBe(first)
    expect(renderAgentSvg(PRESETS[0]!, 0.5, 'speaking')).not.toBe(first)
  })
  it('keeps all combined accessories in the exported drawing', () => {
    const config = { ...PRESETS[0]!, accessories: ['headset', 'megaphone', 'bowtie', 'glasses', 'chef'] as const }
    const svg = renderAgentSvg({ ...config, accessories: [...config.accessories] }, 0.5)
    expect(svg).toContain('ellipse cx="57"')
    expect(svg).toContain('L-22 -12')
    expect(svg).toContain('data-accessory="glasses"')
    expect(svg).toContain('C-70 -31')
    expect(svg).toContain('width="27"')
  })
  it('escapes user supplied text and isolates SVG definitions', () => {
    const svg = renderAgentSvg({ ...PRESETS[0]!, name: '<script>alert(1)</script>' }, 0, 'idle', 512, 'instance-2')
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;script&gt;')
    expect(svg).toContain('url(#instance-2-body)')
  })
  it('produces a self-contained animated SVG with a closed loop', () => {
    const svg = renderAnimatedSvg(PRESETS[0]!, 'speaking', 1)
    expect(svg).toContain('@keyframes qa-qphone-')
    expect(svg).toContain('transform-box:view-box;transform-origin:0 0;')
    expect(svg).not.toContain('<animate attributeName="transform"')
    expect(svg).toContain('repeatCount="indefinite"')
    expect(svg).not.toContain('<script')
    for (const match of svg.matchAll(/<animate[^>]*values="([^"]*)"/g)) {
      const values = match[1]!.split(';')
      expect(values.at(-1)).toBe(values[0])
    }
  })
})
