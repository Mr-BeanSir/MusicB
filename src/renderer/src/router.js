import { createRouter, createWebHashHistory } from 'vue-router'
import home from './views/home/home.vue'
import SongSheet from './views/songSheet/sheet.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: home,
    meta: {
      sideShow: true,
      sideTitle: '首页'
    }
  },
  {
    name: 'songSheet',
    path: '/songSheet',
    component: SongSheet,
    meta: {
      sideShow: true,
      sideTitle: '歌单'
    }
  },
  {
    name: 'set',
    path: '/set',
    component: SongSheet,
    meta: {
      sideShow: true,
      sideTitle: '设置'
    }
  },
  {
    name: 'set',
    path: '/set',
    component: home,
    meta: {
      sideShow: true,
      sideTitle: '设置'
    }
  }
  // { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export { router, routes }
