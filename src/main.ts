import { createApp } from 'vue'
import { collectionFromSearch } from './agents/collectionStorage'
async function mountApp() {
  if (location.hash === '#original') {
    const [{ default: App }] = await Promise.all([import('./App.vue'), import('./styles.css')])
    createApp(App).mount('#app')
  } else if (new URLSearchParams(location.search).has('presentacion')) {
    const [{ default: Presentation }] = await Promise.all([import('./agents/presentation/AgentPresentation.vue'), import('./agents/studio.css')])
    document.documentElement.lang = 'es'
    document.title = collectionFromSearch(location.search) === 'ingredients' ? 'El equipo de Qamarero · Ingredientes' : 'El equipo de Qamarero · Presentación'
    createApp(Presentation, { collection: collectionFromSearch(location.search) }).mount('#app')
  } else {
    const [{ default: Studio }] = await Promise.all([import('./agents/AgentStudio.vue'), import('./agents/studio.css')])
    document.documentElement.lang = 'es'
    document.title = 'Qamarero · Agent Studio'
    createApp(Studio).mount('#app')
  }
}

void mountApp()
