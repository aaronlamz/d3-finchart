import * as d3 from 'd3'

class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      data: config.data || [],
      backgroundColor: config.backgroundColor || '#1a1a1a',
      logo: config.logo || '/images/logo.png',
      lineColor: config.lineColor || '#0BC0F1',
      lineWidth: config.lineWidth || 0.6,
      gradientColors: config.gradientColors || [
        'rgba(4, 132, 206, 0.29)',
        'rgba(4, 132, 206, 0)',
      ],
      market: config.market || 'hk',
      enableCrosshair: config.enableCrosshair || false,
      enableIndicators: config.enableIndicators || false,
      xAxisFontColor: config.xAxisFontColor || 'rgba(109, 109, 109, 1)', // X轴字体颜色
      yAxisFontColor: config.yAxisFontColor || '#6d6d6d', // Y轴字体颜色
      xAxisLineColor: config.xAxisLineColor || '#ccc', // X轴线条颜色
      yAxisLineColor: config.yAxisLineColor || '#ccc', // Y轴线条颜色
    }
    this.initChart()
  }

  initChart() {
    this.createSvg() // 创建 SVG 容器
    this.addBackground() // 添加底部背景色
    this.addLogo() // 添加底部 Logo
    this.defineGradient() // 定义渐变色
    this.createScales() // 创建比例尺
    this.createLineAndArea() // 创建折线和渐变区域
    this.render() // 渲染图表

    // 如果启用十字线功能，添加十字线
    if (this.config.enableCrosshair) {
      this.addCrosshair()
    }

    // 如果启用指标功能，添加指标
    if (this.config.enableIndicators) {
      this.addIndicators()
    }
  }

  // 创建 SVG 容器
  createSvg() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`) // 自适应
      .attr('preserveAspectRatio', 'xMidYMid meet') // 保持比例
      .style('width', '100%') // 让 SVG 根据容器自动调整宽度
      .style('height', 'auto') // 高度自动适应
  }

  // 添加底部背景色
  addBackground() {
    this.svg
      .append('rect')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('fill', this.config.backgroundColor) // 背景色
  }

  // 添加底部 Logo
  addLogo() {
    if (this.config.logo) {
      const logoWidth = 80 // Logo 的宽度
      const logoHeight = 50 // Logo 的高度

      this.svg
        .append('image')
        .attr('xlink:href', this.config.logo) // 引用 Logo 图片
        .attr('x', (this.config.width - logoWidth) / 2) // 居中显示
        .attr('y', (this.config.height - logoHeight) / 2) // 在底部显示
        .attr('width', logoWidth)
        .attr('height', logoHeight)
    }
  }

  // 定义折线图的渐变色
  defineGradient() {
    const defs = this.svg.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%') // 垂直渐变

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.config.gradientColors[0])
      .attr('stop-opacity', 0.8) // 顶部颜色更加不透明

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.config.gradientColors[1])
      .attr('stop-opacity', 0.2) // 底部部分透明
  }

  // 创建 X 和 Y 轴比例尺
  createScales() {
    this.xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([50, this.config.width - 50])

    this.yScale = d3.scaleLinear().range([this.config.height - 50, 50])
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
      .selectAll('text') // 自定义 X 轴字体颜色
      .attr('fill', this.config.xAxisFontColor)
    this.svg
      .selectAll('.domain, .tick line') // 自定义 X 轴线条颜色
      .attr('stroke', this.config.xAxisLineColor)

    // 绘制 Y 轴
    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale))
      .selectAll('text') // 自定义 X 轴字体颜色
      .attr('fill', this.config.yAxisFontColor)
    this.svg
      .selectAll('.domain, .tick line') // 自定义 Y 轴线条颜色
      .attr('stroke', this.config.yAxisLineColor)
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

    // 清除折线图和渐变区域的 path 元素，但保留其他内容
    this.svg.selectAll('.line-path').remove()
    this.svg.selectAll('.area-path').remove()

    this.renderAxes() // 绘制 X 轴和 Y 轴

    // 绘制面积图
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'url(#line-gradient)') // 使用渐变色填充
      .attr('d', this.area)

    // 绘制折线图
    this.svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', this.config.lineColor)
      .attr('stroke-width', this.config.lineWidth)
      .attr('d', this.line)

    this.renderPriceAndAvgLines() // 渲染现价线和均价线
  }
  // 添加十字线功能
  addCrosshair() {
    // 十字线逻辑
    console.log('十字线功能已启用')
  }

  // 添加指标功能
  addIndicators() {
    // 指标渲染逻辑
    console.log('指标功能已启用')
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
