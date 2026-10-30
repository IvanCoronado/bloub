<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { AgentConfig, Motion } from './catalog'
import { renderAgentSvg } from './render'

const props = withDefaults(defineProps<{ config: AgentConfig; state?: Motion; time?: number; playing?: boolean; size?: number }>(), { state: 'idle', playing: true, size: 320 })
const uid = useId().replace(/[^a-z0-9-]/gi, '')
const clock = ref(0)
let raf = 0, last = 0
const reduced = ref(false)
let media: MediaQueryList | undefined
const onMotion = () => { reduced.value = media?.matches ?? false }
function tick(now: number) {
  if (last && props.playing && props.time === undefined && !reduced.value) clock.value += Math.min((now - last) / 1000, 0.064)
  last = now
  raf = requestAnimationFrame(tick)
}
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  onMotion()
  media.addEventListener('change', onMotion)
  if (props.time === undefined) raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); media?.removeEventListener('change', onMotion) })
watch(() => props.time, value => {
  if (value === undefined && !raf) raf = requestAnimationFrame(tick)
  if (value !== undefined) { cancelAnimationFrame(raf); raf = 0; last = 0 }
})
const markup = computed(() => renderAgentSvg(props.config, props.time ?? clock.value, props.state, props.size, uid))
</script>

<template>
  <span class="agent-avatar" :style="{ width: `${size}px`, height: `${size}px` }" v-html="markup" />
</template>

<style scoped>
.agent-avatar { display: inline-flex; flex: none; align-items: center; justify-content: center; max-width: 100%; }
.agent-avatar :deep(svg) { width: 100%; height: 100%; overflow: visible; }
</style>
