import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import message from './components/message/main'
import confirm from './components/confirm/main'

library.add(fas)

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(message)
app.use(confirm)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
