import { describe, expect, it } from 'vitest'
import { CAST, PRESENTATION, presentationAt } from './story'
import { renderPresentationSvg } from './render'

describe('team presentation', () => {
  it('introduces every named agent alone and ends with the whole team', () => {
    for (let index = 0; index < CAST.length; index++) {
      const at = PRESENTATION.intro + index * PRESENTATION.solo + 1
      expect(presentationAt(at)).toMatchObject({ kind: 'solo', index })
      const svg = renderPresentationSvg(at)
      expect(svg).toContain(CAST[index]!.name)
      expect(svg).toContain(CAST[index]!.role)
      for (const member of CAST.filter((_, i) => i !== index)) expect(svg).not.toContain(`>${member.name}</text>`)
    }
    const ending = renderPresentationSvg(29)
    for (const member of CAST) expect(ending).toContain(`>${member.name}</text>`)
    expect(ending.match(/data-member=/g)).toHaveLength(5)
  })
  it('handles the exact scene boundaries and clamps the ending', () => {
    expect(presentationAt(0).kind).toBe('intro')
    expect(presentationAt(1.2)).toMatchObject({ kind: 'solo', index: 0, time: 0 })
    expect(presentationAt(5.8)).toMatchObject({ kind: 'solo', index: 1 })
    expect(presentationAt(24.2)).toMatchObject({ kind: 'team', time: 0 })
    expect(presentationAt(100)).toEqual(presentationAt(30))
  })
  it('is deterministic when seeking backwards and keeps the corrected glasses', () => {
    const before = renderPresentationSvg(17)
    renderPresentationSvg(29)
    expect(renderPresentationSvg(17)).toBe(before)
    expect(before).toContain('data-accessory="glasses"')
    for (const time of [0, 1.2, 1.7, 10, 20, 24.2, 26, 30]) expect(renderPresentationSvg(time)).not.toMatch(/NaN|Infinity|undefined/)
  })
})
