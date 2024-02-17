<template>
  <div class="home-class">
    <form class="search" @submit.prevent="onSearch">
      <input
        v-model="inputValue"
        type="text"
        autocomplete="off"
        placeholder="输入歌名/BV/Bilibili视频网址"
      />
      <div class="glass" @click="onSearch">
        <font-awesome-icon class="glass" :icon="['fas', 'magnifying-glass']" />
      </div>
    </form>
    <VideoAction v-if="showVideoAction" />
  </div>
</template>

<script>
import { getVideoInfo, parseUrl } from '../../utils/video'
import { useSearchStore } from '../../store/search'
import VideoAction from './videoAction.vue'

export default {
  name: 'Home',
  components: { VideoAction },
  data() {
    return {
      inputValue: 'https://www.bilibili.com/video/BV1ms411F7m4',
      useSearchStore: useSearchStore(),
      showVideoAction: true
    }
  },
  methods: {
    async onSearch() {
      // 无传值不作操作
      if (!this.inputValue) return
      // 获取BV号
      let bv = parseUrl(this.inputValue)
      // BV号错误，弹出提示
      if (!bv) {
        this.$message({
          title: '失败',
          message: '请输入正确的BV号或者https://www.bilibili.com/video/网址'
        })
      }
      // 获取视频有关信息
      let result = await getVideoInfo(bv)
      if (!result) {
        this.$message({
          title: '失败',
          message: '解析BV号失败'
        })
      }
      // 获取到展示组件
      this.showVideoAction = true
    }
  },
  mounted() {
    this.onSearch()
  }
}
</script>

<style scoped lang="less">
.search {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 43px;
  width: 700px;
  background-color: rgba(235, 216, 169, 0.5);
  height: 30px;
  display: flex;
  align-items: center;
  transition: 0.5s;
  border-radius: 5px;
  overflow: hidden;
  &:focus-within {
    background-color: rgb(235, 216, 169);
  }
  input {
    border: none;
    background-color: transparent;
    width: 670px;
    padding-left: 10px;
    height: 30px;
    &:focus {
      outline: none;
    }
  }
  .glass {
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s;
    &:hover {
      cursor: pointer;
      background-color: rgb(230, 210, 161);
      svg {
        background-color: transparent;
      }
    }
    &:active {
      background-color: rgb(227, 200, 132);
    }
    svg {
      width: 15px;
      color: rgb(222, 174, 63);
    }
  }
}
.home-class {
  background-color: transparent;
  width: 100%;
  height: 100%;
}
</style>
