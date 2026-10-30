<script setup lang="ts">
import type { CollectionId } from './catalog'
defineProps<{ collection: CollectionId }>()
defineEmits<{ select: [collection: CollectionId] }>()
</script>

<template>
  <div class="collection-options" role="group" aria-label="Colección de personajes"><button :class="{ active: collection === 'classic' }" :aria-pressed="collection === 'classic'" @click="$emit('select', 'classic')">Original</button><button :class="{ active: collection === 'ingredients' }" :aria-pressed="collection === 'ingredients'" @click="$emit('select', 'ingredients')">Ingredientes</button></div>
</template>

<style scoped>
.collection-options { display: inline-flex; gap: 4px; padding: 4px; border-radius: 30px; background: #ececf0; }
.collection-options button { padding: 10px 17px; min-height: 40px; border-radius: 24px; font-size: 13px; color: #757987; }
.collection-options button.active { background: #fff; color: #1b243a; box-shadow: 0 1px 4px #1820340c; }
@media(max-width: 600px) { .collection-options button { padding: 8px 13px; } }
</style>
