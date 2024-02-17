<template>
  <div class="dc-button">{{ text }}</div>
</template>

<script>
export default {
  name: 'DCButton',
  props: {
    text: String
  }
}
</script>

<style scoped lang="less">
.dc-button {
  user-select: none;
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
</style>
