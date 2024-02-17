<template>
  <div class="sheet" @click="sheetMenu.showMenu = false">
    <div class="sheet-view">
      <table class="table-head">
        <tr>
          <th style="width: 45px">#</th>
          <th style="width: 254px; text-align: left">标题</th>
          <th style="width: 150px; text-align: left">UP</th>
          <th style="text-align: left; width: 130px">BV</th>
          <th style="width: 60px; text-align: center">时长</th>
        </tr>
      </table>
      <div ref="tableBodyRef" class="table-body" @scroll="onScroll">
        <div class="items">
          <div
            v-for="(item, index) in visibleEle"
            :key="item.id"
            class="table-item"
            @dblclick="onPlay(index)"
          >
            <div class="table-td" style="width: 50px; text-align: center">{{ item.id }}</div>
            <div class="table-td" style="width: 253px; padding-right: 6px">
              {{ item.歌名 !== null ? item.歌名 : item.标题 }}
            </div>
            <div class="table-td" style="width: 151px; padding-right: 6px">{{ item.UP主 }}</div>
            <div class="table-td" style="width: 129px">{{ item.bvid }}</div>
            <div class="table-td" style="width: 60px; text-align: center">
              {{ computedSongDuration(item.开始时间, item.结束时间) }}
            </div>
          </div>
        </div>
        <div :style="{ height: songs.length * 37 + 'px' }" />
      </div>
    </div>
    <div class="sheet-side">
      <div
        class="side-item add-sheet"
        @click="addSheet.show = true;$refs.addSheetInputRef.focus()"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        创建歌单
      </div>
      <div
        v-for="item in useSheetStore.sheets"
        :key="item.id"
        :class="['side-item', useSheetStore.activeSheetID === item.id ? 'active-sheet' : '']"
        @click.left="onSheetListClick(item.id)"
        @click.right="onShowSheetMenu(item.id, $event)"
      >
        <input @click.stop disabled class="already-sheet" type="text" :value="item.列表名" />
      </div>
      <div :style="{ marginLeft: addSheet.show ? '0px' : '-150px' }" class="add-sheet-container">
        <input
          ref="addSheetInputRef"
          v-model="addSheet.name"
          type="text"
          @keydown.enter="onAddSheetBlur"
          @blur="onAddSheetBlur"
        />
      </div>
    </div>
    <div ref="sheetMenuRef" :style="{ display: sheetMenu.showMenu ? 'block' : 'none' }" class="sheet-menu">
      <div class="sheet-menu-item" @click="onSheetMenuClick('rename')">重命名</div>
      <div class="sheet-menu-item" @click="onSheetMenuClick('delete')">删除</div>
    </div>
  </div>
</template>

<script>
import { useSongStore } from '../../store/song'
import { playerChannel } from '../../utils/broadcastChannel'
import { useSheetStore } from '../../store/sheet'

export default {
  name: 'SongSheet',
  data() {
    return {
      useSongStore: useSongStore(),
      useSheetStore: useSheetStore(),
      // 歌曲列表
      songs: [],
      // 虚拟列表中显示的歌曲
      visibleEle: [],
      // 添加歌单变量
      addSheet: {
        show: false,
        name: ''
      },
      sheetMenu: {
        // 展示歌单列表右键菜单
        showMenu: false,
        // 右键选择的歌单列表ID
        activateSheetID: -1,
        // 选择的元素
        el: null
      }
    }
  },
  async mounted() {
    // 初始化歌单列表
    if (this.useSheetStore.sheets.length === 0) {
      this.reloadSheet()
    }
    // 初始化歌曲列表
    this.reloadSongs()
  },
  methods: {
    async onRenameSheet() {
      try {
        const el = this.sheetMenu.el.target
        await window.api.db.runSync('update `歌单列表` set `列表名` = ? where `id` = ?', [
          el.querySelector('input').value,
          this.sheetMenu.activateSheetID
        ])
        this.reloadSheet()
        el.classList.remove('edit-item')
        el.querySelector('input').disabled = true
        el.querySelector('input').style.pointerEvents = 'none'
        this.$message({
          title: '成功',
          message: '歌单重命名成功！'
        })
      } catch (e) {
        this.$message({
          title: '错误',
          message: '歌单重命名失败！' + e.toString()
        })
      }
    },
    // 右键菜单被点击
    onSheetMenuClick(type) {
      if (this.sheetMenu.activateSheetID === -1) {
        return
      }
      let el
      switch (type) {
        case 'delete':
          this.sheetMenu.showMenu = false
          this.$confirm({
            title: '删除歌单',
            message: '确定要删除该歌单吗？'
          }).then(async () => {
            try {
              await window.api.db.runSync('delete from `歌单列表` where `id` = ?', [
                this.sheetMenu.activateSheetID
              ])
              this.reloadSheet()
              if (this.sheetMenu.activateSheetID === this.useSheetStore.activeSheetID) {
                this.useSheetStore.activeSheetID = 1
                this.reloadSongs()
              }
              this.$message({
                title: '成功',
                message: '歌单删除成功！'
              })
            } catch (e) {
              this.$message({
                title: '错误',
                message: '歌单删除失败！'
              })
            }
          })
          break
        case 'rename':
          this.sheetMenu.showMenu = false
          el = this.sheetMenu.el.target
          el.classList.add('edit-item')
          el.querySelector('input').disabled = false
          el.querySelector('input').style.pointerEvents = 'auto'
          el.querySelector('input').focus()
          el.querySelector('input').addEventListener('blur', this.onRenameSheet)
          el.querySelector('input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              this.onRenameSheet()
            }
          })
          break
      }
    },
    // 歌单列表被点击 设置歌曲列表
    onSheetListClick(activeSheetID) {
      this.useSheetStore.activeSheetID = activeSheetID
      this.reloadSongs()
    },
    // 显示歌单列表右键菜单
    onShowSheetMenu(itemId, event) {
      if (itemId !== 1) {
        this.sheetMenu.showMenu = true
        this.sheetMenu.el = event
        this.sheetMenu.activateSheetID = itemId
        this.$refs.sheetMenuRef.style.top = event.clientY + 'px'
        this.$nextTick(() => {
          this.$refs.sheetMenuRef.style.left = event.clientX - 77 + 'px'
        })
      }
    },
    // 添加歌单失去焦点操作
    async onAddSheetBlur() {
      if (!this.addSheet.show || this.addSheet.name === '') {
        this.addSheet.show = false
        return
      }
      try {
        await window.api.db.runSync('insert into `歌单列表`(`列表名`) values (?)', [
          this.addSheet.name
        ])
        this.reloadSheet()
        this.addSheet.name = ''
        this.addSheet.show = false
      } catch (e) {
        this.$message({
          title: '创建歌单失败',
          message: e.toString()
        })
      }
    },
    // 点击歌曲列表
    onPlay(index) {
      // 如果从歌单列表播放就重新设置store和歌曲下标
      this.useSongStore.setSheet(this.songs, index)
      const channel = playerChannel()
      // 发送信息告知是从歌曲列表播放
      channel.postMessage('sheetPlay')
      channel.close()
    },
    // 鼠标滚动自动设置虚拟的歌曲列表显示定位
    onScroll() {
      let content = this.$refs.tableBodyRef
      let startIndex = Math.floor(content.scrollTop / 37)
      let endIndex = startIndex + Math.ceil(542 / 37) + 2
      this.visibleEle = this.songs.slice(startIndex, endIndex)
      let el = this.$el.querySelector('.items')
      el.style.top = `${startIndex * 37}px`
    },
    // 重载歌曲列表
    async reloadSongs() {
      this.songs = await window.api.db.allSync('select * from `歌曲` where `所属歌单` = ?', [
        this.useSheetStore.activeSheetID
      ])
      this.onScroll()
    },
    // 重载歌单列表
    async reloadSheet() {
      this.useSheetStore.sheets = await window.api.db.allSync('select * from `歌单列表`')
    },
    // 计算歌曲时间
    computedSongDuration(start, end) {
      const 时间差 = end - start
      return (
        Math.floor(时间差 / 60) +
        ':' +
        (Math.floor(时间差 % 60) < 10 ? '0' + Math.floor(时间差 % 60) : Math.floor(时间差 % 60))
      )
    }
  }
}
</script>

<style scoped lang="less">
.edit-item {
  background-color: rgba(242, 203, 114, 0.7);

}
.sheet-menu {
  .sheet-menu-item {
    font-size: 14px;
    text-align: center;
    padding: 5px 13px;
    &:hover {
      background-color: rgb(206, 215, 227);
      cursor: pointer;
    }
  }
  position: absolute;
  top: 0;
  left: 0;
  display: none;
  overflow: hidden;
  border-radius: 5px;
  white-space: nowrap;
  background-color: rgb(181, 192, 208);
}
.add-sheet-container {
  background-color: rgba(242, 203, 114, 0.7);
  width: 100%;
  height: 32px;
  margin-left: -150px;
  transition: 0.3s ease-in-out;
  input {
    text-align: center;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    padding: 5px;
    font-size: 14px;
  }
}
.sheet-view {
  .table-body {
    position: relative;
    width: 100%;
    height: 542px;
    overflow-y: auto;
    overflow-x: hidden;
    .items {
      position: absolute;
      top: 0;
      left: 0;
    }
    .table-item {
      height: 37px;
      display: flex;
      align-items: center;
      &:hover {
        background-color: rgb(254, 239, 189);
      }
      .table-td {
        font-size: 13px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #637a9f;
      border-radius: 3px;
    }
  }
  .table-head {
    width: 100%;
    height: 32px;
    border-bottom: 1px solid #637a9f;
  }
  flex: 1;
}
.sheet-side {
  .side-item {
    .already-sheet {
      text-align: center;
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      padding: 8px 5px 5px;
      pointer-events: none;
      background-color: transparent;
    }
    input {
      color: black;
    }
    &.add-sheet {
      padding: 8px 5px 5px;
      border-top-right-radius: 20px;
      svg {
        font-size: 13px;
        margin-right: 2px;
      }
    }
    &.active-sheet {
      background-color: rgb(254, 239, 189);
      &:hover {
        cursor: default;
      }
    }
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    &:hover {
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.41);
    }
  }
  width: 150px;
  height: 576px;
  border-left: #637a9f 2px solid;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #637a9f;
    border-radius: 3px;
  }
}
.sheet {
  height: 100%;
  display: flex;
  position: relative;
}
</style>
