import { videoInfo } from "../api/bilibili";
import { useSearchStore } from "../store/search";

function parseUrl(text) {
  let bv = ''
  let temp = text
  let index = 3
  let type = ['url', 'only-bv', 'music-name']
  if (temp.includes('http') || temp.includes('https')) {
    index = 0
  } else if (temp.includes('BV')) {
    index = 1
  } else {
    index = 2
  }
  switch (type[index]) {
    case 'url':
      let matchArr = text.match(/(?:\/video\/|bvid=)(BV[0-9a-zA-Z]+)/)
      if (matchArr) {
        bv = matchArr[1]
      }
      break
    case 'only-bv':
      bv = text
      break
  }
  return bv
}

async function getVideoInfo(bv) {
  try {
    let result = await videoInfo(bv)
    if (result.status === 200) {
      let searchStore = useSearchStore()
      let view = result.data.data.View
      searchStore.title = view.title
      searchStore.pic = view.pic
      searchStore.aid = view.aid
      searchStore.cid = view.cid
      searchStore.bvid = bv
      searchStore.author = view.owner.name
      searchStore.duration = view.duration
      return true
    }
    throw new Error('获取视频信息失败')
  } catch (err) {
    return false
  }
}

export { parseUrl, getVideoInfo }
