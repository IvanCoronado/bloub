import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { freshProject, parseProject, timelineAt, type Accessory, type AgentConfig, type CollectionId, type Motion, type TimelineBlock } from './catalog'
import { collectionFromSearch, collectionKey, readCollectionProject, writeCollectionProject } from './collectionStorage'

export function useStudio() {
  const collection = ref(collectionFromSearch(location.search))
  watch(collection, value => { document.title = value === 'ingredients' ? 'Qamarero · Ingredientes' : 'Qamarero · Agent Studio' }, { immediate: true })
  let initial = freshProject(collection.value)
  let loadError = ''
  try {
    initial = readCollectionProject(localStorage, collection.value)
  } catch { loadError = 'No se pudo recuperar el proyecto guardado. Puedes importar una copia JSON.' }
  const project = ref(initial)
  const selected = ref(initial.agents[0]!.id)
  const config = computed(() => project.value.agents.find(a => a.id === selected.value) ?? project.value.agents[0]!)
  const time = ref(0)
  const playing = ref(true)
  const sequencing = ref(false)
  const motion = ref<Motion>('idle')
  const duration = computed(() => sequencing.value ? project.value.timeline.reduce((n, b) => n + b.duration, 0) : 4)
  const scene = computed(() => sequencing.value ? timelineAt(project.value.timeline, time.value) : { state: motion.value, time: time.value, index: -1 })
  const dirty = ref(false)
  const message = ref(loadError)
  const reduced = ref(false)
  let messageTimer: ReturnType<typeof setTimeout> | undefined
  let raf = 0, last = 0
  let media: MediaQueryList | undefined
  function notify(text: string) {
    message.value = text
    clearTimeout(messageTimer)
    messageTimer = setTimeout(() => { message.value = '' }, 4500)
  }
  watch(project, () => { dirty.value = true }, { deep: true, flush: 'sync' })
  watch(duration, value => { time.value = Math.min(time.value, Math.max(0, value - 0.001)) })
  const onMotion = () => { reduced.value = media?.matches ?? false; if (reduced.value) playing.value = false }
  function tick(now: number) {
    if (last && playing.value) time.value = (time.value + Math.min((now - last) / 1000, 0.064)) % duration.value
    last = now
    raf = requestAnimationFrame(tick)
  }
  onMounted(() => {
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    onMotion()
    media.addEventListener('change', onMotion)
    raf = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => { cancelAnimationFrame(raf); clearTimeout(messageTimer); media?.removeEventListener('change', onMotion) })
  function patch(update: Partial<AgentConfig>) {
    project.value.agents = project.value.agents.map(a => a.id === selected.value ? { ...a, ...update } : a)
  }
  function toggleAccessory(accessory: Accessory) {
    patch({ accessories: config.value.accessories.includes(accessory) ? config.value.accessories.filter(a => a !== accessory) : [...config.value.accessories, accessory] })
  }
  function save() {
    try {
      writeCollectionProject(localStorage, collection.value, project.value)
      dirty.value = false
      notify('Proyecto guardado en este navegador.')
    } catch { notify('El navegador no permite guardar. Exporta el proyecto como JSON.') }
  }
  function updateCollectionUrl() {
    const url = new URL(location.href)
    if (collection.value === 'ingredients') url.searchParams.set('coleccion', 'ingredientes')
    else url.searchParams.delete('coleccion')
    history.replaceState(null, '', url)
  }
  function preserveCurrentCollection() {
    // Une vue sans changements ne doit pas ecraser une sauvegarde plus recente d'un autre onglet.
    if (dirty.value || localStorage.getItem(collectionKey(collection.value)) === null) writeCollectionProject(localStorage, collection.value, project.value)
  }
  function switchCollection(next: CollectionId) {
    if (next === collection.value) return
    try {
      preserveCurrentCollection()
      const nextProject = readCollectionProject(localStorage, next)
      collection.value = next
      project.value = nextProject
      selected.value = nextProject.agents[0]!.id
      time.value = 0
      dirty.value = false
      updateCollectionUrl()
      notify(next === 'ingredients' ? 'Colección Ingredientes. Tu equipo original está guardado.' : 'Colección Original. Se han recuperado tus personajes y ajustes.')
    } catch { notify('No se pudo guardar la colección actual. Exporta el JSON antes de cambiar de colección.') }
  }
  function duplicate() {
    if (project.value.agents.length >= 30) return notify('Puedes crear hasta 30 agentes por proyecto.')
    const copy = { ...structuredClone({ ...config.value, accessories: [...config.value.accessories] }), id: `agente-${crypto.randomUUID()}`, name: `${config.value.name.slice(0, 32)} copia` }
    project.value.agents.push(copy)
    selected.value = copy.id
    notify('Agente duplicado. Personalízalo a tu manera.')
  }
  function resetAgent() {
    const original = freshProject(collection.value).agents.find(a => a.id === selected.value)
    if (original) patch(original)
    else patch({ ...freshProject(collection.value).agents[0]!, id: config.value.id, name: config.value.name })
    notify('Apariencia original restaurada.')
  }
  function setMotion(state: Motion) { motion.value = state; sequencing.value = false; time.value = 0 }
  function addScene(state: Motion = motion.value) {
    if (project.value.timeline.length >= 24) return notify('La secuencia admite hasta 24 escenas.')
    project.value.timeline.push({ id: crypto.randomUUID(), state, duration: 2 })
    sequencing.value = true
  }
  function updateScene(index: number, update: Partial<TimelineBlock>) {
    project.value.timeline = project.value.timeline.map((b, i) => i === index ? { ...b, ...update } : b)
  }
  function removeScene(index: number) {
    if (project.value.timeline.length === 1) return notify('Conserva al menos una escena.')
    project.value.timeline.splice(index, 1)
  }
  function moveScene(index: number, direction: number) {
    const next = index + direction
    if (next < 0 || next >= project.value.timeline.length) return
    const blocks = [...project.value.timeline]
    const moved = blocks.splice(index, 1)[0]!
    blocks.splice(next, 0, moved)
    project.value.timeline = blocks
  }
  function seekScene(index: number) { sequencing.value = true; time.value = project.value.timeline.slice(0, index).reduce((n, b) => n + b.duration, 0) }
  async function importFile(file?: File) {
    if (!file) return
    if (file.size > 1_000_000) return notify('El archivo JSON no puede superar 1 MB.')
    try {
      const validated = parseProject(JSON.parse(await file.text()))
      const target = validated.collection ?? 'classic'
      if (target !== collection.value) {
        preserveCurrentCollection()
        collection.value = target
        updateCollectionUrl()
      }
      project.value = validated
      selected.value = validated.agents[0]!.id
      time.value = 0
      notify('Proyecto importado. Guárdalo para conservarlo en este navegador.')
    } catch (error) { notify(error instanceof Error ? error.message : 'No se pudo importar el proyecto.') }
  }
  return { project, collection, switchCollection, selected, config, time, playing, sequencing, motion, duration, scene, dirty, message, reduced, notify, patch, toggleAccessory, save, duplicate, resetAgent, setMotion, addScene, updateScene, removeScene, moveScene, seekScene, importFile }
}
