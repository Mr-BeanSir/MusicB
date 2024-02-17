import requests from "../utils/requests";

export function videoInfo(bv) {
  return requests({
    url: `https://api.bilibili.com/x/web-interface/wbi/view/detail?bvid=${bv}`,
    method: 'get'
  })
}

export function videoPlayInfo(item) {
  return requests({
    url: `https://api.bilibili.com/x/player/wbi/playurl?bvid=${item.bvid}&cid=${item.cid}&fnval=4048`,
    method: 'get'
  })
}
