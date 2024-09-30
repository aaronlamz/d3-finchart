export function createTimeScaleData(data, marketConfig) {
  const ftHour = data[0].time.substring(11) // 提取时间部分
  const openTime = new Date(`2024/01/01 ${ftHour}`).getTime() // 动态开盘时间
  const middleTimes = marketConfig.middle.split('/')
  const middleStartTime = new Date(`2024/01/01 ${middleTimes[0]}`).getTime()
  const middleEndTime = new Date(
    `2024/01/01 ${middleTimes[1] || middleTimes[0]}`
  ).getTime()
  const endTime = new Date(`2024/01/01 ${marketConfig.end}`).getTime()

  return {
    openTime,
    middleStartTime,
    middleEndTime,
    endTime,
  }
}
