<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Icon from '../StudioIcon.vue'
import { renderPresentationSvg } from './render'
import type { CollectionId } from '../catalog'
import { castFor, PRESENTATION, presentationAt } from './story'

const props = withDefaults(defineProps<{ embedded?: boolean; collection?: CollectionId }>(), { embedded: false, collection: 'classic' })
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const time = ref(0)
const playing = ref(true)
const scene = computed(() => presentationAt(time.value))
const cast = computed(() => castFor(props.collection))
const markup = computed(() => renderPresentationSvg(time.value, undefined, 'presentation', props.collection))
const videoStem = computed(() => props.collection === 'ingredients' ? 'equipo-qamarero-ingredientes' : 'equipo-qamarero')
const formatTime = (value: number) => `0:${Math.floor(value).toString().padStart(2, '0')}`
let raf = 0, last = 0
let media: MediaQueryList | undefined
function motionChanged() { if (media?.matches) playing.value = false }
function tick(now: number) {
  if (last && playing.value) {
    time.value = Math.min(PRESENTATION.duration, time.value + Math.min((now - last) / 1000, 0.064))
    if (time.value === PRESENTATION.duration) playing.value = false
  }
  last = now
  raf = requestAnimationFrame(tick)
}
function toggle() {
  if (time.value >= PRESENTATION.duration) time.value = 0
  playing.value = !playing.value
}
function seek(value: number) { time.value = value; playing.value = false }
function close() {
  if (props.embedded) emit('close')
  else location.assign('/')
}
onMounted(() => {
  dialog.value?.showModal()
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionChanged()
  if (media.matches) time.value = 0.65
  media.addEventListener('change', motionChanged)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); media?.removeEventListener('change', motionChanged) })
</script>

<template>
  <dialog ref="dialog" class="presentation-shell" aria-label="Presentación del equipo de Qamarero" @cancel.prevent="close">
    <header class="presentation-header"><div><Icon name="film" :size="19" /><strong>El equipo de Qamarero</strong><span>{{ collection === 'ingredients' ? 'Ingredientes' : 'Presentación' }}</span></div><button class="icon-button" aria-label="Cerrar presentación" @click="close"><Icon name="close" :size="21" /></button></header>
    <div class="presentation-stage" v-html="markup" />
    <div class="presentation-navigation"><button :class="{ active: scene.kind === 'intro' }" @click="seek(0.65)">Inicio</button><button v-for="(member, index) in cast" :key="member.id" :class="{ active: scene.kind === 'solo' && scene.index === index }" @click="seek(PRESENTATION.intro + index * PRESENTATION.solo + 1)">{{ member.name }}</button><button :class="{ active: scene.kind === 'team' }" @click="seek(PRESENTATION.teamStart + 2)"><Icon name="users" :size="14" />Todos juntos</button></div>
    <footer class="presentation-controls"><button class="presentation-play" :aria-label="playing ? 'Pausar presentación' : 'Reproducir presentación'" @click="toggle"><Icon :name="playing ? 'pause' : 'play'" :size="19" /></button><button class="icon-button" aria-label="Reiniciar presentación" @click="time = 0; playing = true"><Icon name="reset" :size="17" /></button><span class="presentation-time">{{ formatTime(time) }} <small>/ 0:30</small></span><input type="range" min="0" :max="PRESENTATION.duration" step="0.01" :value="time" aria-label="Posición de la presentación" @input="event => seek(Number((event.target as HTMLInputElement).value))" /><a class="button primary" :href="`/presentations/${videoStem}.mp4`" :download="`${videoStem}.mp4`"><Icon name="download" :size="16" />Descargar MP4</a></footer>
  </dialog>
</template>

<style scoped>
.presentation-shell { position: fixed; inset: 0; margin: 0; width: 100vw; max-width: none; height: 100dvh; max-height: none; border: 0; background: #edeae3; padding: 15px 30px 20px; display: grid; grid-template-rows: 48px minmax(0, 1fr) 47px 48px; gap: 9px; color: #554e43; }
.presentation-shell:not([open]) { display: none; }
.presentation-shell::backdrop { background: #edeae3; }
.presentation-header, .presentation-header > div, .presentation-controls { display: flex; align-items: center; }
.presentation-header { justify-content: space-between; }
.presentation-header > div { gap: 11px; }
.presentation-header strong { font-size: 12px; font-weight: 600; }
.presentation-header > div > span { border-left: 1px solid #d9d3c7; margin-left: 4px; padding-left: 14px; font-size: 10px; color: #a49a89; }
.presentation-stage { min-height: 0; min-width: 0; display: flex; align-items: center; justify-content: center; background: #faf8f3; border-radius: 12px; box-shadow: 0 8px 35px #3d302314; overflow: hidden; }
.presentation-stage :deep(svg) { display: block; width: 100%; height: 100%; }
.presentation-navigation { display: flex; align-items: center; justify-content: center; gap: 8px; overflow-x: auto; }
.presentation-navigation button { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; padding: 8px 14px; border-radius: 18px; color: #9c9281; white-space: nowrap; }
.presentation-navigation button.active { color: #c76633; background: #fff7eb; }
.presentation-controls { gap: 12px; }
.presentation-play { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #cfc7b9; color: #8c795f; }
.presentation-time { font: 11px monospace; flex: none; color: #8d7e69; }
.presentation-time small { color: #b0a28d; font-size: 10px; }
.presentation-controls input { flex: 1; min-width: 40px; }
@media (max-width: 760px) { .presentation-shell { padding: 8px 12px 15px; grid-template-rows: 46px minmax(0, 1fr) 50px 85px; gap: 4px; } .presentation-header > div > span { display: none; } .presentation-navigation { justify-content: flex-start; } .presentation-navigation button { padding: 8px 11px; } .presentation-controls { flex-wrap: wrap; gap: 9px; } .presentation-controls .button { margin-left: auto; } .presentation-controls input { order: 5; flex-basis: 100%; } .presentation-stage { border-radius: 7px; } }
</style>
