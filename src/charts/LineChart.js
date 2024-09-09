import * as d3 from 'd3'
import { renderGridLines } from './GridLines'

class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      data: config.data || [],
      market: config.market || 'hk', // 市场类型
    }
    this.initChart()
  }

  initChart() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    this.xScale = d3.scaleTime().range([50, this.config.width - 50])

    this.yScale = d3.scaleLinear().range([this.config.height - 50, 50])

    this.line = d3
      .line()
      .x((d) => this.xScale(new Date(d.timestamp)))
      .y((d) => this.yScale(d.price))

    this.area = d3
      .area()
      .x((d) => this.xScale(new Date(d.timestamp)))
      .y0(this.config.height - 50) // 底部位置
      .y1((d) => this.yScale(d.price)) // 价格对应的高度

    // 调用 addGradient 方法为渐变效果添加定义
    this.addGradient() // 确保 addGradient 在此类中定义

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

  render() {
    const data = this.config.data
    const xExtent = d3.extent(data, (d) => new Date(d.timestamp))
    const yExtent = d3.extent(data, (d) => d.price)

    this.xScale.domain(xExtent)
    this.yScale.domain(yExtent)

    this.svg.selectAll('*').remove() // 清空之前的内容

    // 使用模块化的网格线渲染
    renderGridLines(this.svg, this.xScale, this.yScale, {
      width: this.config.width,
      height: this.config.height,
      xGridSpacing: 100, // X 轴网格线间距
      yGridSpacing: 50, // Y 轴网格线间距
      gridColor: '#e0e0e0', // 淡色网格线
      gridOpacity: 0.5, // 网格线不透明度
    })

    // X轴
    this.svg
      .append('g')
      .attr('transform', `translate(0,${this.config.height - 50})`)
      .call(d3.axisBottom(this.xScale))

    // Y轴
    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale))

    // 绘制渐变填充区域
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'url(#price-gradient)') // 使用定义的渐变
      .attr('d', this.area)

    // 绘制折线
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', this.line)

    // 添加现价线和均价线
    this.renderPriceAndAvgLines()
  }

  renderPriceAndAvgLines() {
    const latestData = this.config.data[this.config.data.length - 1]
    if (!latestData) return

    // 绘制现价线
    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.price))
      .attr('y2', this.yScale(latestData.price))
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '4 2')
      .attr('stroke-width', 1.5)

    // 绘制均价线
    this.svg
      .append('line')
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(latestData.avg))
      .attr('y2', this.yScale(latestData.avg))
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
  }

  updateData(newData) {
    this.config.data = newData
    this.render()
  }
}

export default LineChart
