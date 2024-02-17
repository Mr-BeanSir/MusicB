import { defineStore } from 'pinia'

export const useSheetStore = defineStore('sheet', {
  state: () => {
    return {
      activeSheetID: 1, // 选中的歌单下标
      sheets: [] //
    }
  },
  actions: {}
})
