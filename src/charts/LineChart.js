import * as d3 from 'd3'
import { renderGridLines } from '../components/GridLines'

class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      data: config.data || [],
      market: config.market || 'hk', // 默认市场为香港
    }
    this.initChart()
  }

  initChart() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    // 增加左右 padding 以防止 X 轴文案被遮住
    this.xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([50, this.config.width - 50])
    this.yScale = d3.scaleLinear().range([this.config.height - 50, 50])

    // 确保数据格式正确，尤其是 timestamp 是有效的日期
    this.line = d3
      .line()
      .x((d) => this.getXScale(d.timestamp)) // 使用自定义比例尺函数
      .y((d) => this.yScale(d.price))

    this.area = d3
      .area()
      .x((d) => this.getXScale(d.timestamp)) // 使用自定义比例尺函数
      .y0(this.config.height - 50) // 底部位置
      .y1((d) => this.yScale(d.price)) // 价格对应的高度

    this.addGradient() // 添加渐变效果
    this.render()
  }

  // 定义 addGradient 方法，用于添加渐变色定义
  addGradient() {
    const defs = this.svg.append('defs')

    const gradient = defs
      .append('linearGradient')
      .attr('id', 'price-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%') // 垂直渐变

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0.6) // 顶部颜色不透明

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0) // 底部完全透明
  }

  // 自定义 X 轴比例尺，用于处理午休时间合并
  getXScale(timestamp) {
    function timeToMilliseconds(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return (hours * 60 * 60 + minutes * 60) * 1000 // 转换为毫秒数
    }

    const openTime = timeToMilliseconds('09:30') // 开盘时间的毫秒数
    const lunchStartTime = timeToMilliseconds('12:00') // 午休开始时间的毫秒数
    const lunchEndTime = timeToMilliseconds('13:00') // 午休结束时间的毫秒数
    const closeTime = timeToMilliseconds('16:00') // 收盘时间的毫秒数

    // 将时间戳转换为当天的毫秒数
    const timeOfDay =
      timestamp.getHours() * 60 * 60 * 1000 + timestamp.getMinutes() * 60 * 1000

    // 处理上午的交易时间 09:30 到 12:00
    if (timeOfDay < lunchStartTime) {
      return this.xScale(
        ((timeOfDay - openTime) / (lunchStartTime - openTime)) * 50
      )
    }
    // 处理下午的交易时间 13:00 到 16:00
    if (timeOfDay >= lunchEndTime) {
      return this.xScale(
        50 + ((timeOfDay - lunchEndTime) / (closeTime - lunchEndTime)) * 50
      )
    }
    // 如果时间在 12:00 到 13:00 之间，合并为中间点
    return this.xScale(50) // 午休时间段被压缩到中间
  }

  render() {
    const data = this.config.data

    if (!data.length) {
      console.error('没有数据可供渲染')
      return
    }

    this.xScale.domain([0, 100])

    const yExtent = d3.extent(data, (d) => d.price)
    this.yScale.domain(yExtent)

    this.svg.selectAll('*').remove() // 清空之前的内容

    // 绘制 X 轴
    this.svg
      .append('g')
      .attr('transform', `translate(0,${this.config.height - 50})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues([0, 50, 100])
          .tickFormat((d, i) => {
            if (i === 1) return '12:00/13:00'
            return i === 0 ? '09:30' : '16:00'
          })
      )

    // 绘制 Y 轴
    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale))

    // 绘制渐变填充区域
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'lightsteelblue') // 使用纯色填充区域
      .attr('d', this.area) // 绘制面积图

    // 绘制折线
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 0.5)
      .attr('d', this.line)

    this.renderPriceAndAvgLines()
  }

  renderPriceAndAvgLines() {
    const latestData = this.config.data[this.config.data.length - 1]
    if (!latestData) return

    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.price))
      .attr('y2', this.yScale(latestData.price))
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '4 2')
      .attr('stroke-width', 0.5)

    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.avg))
      .attr('y2', this.yScale(latestData.avg))
      .attr('stroke', 'orange')
      .attr('stroke-width', 0.5)
  }

  updateData(newData) {
    this.config.data = newData
    this.render()
  }
}

export default LineChart
