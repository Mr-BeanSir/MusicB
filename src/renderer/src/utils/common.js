export function parseIntToTime(int) {
  return Math.floor(int / 60) + ':' + (int % 60 < 10 ? '0' + (int % 60) : int % 60)
}
