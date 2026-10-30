<script setup lang="ts">
import { computed } from 'vue'
import AgentAvatar from './AgentAvatar.vue'
import { CLASSIC_SHAPES, INGREDIENT_SHAPES, MOODS, PRESETS, presetsFor, type AgentConfig, type CollectionId } from './catalog'

const props = defineProps<{ config: AgentConfig; collection: CollectionId }>()
const emit = defineEmits<{ patch: [update: Partial<AgentConfig>]; expression: [expression: AgentConfig['expression']] }>()
const shapes = computed(() => (props.collection === 'ingredients' ? INGREDIENT_SHAPES : CLASSIC_SHAPES).map(shape => ({
  ...shape,
  preview: { ...presetsFor(props.collection).find(agent => agent.shape === shape.id)!, accessories: [], depth: 0, shadow: false, intensity: 0 }
})))
const expressions = MOODS.map(mood => ({ ...mood, preview: { ...PRESETS[0]!, expression: mood.id, accessories: [], depth: 0, shadow: false, intensity: 0 } }))
const palette = [
  { color: '#111112', label: 'Negro' }, { color: '#8c5f3d', label: 'Marrón' },
  { color: '#ed4540', label: 'Rojo' }, { color: '#ff5d22', label: 'Naranja' },
  { color: '#efb923', label: 'Amarillo' }, { color: '#37ca8b', label: 'Verde' },
  { color: '#28b9a2', label: 'Turquesa' }, { color: '#398fe8', label: 'Azul' },
  { color: '#8c57ed', label: 'Violeta' }, { color: '#da4cb1', label: 'Rosa' },
  { color: '#a6a6a5', label: 'Gris' }, { color: '#f1efe9', label: 'Crema' }
]
const colors = computed(() => props.collection === 'ingredients' ? [
  { color: '#19262e', label: 'Negro' }, { color: '#efa53a', label: 'Croqueta' },
  { color: '#ff6036', label: 'Gamba' }, { color: '#fff4dc', label: 'Ajo' },
  { color: '#ffd138', label: 'Limón' }, { color: '#ff5135', label: 'Tomate' },
  ...palette.slice(6)
] : palette)
</script>

<template>
  <section class="choice-section" aria-labelledby="shape-heading">
    <h2 id="shape-heading">Forma</h2>
    <div class="visual-options" role="group" aria-label="Forma">
      <button v-for="shape in shapes" :key="shape.id" class="visual-option" :class="{ selected: config.shape === shape.id }" :aria-label="`Forma: ${shape.label}`" :aria-pressed="config.shape === shape.id" @click="emit('patch', { shape: shape.id })">
        <span class="option-illustration" aria-hidden="true"><AgentAvatar :config="shape.preview" :size="102" :time="0.6" /></span>
        <span>{{ shape.label }}</span>
      </button>
    </div>
  </section>
  <section class="choice-section" aria-labelledby="expression-heading">
    <h2 id="expression-heading">Expresión</h2>
    <div class="visual-options expressions" role="group" aria-label="Expresión">
      <button v-for="mood in expressions" :key="mood.id" class="visual-option" :class="{ selected: config.expression === mood.id }" :aria-label="`Expresión: ${mood.label}`" :aria-pressed="config.expression === mood.id" @click="emit('expression', mood.id)">
        <span class="option-illustration" aria-hidden="true"><AgentAvatar :config="mood.preview" :size="102" :time="0.6" /></span>
        <span>{{ mood.label }}</span>
      </button>
    </div>
  </section>
  <section class="choice-section" aria-labelledby="color-heading">
    <div class="section-heading"><h2 id="color-heading">Color</h2><label class="custom-color">Personalizado<input type="color" :value="config.bodyColor" aria-label="Color personalizado del cuerpo" @input="event => emit('patch', { bodyColor: (event.target as HTMLInputElement).value })" /></label></div>
    <div class="color-options" role="group" aria-label="Color del cuerpo">
      <button v-for="item in colors" :key="item.color" :aria-label="`Color: ${item.label}`" :aria-pressed="config.bodyColor.toLowerCase() === item.color.toLowerCase()" :title="item.label" :class="{ selected: config.bodyColor.toLowerCase() === item.color.toLowerCase() }" @click="emit('patch', { bodyColor: item.color })"><span :style="{ background: item.color }" /></button>
    </div>
  </section>
</template>
