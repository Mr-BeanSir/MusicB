<template>
  <div class="player">
    <div class="cover">
      <img class="cover-img" :src="song.封面" alt="封面" />
    </div>
    <div class="song-container">
      <div class="song">
        <span class="name">{{ song.标题 }}</span>
        <!--        <span class="author"> - {{ song.author }}</span>-->
      </div>
      <div class="progress">
        <input
          :value="song.当前进度"
          type="range"
          class="back"
          :max="song.歌曲时长"
          @input="onInputChange"
        />
      </div>
      <div class="time">
        <span class="current-time">{{ currentPlayTime }}</span>
        <span class="total-time">{{ SongAllTime }}</span>
      </div>
      <audio
        ref="audio"
        preload="metadata"
        :autoplay="false"
        style="display: none"
        :src="songSrc"
        @loadedmetadata="onLoadedmetadata"
        @play="onPlay"
        @pause="onPause"
        @timeupdate="updateProgress"
      ></audio>
    </div>
  </div>
</template>

<script>
import { playerChannel } from '../utils/broadcastChannel'
import { useSongStore } from '../store/song'
import { parseIntToTime } from '../utils/common'
import { videoPlayInfo } from '../api/bilibili'

export default {
  name: 'Player',
  data() {
    return {
      useSongStore: useSongStore(),
      songSrc: '',
      isAutoPlay: false,
      song: {
        id: 0,
        标题: '',
        bvid: '',
        cid: '',
        aid: '',
        封面: '',
        歌曲时长: 0,
        当前进度: 0,
        开始时间: 0,
        结束时间: 0
      },
      audio: HTMLAudioElement,
      start: true
    }
  },
  computed: {
    currentPlayTime() {
      if (this.song.当前进度 <= 0) {
        return '0:00'
      }
      return parseIntToTime(this.song.当前进度)
    },
    SongAllTime() {
      return parseIntToTime(this.song.歌曲时长)
    }
  },
  mounted() {
    // 如果有之前播放的歌曲就读取并解析
    if (localStorage.getItem('current')) {
      this.song = JSON.parse(localStorage.getItem('current'))
    }
    // 如果歌曲播放链接是空 就自动设置播放链接
    if (this.songSrc === '') {
      this.setAudioSrc()
    }
    // 设置audio变量为ref
    this.audio = this.$refs.audio
    // 如果有歌曲列表记录就读取解析赋值到store
    if (localStorage.getItem('song')) {
      this.useSongStore.song = JSON.parse(localStorage.getItem('song'))
    }
    // 如果有歌曲下标记录就读取解析赋值到store
    if (localStorage.getItem('index')) {
      this.useSongStore.index = JSON.parse(localStorage.getItem('index'))
    }
    // 设置bus的接收函数
    playerChannel().onmessage = this.onMessage
  },
  methods: {
    initSongObj(item) {
      this.song['当前进度'] = 0
      this.song['id'] = item.id
      this.song['aid'] = item.aid
      this.song['bvid'] = item.bvid
      this.song['cid'] = item.cid
      this.song['封面'] = item.封面
      this.song['标题'] = item.歌名 !== null ? item.歌名 : item.标题
      this.song['歌曲时长'] = item.结束时间 - item.开始时间
      this.song['结束时间'] = item.结束时间
      this.song['开始时间'] = item.开始时间
      localStorage.setItem('current', JSON.stringify(this.song))
    },
    async setAudioSrc() {
      let res = (await videoPlayInfo(this.song)).data
      if (res.code === 0) {
        this.songSrc = res.data.dash.audio[0].baseUrl
      } else {
        this.$message({
          title: '错误1',
          message: res.message
        })
      }
    },
    playAction() {
      this.start = false
      this.audio.play()
    },
    pauseAction() {
      this.start = false
      this.audio.pause()
    },
    nextAction() {
      this.start = false
      this.audio.pause()
      // 如果下表超出歌单歌曲数量则下标改为0
      if (this.useSongStore.index + 1 > this.useSongStore.song.length) {
        this.useSongStore.index = 0
      } else {
        this.useSongStore.index += 1
      }
      // 赋值
      const item = this.useSongStore.song[this.useSongStore.index]
      this.initSongObj(item)
      this.setAudioSrc()
    },
    prevAction() {
      this.start = false
      this.audio.pause()
      // 如果下标为0则设置为最后一首歌
      if (this.useSongStore.index !== 0) {
        this.useSongStore.index -= 1
      } else {
        this.useSongStore.index = this.useSongStore.song.length - 1
      }
      // 赋值
      const item = this.useSongStore.song[this.useSongStore.index]
      this.initSongObj(item)
      this.setAudioSrc()
    },
    sheetPlay() {
      this.start = false
      if (this.useSongStore.type === 'playing') {
        this.$refs.audio.pause()
      }
      const item = this.useSongStore.song[this.useSongStore.index]
      this.initSongObj(item)
      this.setAudioSrc()
    },
    onMessage(event) {
      // 处理具体消息
      switch (event.data) {
        case 'play':
          this.playAction()
          break
        case 'pause':
          this.pauseAction()
          break
        case 'next':
          this.nextAction()
          break
        case 'prev':
          this.prevAction()
          break
        case 'sheetPlay':
          this.sheetPlay()
          break
      }
    },
    onLoadedmetadata() {
      this.audio.play()
    },
    onPause() {
      this.useSongStore.type = 'paused'
    },
    onPlay() {
      if (this.start) {
        this.audio.pause()
        return
      }
      this.useSongStore.type = 'playing'
      // 歌曲开始播放，跳出片头 直捣黄龙
      if (this.audio.currentTime === 0) {
        this.audio.currentTime = this.song.开始时间
      }
    },
    updateProgress(v) {
      const time =
        Math.floor(v.target.currentTime) !== 0
          ? Math.floor(v.target.currentTime) - this.song.开始时间
          : 0
      // 如果歌曲播放完毕 则下一首
      if (time >= this.song.歌曲时长 || v.target.currentTime === v.target.duration) {
        this.audio.pause()
        this.song.当前进度 = this.song.歌曲时长
        this.nextAction()
        return
      }
      // 更新store进度，进度条同步绑定 如果刚开始播放则显示0，已经跳转至开头则去除片头
      this.song.当前进度 = time
    },
    onInputChange(v) {
      this.audio.currentTime = parseInt(v.target.value) + this.song.开始时间
    }
  }
}
</script>

<style scoped lang="less">
.audio {
  &::-webkit-media-controls-mute-button,
  &::-webkit-media-controls-play-button,
  &::-webkit-media-controls-current-time-display,
  &::-webkit-media-controls-time-remaining-display,
  &::-webkit-media-controls-volume-slider {
    display: none;
  }
}
.song-container {
  padding: 10px 19px 6px 14px;
  width: 700px;
  height: 95px;
  .song {
    .name,
    .author {
      color: rgba(0, 0, 0, 0.7);
      font-family: Montserrat, sans-serif;
      user-select: none;
    }
    .name {
      font-size: 25px;
      font-weight: 900;
      line-height: 34px;
    }
    .author {
      font-family: Montserrat, sans-serif;
      font-size: 16px;
      font-weight: 900;
    }
  }
  .progress {
    position: relative;
    .circle {
      position: absolute;
      background-color: rgb(99, 122, 159);
      width: 13px;
      height: 13px;
      border-radius: 50%;
      top: -1px;
      &:hover {
        cursor: pointer;
      }
    }
    .back {
      width: 667px;
      height: 10px;
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.4);
      &:hover {
        cursor: pointer;
      }
    }
  }
  .time {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      color: rgba(0, 0, 0, 0.7);
      font-family: Roboto, sans-serif;
      font-size: 17px;
      font-weight: 400;
      line-height: 20px;
      user-select: none;
    }
  }
}
.cover {
  width: 95px;
  height: 95px;
  border-radius: 20px 0 0 20px;
  overflow: hidden;
  .cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }
}
.player {
  position: absolute;
  //background-color: rgba(255, 255, 255, 20%);
  background-color: rgb(255, 245, 217);
  width: 795px;
  height: 95px;
  border-radius: 20px;
  border-top: 1px solid #515c67;
  bottom: 0;
  left: 0;
  display: flex;
}
</style>
