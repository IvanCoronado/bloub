<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import AgentAvatar from './AgentAvatar.vue'
import AppearanceControls from './AppearanceControls.vue'
import Icon from './StudioIcon.vue'
import ExportDialog from './ExportDialog.vue'
import CollectionSwitcher from './CollectionSwitcher.vue'
import { ACCESSORIES, MOTIONS, type AgentConfig } from './catalog'
import { useStudio } from './useStudio'
import { download, renderAnimatedSvg } from './export'

const { project, collection, switchCollection, selected, config, time, playing, sequencing, duration, scene, dirty, message, reduced, notify, patch, toggleAccessory, save, duplicate, resetAgent, setMotion, addScene, updateScene, removeScene, moveScene, seekScene, importFile } = useStudio()
const tab = ref<'design' | 'animation' | 'integration'>('design')
const exporting = ref(false)
const presenting = ref(false)
const AgentPresentation = defineAsyncComponent(() => import('./presentation/AgentPresentation.vue'))
const grid = ref(false)
const dark = ref(false)
const team = ref(false)
const inputFile = ref<HTMLInputElement>()
const projectMenu = ref<HTMLDetailsElement>()
const accentColors = ['#ff5d22', '#19262e', '#efb923', '#398fe8', '#8c57ed', '#37ca8b']
const currentMotion = computed(() => MOTIONS.find(m => m.id === scene.value.state)!)
const timelineDuration = computed(() => project.value.timeline.reduce((sum, block) => sum + block.duration, 0))
const integrationCode = computed(() => `<script setup lang="ts">\nimport AgentAvatar from './agents/AgentAvatar.vue'\nimport { parseProject } from './agents/catalog'\nimport json from './${collection.value === 'ingredients' ? 'qamarero-ingredients' : 'qamarero-agents'}.json'\n\nconst project = parseProject(json)\nconst agent = project.agents.find(\n  a => a.id === '${config.value.id}'\n)!\n<\/script>\n\n<template>\n  <AgentAvatar\n    :config="agent"\n    state="${scene.value.state}"\n    :size="160"\n    :playing="true"\n  />\n</template>`)
function numberPatch(key: keyof AgentConfig, event: Event) { patch({ [key]: Number((event.target as HTMLInputElement).value) }) }
function downloadProject() { download(new Blob([JSON.stringify(project.value, null, 2)], { type: 'application/json' }), collection.value === 'ingredients' ? 'qamarero-ingredients.json' : 'qamarero-agents.json'); notify('Proyecto JSON exportado con agentes y secuencia.') }
async function copyCode() {
  try { await navigator.clipboard.writeText(integrationCode.value); notify('Código copiado.') }
  catch { notify('No se pudo acceder al portapapeles. Selecciona y copia el código.') }
}
function downloadAnimation() { download(new Blob([renderAnimatedSvg(config.value, scene.value.state)], { type: 'image/svg+xml' }), `${config.value.id}-animated.svg`) }
function chooseAgent(id: string) { selected.value = id; team.value = false }
function chooseExpression(expression: AgentConfig['expression']) { patch({ expression }); setMotion('idle') }
function menuAction(action: () => void) { if (projectMenu.value) projectMenu.value.open = false; action() }
function sceneDuration(index: number, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) updateScene(index, { duration: Math.min(10, Math.max(0.5, value)) })
}
</script>

<template>
  <div class="studio-shell">
    <header class="studio-topbar">
      <a class="brand" href="#" aria-label="Qamarero Agent Studio"><span class="brand-symbol">q</span><span>Agent studio</span></a>
      <CollectionSwitcher :collection="collection" @select="switchCollection" />
      <div class="topbar-actions">
        <button class="button presentation-entry" aria-label="Presentar equipo" title="Presentar equipo" @click="playing = false; presenting = true"><Icon name="play" :size="16" /><span>Presentar</span></button>
        <button class="button save-button" :class="{ unsaved: dirty }" :aria-label="dirty ? 'Guardar cambios' : 'Guardar proyecto'" @click="save"><Icon :name="dirty ? 'save' : 'check'" :size="17" /><span>Guardar</span></button>
        <button class="button primary" aria-label="Exportar agente" title="Exportar agente" @click="playing = false; exporting = true"><Icon name="download" :size="17" /><span>Exportar</span></button>
        <details ref="projectMenu" class="project-menu">
          <summary class="icon-button" aria-label="Opciones de proyecto" title="Opciones de proyecto"><Icon name="more" :size="21" /></summary>
          <div class="project-menu-items">
            <button @click="menuAction(() => inputFile?.click())"><Icon name="upload" :size="16" />Importar proyecto</button>
            <button @click="menuAction(downloadProject)"><Icon name="download" :size="16" />Descargar proyecto JSON</button>
            <button @click="menuAction(duplicate)"><Icon name="copy" :size="16" />Duplicar agente</button>
            <a href="https://github.com/IvanCoronado/bloub" target="_blank" rel="noreferrer"><Icon name="github" :size="16" />Código fuente</a>
          </div>
        </details>
        <input ref="inputFile" class="visually-hidden" type="file" accept=".json,application/json" aria-label="Importar proyecto JSON" @change="event => { importFile((event.target as HTMLInputElement).files?.[0]); (event.target as HTMLInputElement).value = '' }" />
      </div>
    </header>

    <nav class="character-strip" aria-label="Agentes del equipo">
      <button v-for="agent in project.agents" :key="agent.id" :class="['character-card', { active: selected === agent.id }]" :aria-label="`Editar ${agent.name}`" :aria-pressed="selected === agent.id" @click="chooseAgent(agent.id)">
        <span aria-hidden="true"><AgentAvatar :config="agent" :time="0.6" :size="54" /></span><span>{{ agent.name }}</span>
      </button>
      <button class="character-card add-card" aria-label="Crear un agente a partir del actual" @click="duplicate"><Icon name="plus" :size="20" /><span>Nuevo</span></button>
    </nav>

    <main class="studio-main">
      <div class="editor-layout">
        <section class="preview-panel" aria-label="Vista previa del agente">
          <div :class="['preview-canvas', { dotted: grid, dark, 'team-view': team }]">
            <div class="canvas-tools">
              <button class="icon-button" :class="{ active: team }" aria-label="Ver todo el equipo" :aria-pressed="team" @click="team = !team"><Icon name="users" :size="19" /></button>
              <button class="icon-button" :class="{ active: dark }" aria-label="Cambiar fondo" :aria-pressed="dark" @click="dark = !dark"><Icon name="sun" :size="19" /></button>
            </div>
            <div v-if="team" class="team-stage"><div v-for="agent in project.agents" :key="agent.id" class="team-character"><AgentAvatar :config="agent" :time="scene.time" :state="scene.state" :size="170" /><span>{{ agent.name }}</span></div></div>
            <div v-else class="solo-stage"><AgentAvatar :config="config" :time="scene.time" :state="scene.state" :size="460" /></div>
            <div class="canvas-agent-caption"><h1>{{ team ? 'El equipo de Qamarero' : config.name }}</h1><p v-if="!team">{{ config.role }}</p></div>
            <div class="preview-transport"><button class="icon-button" :aria-label="playing ? 'Pausar' : 'Reproducir'" @click="playing = !playing"><Icon :name="playing ? 'pause' : 'play'" :size="18" /></button><span>{{ playing ? currentMotion.label : 'En pausa' }}</span><button class="icon-button" aria-label="Volver al inicio" @click="time = 0"><Icon name="reset" :size="16" /></button></div>
          </div>
          <nav class="editor-tabs" aria-label="Herramientas del agente"><button :class="{ active: tab === 'design' }" :aria-pressed="tab === 'design'" @click="tab = 'design'">Diseñar</button><button :class="{ active: tab === 'animation' }" :aria-pressed="tab === 'animation'" @click="tab = 'animation'">Animar</button><button :class="{ active: tab === 'integration' }" :aria-pressed="tab === 'integration'" @click="tab = 'integration'">Integrar</button></nav>
        </section>

        <aside v-if="tab === 'design'" class="properties-panel" aria-label="Propiedades del agente">
          <AppearanceControls :config="config" :collection="collection" @patch="patch" @expression="chooseExpression" />
          <details class="settings-group">
            <summary>Accesorios<span>{{ config.accessories.length || 'Ninguno' }}</span><Icon name="down" :size="17" /></summary>
            <div class="accessory-options" role="group" aria-label="Accesorios">
              <button v-for="accessory in ACCESSORIES" :key="accessory.id" :class="['accessory-option', { active: config.accessories.includes(accessory.id) }]" :aria-pressed="config.accessories.includes(accessory.id)" @click="toggleAccessory(accessory.id)"><Icon :name="accessory.icon" :size="26" /><span>{{ accessory.label }}</span></button>
            </div>
          </details>
          <details class="settings-group">
            <summary>Más ajustes<Icon name="down" :size="17" /></summary>
            <div class="advanced-settings">
              <label class="field-label" for="agent-name">Nombre</label><input id="agent-name" class="text-input" :value="config.name" maxlength="40" @input="event => patch({ name: (event.target as HTMLInputElement).value })" @blur="() => { if (!config.name.trim()) patch({ name: 'Mi agente' }) }" />
              <label class="field-label" for="agent-role">Descripción</label><input id="agent-role" class="text-input" :value="config.role" maxlength="100" @input="event => patch({ role: (event.target as HTMLInputElement).value })" @blur="() => { if (!config.role.trim()) patch({ role: 'Mi compañero' }) }" />
              <div class="section-heading"><label class="field-label">Color de accesorios</label><input type="color" :value="config.accentColor" aria-label="Color personalizado de acento" @input="event => patch({ accentColor: (event.target as HTMLInputElement).value })" /></div>
              <div class="accent-options"><button v-for="color in accentColors" :key="color" :style="{ background: color }" :class="{ active: config.accentColor === color }" :aria-label="`Acento ${color}`" :aria-pressed="config.accentColor === color" @click="patch({ accentColor: color })" /></div>
              <div class="section-heading"><label class="field-label">Color de ojos</label><input type="color" :value="config.eyeColor" aria-label="Color de ojos" @input="event => patch({ eyeColor: (event.target as HTMLInputElement).value })" /></div>
              <label class="field-label" for="depth">Profundidad<span>{{ Math.round(config.depth * 100) }} %</span></label><input id="depth" type="range" min="0" max="1" step="0.01" :value="config.depth" @input="numberPatch('depth', $event)" />
              <label class="field-label" for="accessory-scale">Tamaño de accesorios<span>{{ Math.round(config.accessoryScale * 100) }} %</span></label><input id="accessory-scale" type="range" min="0.65" max="1.3" step="0.01" :value="config.accessoryScale" @input="numberPatch('accessoryScale', $event)" />
              <label class="field-label" for="tilt">Inclinación<span>{{ config.tilt }}°</span></label><input id="tilt" type="range" min="-15" max="15" step="1" :value="config.tilt" @input="numberPatch('tilt', $event)" />
              <label class="toggle-label"><input type="checkbox" :checked="config.shadow" @change="patch({ shadow: !config.shadow })" />Sombra suave</label>
              <label class="toggle-label"><input v-model="grid" type="checkbox" />Cuadrícula de fondo</label>
              <button class="text-button" @click="resetAgent"><Icon name="reset" :size="16" />Restaurar apariencia original</button>
            </div>
          </details>
        </aside>

        <aside v-else-if="tab === 'animation'" class="properties-panel motion-properties" aria-label="Movimiento del agente">
          <section class="choice-section"><h2>Movimiento</h2><div class="motion-options"><button v-for="item in MOTIONS" :key="item.id" :class="['motion-option', { active: scene.state === item.id }]" :aria-pressed="scene.state === item.id" @click="setMotion(item.id)"><Icon :name="item.icon" :size="23" /><span>{{ item.label }}</span></button></div></section>
          <label class="field-label field-top" for="intensity">Intensidad<span>{{ Math.round(config.intensity * 100) }} %</span></label><input id="intensity" type="range" min="0" max="1" step="0.01" :value="config.intensity" @input="numberPatch('intensity', $event)" />
          <label class="field-label field-top" for="speed">Velocidad<span>{{ config.speed }}×</span></label><input id="speed" type="range" min="0.25" max="2" step="0.05" :value="config.speed" @input="numberPatch('speed', $event)" />
          <button class="button full-width field-top" @click="addScene(scene.state)"><Icon name="plus" :size="16" />Añadir a la secuencia</button>
          <div class="sequence-editor">
          <section class="timeline-panel" aria-label="Secuencia de animación"><div class="timeline-heading"><div><Icon name="film" :size="17" /><h2>Un poco de movimiento</h2><span class="beta-tag">SECUENCIA</span></div><button class="text-button" @click="addScene()"><Icon name="plus" :size="14" />Añadir escena</button></div><div class="timeline-content"><div class="transport"><button class="play-button" :aria-label="playing ? 'Pausar' : 'Reproducir'" @click="playing = !playing"><Icon :name="playing ? 'pause' : 'play'" :size="18" /></button><button class="icon-button" aria-label="Volver al inicio" @click="time = 0"><Icon name="reset" :size="15" /></button><span>{{ time.toFixed(1).padStart(4, '0') }}<small>/ {{ duration.toFixed(1) }} s</small></span></div><div class="timeline-track"><div class="timeline-ruler"><span v-for="tick in 6" :key="tick">{{ ((tick - 1) * timelineDuration / 5).toFixed(0).padStart(2, '0') }}s</span></div><div class="timeline-blocks"><div v-for="(block, index) in project.timeline" :key="block.id" :class="['timeline-block', { active: sequencing && scene.index === index }]" :style="{ flex: block.duration }"><button class="scene-main" @click="seekScene(index)"><Icon :name="MOTIONS.find(m => m.id === block.state)!.icon" :size="15" /><span>{{ MOTIONS.find(m => m.id === block.state)!.label }}</span></button><div class="scene-editor"><label><span class="visually-hidden">Duración de escena {{ index + 1 }}</span><input type="number" min="0.5" max="10" step="0.5" :value="block.duration" @change="sceneDuration(index, $event)" />s</label><div class="scene-controls"><button :disabled="index === 0" :aria-label="`Mover escena ${index + 1} antes`" @click="moveScene(index, -1)">‹</button><button :disabled="index === project.timeline.length - 1" :aria-label="`Mover escena ${index + 1} después`" @click="moveScene(index, 1)">›</button><button :disabled="project.timeline.length === 1" :aria-label="`Eliminar escena ${index + 1}`" @click="removeScene(index)">×</button></div></div></div></div><input class="timeline-scrubber" type="range" min="0" :max="duration - 0.001" step="0.01" :value="time" aria-label="Posición de reproducción" @input="event => { time = Number((event.target as HTMLInputElement).value); playing = false }" /></div></div><div class="timeline-bottom"><label class="toggle-label"><input v-model="sequencing" type="checkbox" @change="time = 0" />Reproducir secuencia</label><span><span class="orange-dot"></span>{{ reduced ? 'Movimiento reducido · reproducción manual' : 'Bucle continuo' }}</span></div></section>
          </div>
        </aside>
        <aside v-else class="properties-panel integration-panel">
        <section v-if="tab === 'integration'" class="integration-layout"><div class="integration-intro"><span class="integration-symbol"><Icon name="code" :size="34" /></span><h2>Tu agente, donde lo necesites.</h2><p>Usa el componente Vue para conectar sus estados a tu producto, o descarga un SVG animado para insertarlo como una imagen.</p><div class="integration-actions"><button class="button primary" @click="downloadAnimation"><Icon name="download" :size="16" />SVG animado</button><button class="button" @click="downloadProject"><Icon name="download" :size="16" />Proyecto JSON</button></div><div class="integration-callout"><Icon name="layers" :size="20" /><div><strong>La composición viaja contigo.</strong><p>El JSON conserva los personajes, colores, expresiones, accesorios y toda la secuencia. Impórtalo para seguir editando.</p></div></div><a class="text-button" href="https://github.com/IvanCoronado/bloub/blob/codex/qamarero-agent-studio/docs/qamarero-studio.md" target="_blank" rel="noreferrer"><Icon name="book" :size="17" />Guía de integración<Icon name="external" :size="13" /></a></div><div class="code-card"><header><span>AgentAvatar.vue</span><button class="text-button" @click="copyCode"><Icon name="copy" :size="14" />Copiar</button></header><pre><code>{{ integrationCode }}</code></pre><div class="code-preview"><AgentAvatar :config="config" :time="time" :state="scene.state" :size="190" /><span>Vue 3 + TypeScript<span class="orange-dot"></span>SVG nativo</span></div></div></section>
        </aside>
      </div>
    </main>
    <div v-if="message" class="studio-toast" role="status"><Icon name="check" :size="17" />{{ message }}<button class="icon-button" aria-label="Cerrar aviso" @click="message = ''"><Icon name="close" :size="16" /></button></div>
    <ExportDialog v-if="exporting" :config="config" :state="scene.state" :time="scene.time" :timeline="sequencing ? project.timeline : undefined" @close="exporting = false" @done="notify" />
    <AgentPresentation v-if="presenting" embedded :collection="collection" @close="presenting = false" />
  </div>
</template>
