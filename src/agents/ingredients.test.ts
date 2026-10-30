import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { freshProject, INGREDIENT_PRESETS, MOODS, MOTIONS, parseProject, PRESETS } from './catalog'
import { collectionKey, readCollectionProject, writeCollectionProject } from './collectionStorage'
import { renderAgentSvg } from './render'
import { renderAnimatedSvg } from './export'

describe('ingredient collection', () => {
  it('preserves every original character byte for byte', () => {
    for (const agent of PRESETS) {
      const original = readFileSync(new URL(`../../public/agents/${agent.id}.svg`, import.meta.url), 'utf8')
      expect(renderAgentSvg(agent, 0.6)).toBe(original)
    }
  })
  it('accepts the existing JSON format and the new collection without rewriting either', () => {
    const original = JSON.parse(readFileSync(new URL('../../public/agents/qamarero-agents.json', import.meta.url), 'utf8'))
    expect(parseProject(original)).toEqual(original)
    const ingredients = freshProject('ingredients')
    expect(parseProject(JSON.parse(JSON.stringify(ingredients)))).toEqual(ingredients)
    expect(ingredients.agents.map(agent => agent.name)).toEqual(['Croqueta', 'Gamba', 'Ajo', 'Limón', 'Tomate'])
    expect(() => parseProject({ ...ingredients, collection: 'unknown' })).toThrow()
  })
  it('keeps edited originals and ingredients in independent storage', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    const classic = freshProject()
    classic.agents[0]!.name = 'Mi Nico'
    classic.agents[0]!.accessories.push('chef')
    classic.timeline[0]!.duration = 4
    writeCollectionProject(storage, 'classic', classic)
    const ingredients = freshProject('ingredients')
    ingredients.agents[0]!.name = 'Croqueta personalizada'
    writeCollectionProject(storage, 'ingredients', ingredients)
    expect(collectionKey('classic')).toBe('qamarero-agent-studio-v1')
    expect(readCollectionProject(storage, 'classic')).toEqual(classic)
    expect(readCollectionProject(storage, 'ingredients')).toEqual(ingredients)
    expect(values.size).toBe(2)
  })
  it('renders each ingredient with every expression and motion without invalid geometry', () => {
    for (const agent of INGREDIENT_PRESETS) for (const mood of MOODS) for (const motion of MOTIONS) for (const time of [0.6, 1.49, 3.1]) {
      const svg = renderAgentSvg({ ...agent, expression: mood.id }, time, motion.id)
      expect(svg).not.toMatch(/NaN|Infinity|undefined/)
      expect(svg).toContain(agent.eyeColor)
      expect(svg.match(/clip-path=/g)?.length).toBeGreaterThanOrEqual(1)
    }
  })
  it('exports animated ingredient accessories with standalone SVG animation', () => {
    const shrimp = renderAnimatedSvg(INGREDIENT_PRESETS[1]!, 'speaking', 1)
    expect(shrimp).toContain('@keyframes')
    expect(shrimp).toContain('Gamba')
    const lemon = renderAnimatedSvg(INGREDIENT_PRESETS[3]!, 'idle', 1)
    expect(lemon).toContain('data-accessory="glasses"')
  })
})
