<template>
  <div class="mask">
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="message">{{ message }}</div>
      <div class="buttons">
        <div class="cancel" @click="cancelCallback">取消</div>
        <div class="confirm" @click="confirmCallback">确定</div>
      </div>
    </div>
  </div>
</template>

<script>
import DCButton from "../button/button.vue";

export default {
  name: 'DCConfirm',
  components: { DCButton },
  props: {
    title: {
      type: String,
      default: '标题'
    },
    message: {
      type: String,
      default: '内容'
    },
    cancelCallback: {
      type: Function
    },
    confirmCallback: {
      type: Function
    }
  },
  data() {
    return {
      visible: true
    }
  },
}
</script>

<style scoped lang="less">
.content {
  margin-top: -50px;
  width: 300px;
  background-color: #fff;
  border-radius: 4px;
  padding: 13px 20px;
  .title {
    font-size: 18px;
  }
  .message {
    font-size: 14px;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    .confirm,
    .cancel {
      margin-top: 5px;
      cursor: pointer;
    }
    .confirm {
      padding: 2px 8px;
      border-radius: 2px;
      color: white;
      border: 1px solid #637a9f;
      background-color: #637a9f;
    }
    .cancel {
      padding: 2px 8px;
      border-radius: 2px;
      border: 1px solid #637a9f;
      margin-right: 10px;
    }
  }
}
.mask {
  position: fixed;
  top: 0;
  left: 10px;
  border-radius: 20px;
  width: 1060px;
  height: 670px;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
