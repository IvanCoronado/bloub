// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import Studio from './AgentStudio.vue'
import { freshProject, parseProject } from './catalog'
import { collectionKey } from './collectionStorage'

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/')
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => {})
})
afterEach(() => { vi.unstubAllGlobals() })

function mountStudio() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(Studio)
  app.mount(host)
  async function click(selector: string) {
    const button = host.querySelector<HTMLButtonElement>(selector)
    expect(button, selector).not.toBeNull()
    button!.click()
    await nextTick()
  }
  return { host, click, close: () => { app.unmount(); host.remove() } }
}

describe('visual editor interactions', () => {
  it('shows the chosen expression after leaving a motion that overrides the face, and saves it', async () => {
    const view = mountStudio()
    try {
      expect(view.host.querySelectorAll('[aria-label="Expresión"] button')).toHaveLength(16)
      expect(view.host.querySelector('[aria-label="Secuencia de animación"]')).toBeNull()
      await view.click('.editor-tabs button:nth-child(2)')
      await view.click('.motion-option:nth-child(3)')
      expect(view.host.querySelector('.solo-stage svg')?.getAttribute('aria-label')).toContain('thinking')
      await view.click('.editor-tabs button:nth-child(1)')
      await view.click('[aria-label="Expresión: Enfadado"]')
      expect(view.host.querySelector('.solo-stage svg')?.getAttribute('aria-label')).toContain('idle')
      await view.click('[aria-label="Forma: Nube"]')
      await view.click('[aria-label="Color: Azul"]')
      await view.click('.save-button')
      const saved = parseProject(JSON.parse(localStorage.getItem(collectionKey('classic'))!))
      expect(saved.agents[0]).toMatchObject({ shape: 'cloud', expression: 'colere', bodyColor: '#398fe8', accessories: ['headset'] })
      expect(saved.timeline).toEqual(freshProject().timeline)
    } finally { view.close() }
  })
  it('keeps the two projects independent through the simplified collection controls', async () => {
    const view = mountStudio()
    try {
      await view.click('[aria-label="Expresión: Tímido"]')
      await view.click('.collection-options button:nth-child(2)')
      expect(view.host.querySelector('.canvas-agent-caption h1')?.textContent).toBe('Croqueta')
      await view.click('[aria-label="Expresión: Risueño"]')
      await view.click('.collection-options button:nth-child(1)')
      expect(view.host.querySelector('[aria-label="Expresión: Tímido"]')?.getAttribute('aria-pressed')).toBe('true')
      await view.click('.collection-options button:nth-child(2)')
      expect(view.host.querySelector('[aria-label="Expresión: Risueño"]')?.getAttribute('aria-pressed')).toBe('true')
      expect(view.host.querySelector('.settings-group[open]')).toBeNull()
    } finally { view.close() }
  })
})
