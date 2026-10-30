# Qamarero Agent Studio

Estudio en español para componer los cinco personajes de la referencia: QPhone (cápsula y auriculares), Marketing (triángulo y megáfono), Equipo (nube y pajarita), Carta (óvalo y gafas) y Compras (cuadrado y gorro de chef).

## Uso

Ejecuta `pnpm install` y `pnpm dev`, y abre `http://localhost:5190`. Elige un agente, ajusta su apariencia y combina accesorios. «Crear un agente» duplica el seleccionado. «Guardar» conserva el proyecto en este navegador; «Descargar proyecto JSON» crea una copia portable e importable. No hay sincronización entre dispositivos ni backend.

En Animaciones puedes seleccionar reposo, escucha, pensamiento, conversación, celebración o trabajo, ajustar velocidad e intensidad y añadir estados a una secuencia. Las escenas admiten duración de 0,5–10 segundos, orden y borrado. El reproductor permite pausar, reiniciar y buscar un instante. La preferencia de movimiento reducido pausa la reproducción inicial; el usuario puede iniciarla manualmente.

La profundidad ajusta el sombreado del cuerpo. Las formas siguen siendo SVG 2D. Estos agentes son personajes visuales; la aplicación consumidora conecta los estados a herramientas, conversaciones y eventos del producto.

## Componente Vue

```vue
<script setup lang="ts">
import AgentAvatar from './agents/AgentAvatar.vue'
import { PRESETS, type Motion } from './agents/catalog'
import { ref } from 'vue'

const state = ref<Motion>('listening')
</script>

<template>
  <AgentAvatar :config="PRESETS[0]!" :state="state" :size="160" />
</template>
```

Props: `config: AgentConfig`, `state: Motion`, `size`, `playing` y `time`. Con `time`, el padre controla cada fotograma. Sin `time`, el componente usa su propio reloj. Para composiciones personalizadas, exporta el JSON, valídalo con `parseProject` y pasa el agente al componente. El ejemplo de la pestaña Integración importa ese JSON para conservar las ediciones.

Para otro repositorio Vue, copia `AgentAvatar.vue`, `catalog.ts`, `render.ts` y la carpeta `src/bot/`; configura `@` para apuntar a `src`. Los SVG exportados se pueden usar directamente como imágenes, sin copiar código del motor.

```ts
import { parseProject } from './agents/catalog'
import { renderAgentSvg } from './agents/render'
import { renderAnimatedSvg } from './agents/export'

const project = parseProject(JSON.parse(json))
const svg = renderAgentSvg(project.agents[0]!, 1.2, 'listening')
const animated = renderAnimatedSvg(project.agents[0]!, 'speaking')
```

## Exportaciones

- SVG / PNG: fotograma actual, con opción de transparencia.
- SVG animado: bucle de cuatro segundos del estado seleccionado, interpolación con CSS y SMIL, sin JavaScript ni Vue en el archivo exportado. Fondo transparente.
- GIF: estado o secuencia completa, con los límites de color y alfa del formato. Las secuencias que superarían 128 MiB de fotogramas indexados piden reducir resolución o usar MP4.
- MP4: estado o secuencia completa, fondo opaco obligatorio y codificador AVC/WebCodecs disponible en el navegador. `mediabunny` se importa solamente al exportar vídeo.
- JSON versión 1: todos los agentes y escenas. Máximo 30 agentes, 24 escenas y archivo de importación de 1 MB.

Los archivos de `public/agents/` se pueden servir directamente: `<img src="/agents/qphone-animated.svg" width="160" alt="QPhone" />`. El movimiento por CSS responde a `prefers-reduced-motion`. Para eliminar también parpadeos y respiración, muestra el SVG fijo cuando coincida esa preferencia. `team.svg` contiene una lámina del equipo completo.

El SVG animado conserva el estado seleccionado; para varios estados usa GIF o MP4. Durante GIF/MP4 se muestra el avance y se puede cancelar. Las exportaciones utilizan el mismo renderer que la vista previa.

## Arquitectura y compatibilidad

`catalog.ts` contiene tipos, presets y validación. `render.ts` utiliza `BotEngine` para siluetas, expresiones, mirada y parpadeos, con perfiles radiales propios y capas SVG de accesorios. Cada muestra depende de configuración, estado y tiempo. `export.ts` comparte ese render para imágenes, SVG animados y vídeo. `useStudio.ts` gestiona proyecto, almacenamiento y transporte; `AgentAvatar.vue` es el componente reutilizable.

El editor original permanece en `/#original`: recarga la página si ya estabas en el estudio, porque la selección se hace al arrancar. Sus constantes medidas y pruebas no se han modificado. Se conservan la licencia MIT y los créditos de Jérémy Perret.

`pnpm test` ejecuta las pruebas originales y las de validación, límites de secuencia, combinaciones, determinismo, escape de texto y SVG animado. `pnpm build` comprueba tipos y genera producción. `pnpm generate:agents` reconstruye los archivos de `public/agents/`.
