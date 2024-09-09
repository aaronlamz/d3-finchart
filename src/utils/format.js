// 将长时间戳 (如 latestTime: 20240909093000000) 转换为 JavaScript Date 对象
export function formatLatestTime(latestTime) {
  // 将时间戳转换为字符串
  const timeStr = latestTime.toString()

  // 提取各个部分
  const year = parseInt(timeStr.slice(0, 4), 10)
  const month = parseInt(timeStr.slice(4, 6), 10) - 1 // 月份是0索引的
  const day = parseInt(timeStr.slice(6, 8), 10)
  const hour = parseInt(timeStr.slice(8, 10), 10)
  const minute = parseInt(timeStr.slice(10, 12), 10)
  const second = parseInt(timeStr.slice(12, 14), 10)

  // 如果有毫秒部分，可以提取毫秒
  const millisecond =
    timeStr.length > 14 ? parseInt(timeStr.slice(14, 17), 10) : 0
  return new Date(year, month, day, hour, minute, second, millisecond)
}
