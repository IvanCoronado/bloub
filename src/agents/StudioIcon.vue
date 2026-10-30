<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  layers: 'm12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',
  film: 'M4 3h16v18H4z M4 8h16 M4 16h16 M8 3v5 M16 3v5 M8 16v5 M16 16v5',
  code: 'm8 7-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
  upload: 'M12 16V4 m-5 5 5-5 5 5 M4 16v5h16v-5',
  check: 'm5 12 4 4L19 6',
  save: 'M4 3h13l4 4v14H3V3z M7 3v7h10V3 M7 21v-7h10v7',
  play: 'm8 4 13 8-13 8z',
  pause: 'M8 4v16 M16 4v16',
  reset: 'M3 10a9 9 0 1 1 2 9 M3 4v6h6',
  headphones: 'M4 14v-3a8 8 0 0 1 16 0v3 M4 12H2v7h4v-7z M20 12h2v7h-4v-7z M18 19c0 3-3 3-6 3',
  megaphone: 'm3 10 16-6v16L3 14z M7 15l2 6h4l-2-5 M22 9v6',
  bowtie: 'm12 12-9-6v12l9-6 9 6V6z',
  glasses: 'M10 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M22 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M10 12h4',
  chef: 'M6 14c-7-1-5-9 0-8 1-6 11-6 12 0 6-1 7 7 0 8v7H6z M6 17h12',
  circle: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  sparkles: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  audio: 'M4 9v6 M8 5v14 M12 2v20 M16 6v12 M20 9v6',
  smile: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M8 14q4 5 8 0 M8 9h.01 M16 9h.01',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8z',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1',
  copy: 'M8 8h13v13H8z M16 8V3H3v13h5',
  close: 'm6 6 12 12 M6 18 18 6',
  trash: 'M3 6h18 M8 6V3h8v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
  book: 'M12 5C9 2 4 2 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-2-2-7-2-10 1z M12 5v15',
  github: 'M9 19c-4 1-4-2-6-2 M9 22v-4c-5-1-6-8-2-10-1-2 0-4 0-4 3 0 4 2 5 2s3-2 6-2c0 0 1 2 0 4 4 2 3 9-2 10v4',
  dotgrid: 'M5 5h.01 M12 5h.01 M19 5h.01 M5 12h.01 M12 12h.01 M19 12h.01 M5 19h.01 M12 19h.01 M19 19h.01',
  users: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M18 3a4 4 0 0 1 0 8 M18 14a4 4 0 0 1 4 4v3',
  cursor: 'm4 3 5 18 3-8 8-3z',
  settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  external: 'M14 3h7v7 M21 3 10 14 M10 3H3v18h18v-7'
}
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] ?? paths.circle" /></svg>
</template>
