<template>
  <div class="video-action">
    <div class="video-info">
      <div class="cover">
        <img style="width: 100%" :src="video.pic" alt="封面" />
      </div>
      <div class="info">
        <div class="title">标题：{{ video.title }}</div>
        <div class="author">UP：{{ video.author }}</div>
        <div class="bvid">BVID：{{ video.bvid }}</div>
        <div class="duration">时长：{{ video.duration }} 秒</div>
      </div>
    </div>
    <div class="video-time">
      <div class="form">
        <div class="form-item">
          <span>歌曲开始时间：</span>
          <div class="time-input">
            <div class="dec" @click="song.time.startTime > 0 && (song.time.startTime -= 1)">
              <font-awesome-icon :icon="['fas', 'minus']" />
            </div>
            <input v-model="showStartTime" disabled type="text" />
            <div class="inc" @click="song.time.startTime += 1">
              <font-awesome-icon :icon="['fas', 'plus']" />
            </div>
          </div>
          <div class="time-position">
            <span>空降坐标：</span>
            <input v-model="song.position.start" type="text" />
            <DCButton class="button" text="插入" @click="onPositionClick(0)" />
          </div>
        </div>
        <div class="form-item">
          <span>歌曲结束时间：</span>
          <div class="time-input">
            <div class="dec" @click="song.time.endTime -= 1">
              <font-awesome-icon :icon="['fas', 'minus']" />
            </div>
            <input v-model="showEndTime" disabled type="text" />
            <div
              class="inc"
              @click="song.time.endTime < video.duration && (song.time.endTime += 1)"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
            </div>
          </div>
          <div class="time-position">
            <span>空降坐标：</span>
            <input v-model="song.position.end" type="text" />
            <DCButton class="button" text="插入" @click="onPositionClick(1)" />
          </div>
        </div>
      </div>
      <div class="video-slider">
        <input
          id="start-slider"
          v-model="song.time.startTime"
          type="range"
          min="0"
          :max="song.time.end - 1"
          step="1"
        />
        <input
          id="end-slider"
          v-model="song.time.endTime"
          type="range"
          min="0"
          :max="song.time.end"
          step="1"
        />
      </div>
      <div class="sub-container">
        <div class="song-name">
          <span>歌名：</span>
          <input v-model="songName" type="text" placeholder="歌曲名，留空则为视频标题" />
        </div>
        <div class="submit">
          <span>选择歌单：</span>
          <select v-model="songSheetId">
            <option v-for="item in songSheet" :key="item" :value="item.id">
              {{ item.列表名 }}
            </option>
          </select>
          <DCButton class="button" text="添加" @click="onSubmit" />
        </div>
      </div>
      <div class="rules">
        <div class="rule">
          <input id="share" type="checkbox" name="share" checked disabled />
          <span>分享歌曲记录至服务器</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSearchStore } from '../../store/search'
import DCButton from '../../components/button/button.vue'

export default {
  name: 'VideoAction',
  components: { DCButton },
  data() {
    return {
      useSearchStore: useSearchStore(),
      song: {
        time: {
          // 绑定变量
          startTime: 0,
          endTime: 0,
          // 固定变量
          end: 0
        },
        // 空降坐标绑定
        position: {
          start: '',
          end: ''
        }
      },
      // 歌单列表
      songSheet: [],
      // 要添加到的歌单ID
      songSheetId: 1,
      songName: ''
    }
  },
  computed: {
    video() {
      return {
        pic: this.useSearchStore.pic,
        title: this.useSearchStore.title,
        bvid: this.useSearchStore.bvid,
        author: this.useSearchStore.author,
        duration: this.useSearchStore.duration
      }
    },
    showStartTime() {
      let yu = this.song.time.startTime % 60
      yu = yu < 10 ? '0' + yu : yu
      return Math.floor(this.song.time.startTime / 60) + ':' + yu
    },
    showEndTime() {
      let yu = this.song.time.endTime % 60
      yu = yu < 10 ? '0' + yu : yu
      return Math.floor(this.song.time.endTime / 60) + ':' + yu
    }
  },
  watch: {
    'song.time': {
      handler(v) {
        v.startTime = parseInt(v.startTime)
        v.endTime = parseInt(v.endTime)
        if (v.endTime <= 1) {
          this.song.time.endTime = 1
          return
        }
        if (v.startTime >= v.endTime - 1) {
          this.song.time.startTime = this.song.time.endTime - 1
        }
      },
      deep: true
    },
    'useSearchStore.duration'() {
      this.song.time.endTime = this.useSearchStore.duration
      this.song.time.end = this.useSearchStore.duration
    }
  },
  async mounted() {
    this.song.time.endTime = this.useSearchStore.duration
    this.song.time.end = this.useSearchStore.duration
    try {
      this.songSheet = await window.api.db.allSync('select * from `歌单列表`')
    } catch (err) {
      console.log(err)
    }
  },
  methods: {
    // 空降坐标
    onPositionClick(s) {
      if (s) {
        let urlParams = new URL(this.song.position.end).searchParams
        this.song.time.endTime = Math.floor(parseInt(urlParams.get('t')))
        this.song.position.end = ''
      } else {
        let urlParams = new URL(this.song.position.start).searchParams
        this.song.time.startTime = Math.floor(parseInt(urlParams.get('t')))
        this.song.position.start = ''
      }
    },
    async onSubmit() {
      try {
        let res = await window.api.db.runSync(
          'INSERT INTO "main"."歌曲"("标题", "封面", "时长", "UP主", "bvid", "cid", "aid","开始时间","结束时间", "所属歌单","歌名") VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          [
            this.useSearchStore.title,
            this.useSearchStore.pic,
            this.useSearchStore.duration,
            this.useSearchStore.author,
            this.useSearchStore.bvid,
            this.useSearchStore.cid,
            this.useSearchStore.aid,
            this.song.time.startTime,
            this.song.time.endTime,
            this.songSheetId,
            this.songName
          ]
        )
        if (res) {
          this.$message({
            title: '提示',
            message: '添加歌曲成功'
          })
        }
      } catch (err) {
        this.$message({
          title: '提示',
          message: '添加歌曲失败'
        })
        console.log(err)
      }
    }
  }
}
</script>

<style scoped lang="less">
.video-time {
  margin-top: 10px;
  .video-slider {
    position: relative;
    width: 100%;
    height: 20px;
    margin-top: 3px;
    z-index: 2;
    #end-slider,
    #start-slider {
      position: absolute;
      background: transparent;
      width: 100%;
      // 能穿透点击下层元素
      pointer-events: none;
      // 去除原生样式
      -webkit-appearance: none;
      &::-webkit-slider-thumb {
        // 使进度条的按钮能够点击不会穿透
        pointer-events: all;
      }
    }
    ::after {
      content: '';
      height: 2px;
      width: 98%;
      position: absolute;
      top: 7px;
      left: 7px;
      background: #515c67;
      z-index: -1;
    }
  }
  .sub-container {
    display: flex;
    justify-content: space-around;
    //flex-direction: column;
    .song-name {
      display: flex;
      input {
        min-width: 100px;
        min-height: 28px;
      }
    }
    .submit {
      display: flex;
      justify-content: center;
      align-items: center;
      select {
        min-width: 100px;
        min-height: 28px;
      }
      .button {
        height: 28px;
        margin-left: 10px;
      }
    }
  }
  .rules {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 5px;
  }
}
.form {
  display: flex;
  flex-direction: column;
  .time-position {
    display: flex;
    margin-left: 20px;
    .button {
      margin-left: 10px;
      height: 23px;
      width: 70px;
      font-size: 13px;
    }
  }
  .form-item {
    display: flex;
    &:last-child {
      margin-top: 10px;
      margin-bottom: 5px;
    }
  }
  .time-input {
    position: relative;
    display: flex;
    border: rgb(220, 223, 230) 1px solid;
    border-radius: 5px;
    &:hover {
      border: #637a9f solid 1px;
    }
    .dec,
    .inc {
      width: 23px;
      background-color: rgb(245, 247, 250);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      svg {
        font-size: 12px;
        color: rgb(96, 98, 102);
      }
    }
    .dec {
      border-right: rgb(220, 223, 230) 1px solid;
      border-top-left-radius: 4.5px;
      border-bottom-left-radius: 4.5px;
      &:hover {
        svg {
          color: #87a4d1;
        }
      }
    }
    .inc {
      border-left: rgb(220, 223, 230) 1px solid;
      border-top-right-radius: 4.5px;
      border-bottom-right-radius: 4.5px;
      &:hover {
        svg {
          color: #87a4d1;
        }
      }
    }
    input {
      width: 120px;
      border: none;
      outline: none;
      padding: 0 8px;
      font-size: 16px;
      -webkit-appearance: none;
      &:disabled {
        background-color: white;
        color: rgb(170, 170, 170);
      }
    }
  }
}
.video-info {
  display: flex;
  justify-content: space-between;
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
      font-size: 20px;
      font-weight: bolder;
    }
  }
  .cover {
    width: 45%;
    height: 210px;
    border-radius: 15px;
    overflow: hidden;
    object-fit: contain;
  }
}
.video-action {
  padding: 0 20px;
}
</style>
