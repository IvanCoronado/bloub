<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { AgentConfig, Motion, TimelineBlock } from './catalog'
import { download, exportAgent, type ExportOptions } from './export'
import AgentAvatar from './AgentAvatar.vue'
import Icon from './StudioIcon.vue'

const props = defineProps<{ config: AgentConfig; state: Motion; time: number; timeline?: TimelineBlock[] }>()
const emit = defineEmits<{ close: []; done: [message: string] }>()
const dialog = ref<HTMLDialogElement>()
const format = ref<ExportOptions['format']>('animated-svg')
const size = ref(512)
const transparent = ref(true)
const busy = ref(false)
const progress = ref(0)
const error = ref('')
const controller = new AbortController()
const formats = [{ id: 'animated-svg', name: 'SVG animado', hint: 'Vectorial · sin dependencias' }, { id: 'svg', name: 'SVG', hint: 'Vectorial · fotograma actual' }, { id: 'png', name: 'PNG', hint: 'Imagen · alta resolución' }, { id: 'gif', name: 'GIF', hint: 'Animación · compatible' }, { id: 'mp4', name: 'MP4', hint: 'Vídeo · fondo opaco' }] as const
const sequenceExport = computed(() => !!props.timeline && (format.value === 'gif' || format.value === 'mp4'))
watch(format, value => { if (value === 'gif' && size.value > 512) size.value = 512 })
onMounted(() => { dialog.value?.showModal() })
onBeforeUnmount(() => { controller.abort() })
function close() { controller.abort(); emit('close') }
async function run() {
  busy.value = true
  error.value = ''
  progress.value = 0
  try {
    const blob = await exportAgent(props.config, { format: format.value, size: size.value, state: props.state, time: props.time, timeline: sequenceExport.value ? props.timeline : undefined, background: transparent.value ? null : '#faf9f6', signal: controller.signal, progress: value => { progress.value = value } })
    const extension = format.value === 'animated-svg' ? 'svg' : format.value
    download(blob, `${props.config.id}-${format.value}.${extension}`)
    emit('done', 'Tu agente ya está listo para usar.')
    emit('close')
  } catch (e) {
    if (!controller.signal.aborted) error.value = e instanceof Error ? e.message : 'No se ha podido exportar. Prueba SVG o PNG.'
  } finally { busy.value = false }
}
</script>

<template>
  <dialog ref="dialog" class="export-dialog" aria-labelledby="export-title" @cancel.prevent="close" @click="event => { if (event.target === dialog) close() }">
    <header><h2 id="export-title">Exportar agente</h2><button class="icon-button" aria-label="Cerrar exportación" @click="close"><Icon name="close" /></button></header>
    <div class="export-preview checker"><AgentAvatar :config="config" :state="state" :time="time" :size="200" /></div>
    <div class="format-grid"><button v-for="item in formats" :key="item.id" :class="{ active: format === item.id }" :aria-pressed="format === item.id" :disabled="busy" @click="format = item.id"><strong>{{ item.name }}</strong><small>{{ item.hint }}</small></button></div>
    <div class="export-options"><label>Resolución<select v-model="size" :disabled="busy"><option :value="256">256 × 256 px</option><option :value="512">512 × 512 px</option><option v-if="format !== 'gif'" :value="1024">1024 × 1024 px</option></select></label><label class="toggle-label"><input v-model="transparent" type="checkbox" :disabled="busy || format === 'mp4' || format === 'animated-svg'" /> Fondo transparente</label></div>
    <p class="muted export-note">{{ sequenceExport ? 'Se exportará la secuencia completa, con todas sus escenas.' : format === 'animated-svg' ? 'Bucle de 4 segundos del estado actual. Funciona en web y como imagen SVG.' : format === 'mp4' ? 'El vídeo incluye un fondo claro. Requiere un navegador con WebCodecs.' : format === 'gif' ? 'Bucle de 4 segundos del estado actual.' : 'Se exportará el fotograma que estás viendo.' }}</p>
    <p v-if="error" class="error-message" role="alert">{{ error }}</p>
    <div v-if="busy" class="export-progress"><progress :value="progress" max="1" /><span>{{ Math.round(progress * 100) }} %</span></div>
    <footer><button class="button" @click="close">{{ busy ? 'Cancelar exportación' : 'Cancelar' }}</button><button class="button primary" :disabled="busy" @click="run"><Icon name="download" :size="17" />{{ busy ? 'Preparando…' : 'Descargar agente' }}</button></footer>
  </dialog>
</template>
