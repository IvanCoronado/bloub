// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { freshProject } from './catalog'
import { collectionKey } from './collectionStorage'
import { useStudio } from './useStudio'

beforeEach(() => { localStorage.clear(); history.replaceState(null, '', '/') })
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

function mountStudio() {
  let studio!: ReturnType<typeof useStudio>
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ setup() { studio = useStudio(); return () => h('div') } })
  app.mount(host)
  return { studio, close: () => { app.unmount(); host.remove() } }
}

describe('switching collections without losing work', () => {
  it('keeps unsaved names, accessories and timeline edits when switching both ways', () => {
    const { studio, close } = mountStudio()
    try {
      studio.patch({ name: 'Mi equipo original', accessories: ['headset', 'chef'] })
      studio.updateScene(0, { duration: 4.5 })
      studio.switchCollection('ingredients')
      expect(studio.config.value.name).toBe('Croqueta')
      studio.patch({ name: 'Mi croqueta' })
      studio.switchCollection('classic')
      expect(studio.config.value.name).toBe('Mi equipo original')
      expect(studio.config.value.accessories).toEqual(['headset', 'chef'])
      expect(studio.project.value.timeline[0]!.duration).toBe(4.5)
      studio.switchCollection('ingredients')
      expect(studio.config.value.name).toBe('Mi croqueta')
      expect(studio.dirty.value).toBe(false)
    } finally { close() }
  })
  it('refuses to switch if the current project cannot be saved', () => {
    const { studio, close } = mountStudio()
    try {
      studio.patch({ name: 'Conservar este trabajo' })
      vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('Quota exceeded') } })
      studio.switchCollection('ingredients')
      expect(studio.collection.value).toBe('classic')
      expect(studio.config.value.name).toBe('Conservar este trabajo')
      expect(studio.dirty.value).toBe(true)
    } finally { close() }
  })
  it('does not overwrite a newer save from another tab when this view has no edits', () => {
    localStorage.setItem(collectionKey('classic'), JSON.stringify(freshProject()))
    const { studio, close } = mountStudio()
    try {
      const newer = freshProject()
      newer.agents[0]!.name = 'Guardado desde otra pestaña'
      localStorage.setItem(collectionKey('classic'), JSON.stringify(newer))
      studio.switchCollection('ingredients')
      studio.switchCollection('classic')
      expect(studio.config.value.name).toBe('Guardado desde otra pestaña')
    } finally { close() }
  })
  it('imports ingredients into their own collection and preserves the original project', async () => {
    const { studio, close } = mountStudio()
    try {
      studio.patch({ name: 'Original que conservar' })
      const file = new File([JSON.stringify(freshProject('ingredients'))], 'ingredients.json', { type: 'application/json' })
      await studio.importFile(file)
      expect(studio.collection.value).toBe('ingredients')
      expect(studio.config.value.name).toBe('Croqueta')
      const original = JSON.parse(localStorage.getItem(collectionKey('classic'))!)
      expect(original.agents[0].name).toBe('Original que conservar')
      expect(localStorage.getItem(collectionKey('ingredients'))).toBeNull()
    } finally { close() }
  })
})
