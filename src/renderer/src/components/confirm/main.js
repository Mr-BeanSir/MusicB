import Confirm from './confirm.vue'
import { h, render } from 'vue'

const div = document.createElement('div')
div.classList.add('dc-confirm')
document.body.appendChild(div)
export default {
  install(app) {
    app.config.globalProperties.$confirm = function (options) {
      return new Promise((resolve, reject) => {
        const confirmCallback = () => {
          render(null, div)
          resolve()
        }
        const cancelCallback = () => {
          render(null, div)
          reject(new Error('点击取消'))
        }
        const vnode = h(Confirm, { ...options, confirmCallback, cancelCallback })
        render(vnode, div)
      })
    }
  }
}
