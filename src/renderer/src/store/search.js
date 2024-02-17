import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    title: '',
    bvid: '',
    cid: '',
    aid: '',
    pic: '',
    author: '',
    duration: 0
  }),
  actions: {}
})
