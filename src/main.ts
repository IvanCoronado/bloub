import { createApp } from 'vue'
async function mountApp() {
  if (location.hash === '#original') {
    const [{ default: App }] = await Promise.all([import('./App.vue'), import('./styles.css')])
    createApp(App).mount('#app')
  } else {
    const [{ default: Studio }] = await Promise.all([import('./agents/AgentStudio.vue'), import('./agents/studio.css')])
    document.documentElement.lang = 'es'
    document.title = 'Qamarero · Agent Studio'
    createApp(Studio).mount('#app')
  }
}

void mountApp()
