import { defineStore } from 'pinia'

export const useSongStore = defineStore('song', {
  state: () => ({
    song: [], // 歌曲
    index: 0, // 当前播放歌曲下标
    current: {}, // 当前播放歌曲信息
    start: true, // 是否刚启动
    type: 'paused' // 播放状态
  }),
  actions: {
    setSong(song) {
      this.song = song
      localStorage.setItem('song', JSON.stringify(song))
    },
    setSheet(songs, index) {
      this.song = songs
      this.index = index
      localStorage.setItem('song', JSON.stringify(songs))
      localStorage.setItem('index', JSON.stringify(index))
    },
    setIndex(index) {
      this.index = index
      localStorage.setItem('index', JSON.stringify(index))
    }
  }
})
