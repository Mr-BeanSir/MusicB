<template>
  <div class="dialog">
    <slot name="body"></slot>
  </div>
</template>

<script>
export default {
  name: 'DCDialog'
}
</script>

<style scoped lang="less">
.dialog {
  transition: 0.3s ease-in-out;
  opacity: 1;
}
</style>
