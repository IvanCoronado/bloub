<script setup lang="ts">
import type { CollectionId } from './catalog'
import Icon from './StudioIcon.vue'
defineProps<{ collection: CollectionId }>()
defineEmits<{ select: [collection: CollectionId] }>()
</script>

<template>
  <div class="collection-bar"><div class="collection-options" role="group" aria-label="Colección de personajes"><span>Colección</span><button :class="{ active: collection === 'classic' }" :aria-pressed="collection === 'classic'" @click="$emit('select', 'classic')"><Icon name="layers" :size="15" />Original</button><button :class="{ active: collection === 'ingredients' }" :aria-pressed="collection === 'ingredients'" @click="$emit('select', 'ingredients')"><Icon name="chef" :size="16" />Ingredientes</button></div><small>Tus cambios se conservan en cada colección.</small></div>
</template>

<style scoped>
.collection-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: -4px 0 20px; }
.collection-options { display: flex; align-items: center; gap: 5px; }
.collection-options > span { font-size: 10px; color: #aaa091; margin-right: 9px; }
.collection-options button { display: flex; align-items: center; gap: 7px; padding: 9px 13px; border: 1px solid #e5dfd5; border-radius: 6px; color: #9b907f; font-size: 11px; background: #fff; }
.collection-options button.active { background: #fff2e6; border-color: #eeb38e; color: #bd6433; }
.collection-bar > small { font-size: 9px; color: #b5a997; }
@media(max-width: 760px) { .collection-bar { margin-top: -5px; } .collection-bar > small { display: none; } .collection-options > span { font-size: 9px; margin-right: 4px; } .collection-options button { padding: 9px 11px; } }
</style>
