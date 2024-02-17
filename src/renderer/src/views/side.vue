<template>
  <div class="side-class">
    <div class="side-drag">
      <div class="system-action">
        <div class="system-minimize" @click="onMinimize">
          <font-awesome-icon :icon="['fas', 'window-minimize']" />
        </div>
        <div class="system-close" @click="onClose">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </div>
      </div>
      <div class="user-info">
        <div class="avatar-div">
          <img class="avatar-img" src="../assets/avatar.jpg" alt="avatar" @click.prevent />
        </div>
        <span>{{ user.name }}</span>
      </div>
      <div class="func-list">
        <div
          v-for="item in route"
          :key="item.path"
          class="func-button"
          @click="onRouteBtnClick(item)"
        >
          {{ item.meta.sideTitle }}
        </div>
      </div>
      <div class="play-action">
        <div class="play" @click="onClick('play')">
          <font-awesome-icon v-if="useSongStore.type === 'paused'" :icon="['fas', 'play']" />
          <font-awesome-icon v-if="useSongStore.type === 'playing'" :icon="['fas', 'pause']" />
        </div>
        <div class="next" @click="onClick('next')">
          <font-awesome-icon :icon="['fas', 'forward-step']" />
        </div>
        <div class="prev" @click="onClick('prev')">
          <font-awesome-icon :icon="['fas', 'backward-step']" />
        </div>
        <div class="repeat">
          <font-awesome-icon :icon="['fas', 'repeat']" />
        </div>
        <div class="volume">
          <font-awesome-icon :icon="['fas', 'volume-high']" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { routes } from '../router'
import { useSongStore } from '../store/song'
import { playerChannel } from '../utils/broadcastChannel'

export default {
  name: 'Side',
  data() {
    return {
      user: {
        name: '游客'
      },
      useSongStore: useSongStore(),
      route: routes.filter((item) => item.meta?.sideShow)
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    onClick(v) {
      const channel = playerChannel()
      if (v === 'play') {
        if (this.useSongStore.type === 'playing') {
          channel.postMessage('pause')
        } else {
          channel.postMessage('play')
        }
      } else {
        channel.postMessage(v)
      }
      channel.close()
    },
    onRouteBtnClick(item) {
      this.$router.push(item.path)
    },
    init() {},
    onMinimize() {
      window.electron.ipcRenderer.send('window-minimize')
    },
    onClose() {
      window.electron.ipcRenderer.send('window-close')
    }
  }
}
</script>

<style scoped lang="less">
.side-drag {
  position: absolute;
  top: 0;
  left: 36px;
  right: 0;
  bottom: 0;
  -webkit-app-region: drag;
}
.system-action,
.func-button,
.avatar-div,
.play-action {
  -webkit-app-region: no-drag;
}
.func-list {
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .func-button {
    user-select: none;
    margin-top: 17px;
    width: 100px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
    background: radial-gradient(
      97.58% 141.42% at 0% 0%,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.4)
    );
    transition: 0.3s;
    &:hover {
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.4);
    }
    &:active {
      box-shadow:
        -2px -2px 5px 0px rgba(98, 98, 98, 0.4) inset,
        2px 0px 5px 0px rgba(98, 98, 98, 0.4) inset;
    }
  }
}
.play-action {
  .play,
  .volume,
  .prev,
  .next,
  .repeat {
    position: absolute;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
    background: radial-gradient(
      97.58% 141.42% at 0% 0%,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.4)
    );
    transition: 0.3s;
    &:hover {
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.4);
    }
    &:active {
      box-shadow:
        -2px -2px 5px 0px rgba(98, 98, 98, 0.4) inset,
        2px 0px 5px 0px rgba(98, 98, 98, 0.4) inset;
    }
  }
  .play {
    width: 93px;
    height: 93px;
    right: 50%;
    bottom: 0;
    transform: translateX(+50%);
    svg {
      width: 50px;
      height: 50px;
    }
  }
  .prev,
  .next {
    width: 60px;
    height: 60px;
    bottom: 0;
    svg {
      width: 40px;
      height: 40px;
    }
  }
  .prev {
    left: 0;
  }
  .next {
    right: 0;
  }
  .volume,
  .repeat {
    width: 35px;
    height: 35px;
    top: 0;
    svg {
      width: 25px;
      height: 25px;
    }
  }
  .volume {
    right: 37px;
  }
  .repeat {
    left: 37px;
  }
  /* 播放控件 */
  position: absolute;
  width: 244px;
  height: 93px;
  right: 10px;
  bottom: 12px;
}
.system-action {
  position: absolute;
  width: 92px;
  height: 35px;
  right: 0;
  top: 0;
  border-radius: 0 20px 0 20px;
  background: rgba(255, 255, 255, 0.44);
  display: flex;
  .system-minimize {
    margin-top: -10px;
    font-size: 13px;
  }
  .system-close,
  .system-minimize {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    transition: background-color 0.5s;
    &:hover {
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.44);
    }
  }
  .system-close {
    border-radius: 0 20px 0 0;
  }
  .system-minimize {
    border-radius: 0 0 0 20px;
  }
}
.side-class {
  width: 300px;
  height: 670px;
  position: absolute;
  right: 0;
  top: 0;
  background-color: #637a9f;
  border-radius: 20px;
  box-shadow: 5px 5px 6px rgb(0 0 0 / 40%);
  padding-left: 40px;
  .user-info {
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 42px;
    span {
      color: #fdf7e4;
      font-size: 1rem;
    }
    .avatar-div {
      margin-bottom: 3px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.93);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      .avatar-img {
        width: 64px;
      }
    }
  }
}
</style>
