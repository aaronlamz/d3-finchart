import * as d3 from 'd3'
import { renderGridLines } from '../components/GridLines'

class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      data: config.data || [],
      market: config.market || 'hk',
    }
    this.initChart()
  }

  // 初始化图表
  initChart() {
    this.createSvg()
    this.createScales()
    this.defineGradient()
    this.createLineAndArea()
    this.render()
  }

  // 创建 SVG 容器
  createSvg() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
  }

  // 创建 X 和 Y 轴比例尺
  createScales() {
    this.xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([50, this.config.width - 50])

    this.yScale = d3.scaleLinear().range([this.config.height - 50, 50])
  }

  // 定义渐变色
  defineGradient() {
    const defs = this.svg.append('defs')

    const gradient = defs
      .append('linearGradient')
      .attr('id', 'price-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0.6)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'steelblue')
      .attr('stop-opacity', 0)
  }

  // 创建折线和面积图函数
  createLineAndArea() {
    this.line = d3
      .line()
      .x((d) => this.getXScale(d.timestamp))
      .y((d) => this.yScale(d.price))

    this.area = d3
      .area()
      .x((d) => this.getXScale(d.timestamp))
      .y0(this.config.height - 50)
      .y1((d) => this.yScale(d.price))
  }

  // 自定义 X 轴比例尺函数
  getXScale(timestamp) {
    const openTime = this.timeToMilliseconds('09:30')
    const lunchStartTime = this.timeToMilliseconds('12:00')
    const lunchEndTime = this.timeToMilliseconds('13:00')
    const closeTime = this.timeToMilliseconds('16:00')

    const timeOfDay =
      timestamp.getHours() * 60 * 60 * 1000 + timestamp.getMinutes() * 60 * 1000

    if (timeOfDay < lunchStartTime) {
      return this.xScale(
        ((timeOfDay - openTime) / (lunchStartTime - openTime)) * 50
      )
    } else if (timeOfDay >= lunchEndTime) {
      return this.xScale(
        50 + ((timeOfDay - lunchEndTime) / (closeTime - lunchEndTime)) * 50
      )
    }
    return this.xScale(50) // 合并午休时间段
  }

  // 辅助函数：将时间字符串转换为当天的毫秒数
  timeToMilliseconds(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours * 60 * 60 + minutes * 60) * 1000
  }

  // 绘制 X 轴和 Y 轴
  renderAxes() {
    // 绘制 X 轴
    this.svg
      .append('g')
      .attr('transform', `translate(0,${this.config.height - 50})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues([0, 50, 100])
          .tickFormat((d, i) =>
            i === 1 ? '12:00/13:00' : i === 0 ? '09:30' : '16:00'
          )
      )

    // 绘制 Y 轴
    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale))
  }

  // 渲染图表
  render() {
    const data = this.config.data

    if (!data.length) {
      console.error('没有数据可供渲染')
      return
    }

    const yExtent = d3.extent(data, (d) => d.price)
    this.yScale.domain(yExtent)

    this.svg.selectAll('*').remove() // 清空之前的内容

    this.renderAxes() // 绘制 X 轴和 Y 轴

    // 绘制面积图
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'lightsteelblue') // 使用纯色填充
      .attr('d', this.area)

    // 绘制折线
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 0.5)
      .attr('d', this.line)

    this.renderPriceAndAvgLines() // 渲染现价线和均价线
  }

  // 绘制现价线和均价线
  renderPriceAndAvgLines() {
    const latestData = this.config.data[this.config.data.length - 1]
    if (!latestData) return

    // 现价线
    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.price))
      .attr('y2', this.yScale(latestData.price))
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '4 2')
      .attr('stroke-width', 0.5)

    // 均价线
    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.avg))
      .attr('y2', this.yScale(latestData.avg))
      .attr('stroke', 'orange')
      .attr('stroke-width', 0.5)
  }

  // 更新数据并重新渲染
  updateData(newData) {
    this.config.data = newData
    this.render()
  }
}

export default LineChart
