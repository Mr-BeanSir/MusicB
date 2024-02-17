<template>
  <div ref="master" class="master">
    <div class="main-view-class">
      <RouterView ref="view" style="padding-bottom: 95px"></RouterView>
      <Player />
    </div>
    <Side />
  </div>
</template>

<script>
import Side from './views/side.vue'
import Player from './views/player.vue'
import { useSheetStore } from './store/sheet'

export default {
  components: { Player, Side },
  data() {
    return {
      useSheetStore: useSheetStore()
    }
  },
  methods: {}
}
</script>

<style lang="less">
.master {
  position: relative;
  width: 1060px;
  height: 670px;
  .main-view-class {
    position: absolute;
    z-index: 1;
    -webkit-app-region: no-drag;
    width: 795px !important;
    height: 670px !important;
    border-radius: 20px;
    background-color: #fff3cf;
    //overflow-y: hidden;
    box-shadow:
      4px 0 10px #00000054,
      0 4px 10px rgba(0, 0, 0, 0.4);
  }
}
</style>
