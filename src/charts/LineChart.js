import * as d3 from 'd3'

class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      padding: config.padding || 50,
      data: config.data || [],
      backgroundColor: config.backgroundColor || '#1a1a1a',
      logo: config.logo || '/images/logo.png',
      lineColor: config.lineColor || '#0BC0F1',
      lineWidth: config.lineWidth || 0.5,
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
      classNamePrefix: config.classNamePrefix || 'finchart', // 全局类名前缀
      showAvgLine: config.showAvgLine || true, // 是否显示均价线
      showPriceLine: config.showPriceLine || true, // 是否显示现价线
    }
    this.initChart()
  }

  // 获取带有全局前缀的类名
  getClassName(suffix) {
    return `${this.config.classNamePrefix}-${suffix}`
  }

  initChart() {
    this.createSvg()
    this.addBackground()
    this.addLogo()
    this.defineGradient()
    this.createScales()
    this.createLineAndArea()
    this.renderChart()

    if (this.config.enableCrosshair) {
      this.addCrosshair()
    }

    if (this.config.enableIndicators) {
      this.addIndicators()
    }
  }

  // 创建 SVG 容器
  createSvg() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .attr('class', this.getClassName('svg-container'))
  }

  // 添加底部背景色
  addBackground() {
    this.svg
      .append('rect')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('fill', this.config.backgroundColor)
      .attr('class', this.getClassName('background'))
  }

  // 添加底部 Logo
  addLogo() {
    if (this.config.logo) {
      const logoWidth = 100
      const logoHeight = 80

      this.svg
        .append('image')
        .attr('xlink:href', this.config.logo)
        .attr('x', (this.config.width - logoWidth) / 2)
        .attr('y', (this.config.height - logoHeight) / 2)
        .attr('width', logoWidth)
        .attr('height', logoHeight)
        .attr('class', this.getClassName('logo'))
    }
  }

  // 定义折线图的渐变色
  defineGradient() {
    const defs = this.svg.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', this.getClassName('line-gradient'))
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.config.gradientColors[0])
      .attr('stop-opacity', 0.8)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.config.gradientColors[1])
      .attr('stop-opacity', 0.2)
  }

  // 创建 X 和 Y 轴比例尺
  createScales() {
    this.xScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([this.config.padding, this.config.width - this.config.padding])

    this.yScale = d3
      .scaleLinear()
      .range([this.config.height - this.config.padding, this.config.padding])
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
      .y0(this.config.height - this.config.padding)
      .y1((d) => this.yScale(d.price))
  }

  // 获取 X 轴刻度
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

  // 绘制 X 轴和自定义 Y 轴
  renderAxes(data) {
    // 绘制 X 轴
    this.svg
      .append('g')
      .attr(
        'transform',
        `translate(0,${this.config.height - this.config.padding})`
      )
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues([0, 50, 100])
          .tickFormat((d, i) =>
            i === 1 ? '12:00/13:00' : i === 0 ? '09:30' : '16:00'
          )
      )
      .selectAll('text')
      .attr('fill', this.config.xAxisFontColor)

    this.svg
      .selectAll('.domain, .tick line')
      .attr('stroke', this.config.xAxisLineColor)

    // 自定义 Y 轴
    const yExtent = d3.extent(data, (d) => d.price)
    const yMin = yExtent[0]
    const yMax = yExtent[1]
    this.yScale.domain([yMin, yMax])

    // 生成自定义的刻度数组，从最小值到最大值，确保最后一个刻度不一定间隔一致
    const tickValues = d3.range(yMin, yMax, (yMax - yMin) / 4)
    tickValues.push(yMax)

    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale).tickValues(tickValues))
      .selectAll('text')
      .attr('fill', this.config.yAxisFontColor)

    this.svg
      .selectAll('.domain, .tick line')
      .attr('stroke', this.config.yAxisLineColor)
  }

  renderChart() {
    const data = this.config.data

    if (!data.length) {
      console.error('没有数据可供渲染')
      return
    }

    this.svg.selectAll(`.${this.getClassName('line-path')}`).remove()
    this.svg.selectAll(`.${this.getClassName('area-path')}`).remove()

    this.renderAxes(data)

    // 绘制面积图
    this.svg
      .append('path')
      .datum(data)
      .attr('class', this.getClassName('area-path'))
      .attr('fill', `url(#${this.getClassName('line-gradient')})`)
      .attr('d', this.area)

    // 绘制折线图
    this.svg
      .append('path')
      .datum(data)
      .attr('class', this.getClassName('line-path'))
      .attr('fill', 'none')
      .attr('stroke', this.config.lineColor)
      .attr('stroke-width', this.config.lineWidth)
      .attr('d', this.line)

    this.renderPriceAndAvgLines()
  }

  // 渲染均价线和现价线
  renderPriceAndAvgLines() {
    const latestData = this.config.data[this.config.data.length - 1]
    if (!latestData) return

    if (this.config.showPriceLine) {
      this.renderLine(latestData.price, 'price-line', 'red')
    }

    if (this.config.showAvgLine && latestData.avg !== undefined) {
      this.renderLine(latestData.avg, 'avg-line', 'orange')
    }
  }

  // 渲染线条的通用方法
  renderLine(value, classNameSuffix, color) {
    this.svg
      .append('line')
      .attr('class', this.getClassName(classNameSuffix))
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', this.yScale(value))
      .attr('y2', this.yScale(value))
      .attr('stroke', color)
      .attr('stroke-dasharray', '4 2')
      .attr('stroke-width', 0.5)
  }

  // 更新数据并重新渲染
  updateData(newData) {
    this.config.data = newData
    this.renderChart()
  }
}

export default LineChart
