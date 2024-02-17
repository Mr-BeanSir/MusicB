<template>
  <div class="message-container" :style="{ backgroundColor: bgColor }">
    <div class="title">{{ title }}</div>
    <div class="message">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    duration: {
      type: Number,
      default: 3000
    },
    title: {
      type: String,
      default: '标题'
    },
    message: {
      type: String,
      default: '消息'
    },
    bgColor: {
      type: String,
      default: '#515c67'
    }
  },
  mounted() {}
}
</script>

<style scoped lang="less">
.message-container {
  .title {
    font-size: 20px;
    color: #fff;
  }
  .message {
    color: white;
  }
  position: absolute;
  z-index: 999;
  left: 20px;
  top: 10px;
  padding: 3px 13px 0;
  min-width: 120px;
  min-height: 70px;
  margin-right: 10px;
  border-radius: 20px;
}
</style>
