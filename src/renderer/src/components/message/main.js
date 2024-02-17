import Message from './message.vue'
import { h, render } from 'vue'

let seek = 1
export default {
  install(app) {
    app.config.globalProperties.$message = function (options) {
      const div = document.createElement('div')
      div.id = `message-${seek++}`
      div.close = () => {
        document.body.removeChild(div)
      }
      document.body.appendChild(div)
      setTimeout(
        () => {
          div.close()
        },
        options.duration ? options.duration : 3000
      )
      let message = h(Message, options)
      render(message, div)
      return div
    }
  }
}
