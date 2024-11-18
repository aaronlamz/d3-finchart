import * as d3 from 'd3'

/**
 * 1/5日分时图模块
 */
class LineChart {
  constructor(container, config = {}) {
    this.container = container
    this.eventListeners = []
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
      mode: config.mode || 1,
      enableCrosshair: config.enableCrosshair || false,
      enableIndicators: config.enableIndicators || false,
      xAxisFontColor: config.xAxisFontColor || 'rgba(109, 109, 109, 1)',
      yAxisFontColor: config.yAxisFontColor || '#6d6d6d',
      xAxisLineColor: config.xAxisLineColor || '#ccc',
      yAxisLineColor: config.yAxisLineColor || '#ccc',
      classNamePrefix: config.classNamePrefix || 'finchart',
      showAvgLine: config.showAvgLine || true,
      showPriceLine: config.showPriceLine || true,
      priceColorConfig: config.priceColorConfig || {
        upColor: 'red',
        downColor: 'green',
      },
      gridColor: config.gridColor || 'rgba(200, 200, 200, 0.3)',
      base: config.base || 1000,
    }
    this.initChart()
  }

  getClassName(suffix) {
    return `${this.config.classNamePrefix}-${suffix}`
  }

  initChart() {
    this.createSvg()
    this.addBackground()
    this.addLogo()
    this.defineGradient()
    this.createScales()
    this.renderGridGroup()
    this.createLineAndArea()
    this.renderChart()

    if (this.config.enableCrosshair) {
      this.addCrosshair()
    }

    if (this.config.enableIndicators) {
      this.addIndicators()
    }

    this.addEventListener(
      window,
      'resize',
      this.debounce(this.resize.bind(this), 200)
    )
  }

  addEventListener(target, type, listener) {
    target.addEventListener(type, listener)
    this.eventListeners.push({ target, type, listener })
  }

  removeEventListeners() {
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener)
    })
    this.eventListeners = []
  }

  debounce(func, delay) {
    let timer
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => func.apply(this, args), delay)
    }
  }

  createSvg() {
    if (!this.svg) {
      this.svg = d3
        .select(this.container)
        .append('svg')
        .attr('class', this.getClassName('svg-container'))
    }

    this.svg
      .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
  }

  addBackground() {
    this.svg
      .append('rect')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('fill', this.config.backgroundColor)
      .attr('class', this.getClassName('background'))
  }

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

  createScales() {
    if (this.config.mode === 5) {
      // 提取唯一日期作为 5 日分时图的刻度
      this.uniqueDates = [
        ...new Set(
          this.config.data.map((d) => d.timestamp.toISOString().split('T')[0])
        ),
      ]
      console.log('uniqueDates', this.uniqueDates, this.uniqueDates.length)
      this.xScale = d3
        .scaleLinear()
        .domain([0, this.uniqueDates.length - 1]) // 每一天分布在刻度上
        .range([this.config.padding, this.config.width - this.config.padding])
    } else {
      // 原来的 1 日分时图逻辑
      this.xScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([this.config.padding, this.config.width - this.config.padding])
    }

    // Y轴范围仍从数据中动态计算
    const yExtent = d3.extent(this.config.data, (d) => d.price)
    this.yScale = d3
      .scaleLinear()
      .domain([yExtent[0], yExtent[1]])
      .range([this.config.height - this.config.padding, this.config.padding])
  }

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

  getXScale(timestamp) {
    if (this.config.mode === 1) {
      // 一日分时逻辑
      const dayScaleFactor = 100
      const openTime = this.timeToMilliseconds('09:30')
      const lunchStartTime = this.timeToMilliseconds('12:00')
      const lunchEndTime = this.timeToMilliseconds('13:00')
      const closeTime = this.timeToMilliseconds('16:00')

      const timeOfDay =
        timestamp.getHours() * 60 * 60 * 1000 +
        timestamp.getMinutes() * 60 * 1000

      if (timeOfDay < lunchStartTime) {
        return this.xScale(
          ((timeOfDay - openTime) / (lunchStartTime - openTime)) *
            (dayScaleFactor / 2)
        )
      } else if (timeOfDay >= lunchEndTime) {
        return this.xScale(
          dayScaleFactor / 2 +
            ((timeOfDay - lunchEndTime) / (closeTime - lunchEndTime)) *
              (dayScaleFactor / 2)
        )
      }
      return this.xScale(dayScaleFactor / 2)
    } else if (this.config.mode === 5) {
      // 五日分时逻辑
      const timestampDate = timestamp.toISOString().split('T')[0]
      const dayIndex = this.uniqueDates.findIndex(
        (date) => date === timestampDate
      )

      if (dayIndex === -1) {
        console.warn(`未找到对应日期: ${timestampDate}`)
        return this.config.padding // 返回最小范围
      }

      const intraDayMillis =
        timestamp.getHours() * 3600 * 1000 + timestamp.getMinutes() * 60 * 1000
      const openTime = this.timeToMilliseconds('09:30')
      const lunchStartTime = this.timeToMilliseconds('12:00')
      const lunchEndTime = this.timeToMilliseconds('13:00')
      const closeTime = this.timeToMilliseconds('16:00')

      const totalMillis = closeTime - openTime - (lunchEndTime - lunchStartTime)
      let adjustedMillis

      if (intraDayMillis >= lunchStartTime && intraDayMillis < lunchEndTime) {
        adjustedMillis = lunchStartTime - openTime
      } else if (intraDayMillis >= lunchEndTime) {
        adjustedMillis =
          intraDayMillis - (lunchEndTime - lunchStartTime) - openTime
      } else {
        adjustedMillis = intraDayMillis - openTime
      }

      adjustedMillis = Math.max(0, Math.min(adjustedMillis, totalMillis))
      const intraDayRatio = adjustedMillis / totalMillis

      // 确保 xValue 不超出 uniqueDates 范围
      const xValue = Math.min(
        this.uniqueDates.length - 1,
        Math.max(0, dayIndex + intraDayRatio)
      )

      // 通过 xScale 映射到正确的位置
      return this.xScale(xValue)
    }
  }

  timeToMilliseconds(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours * 60 * 60 + minutes * 60) * 1000
  }

  renderGridGroup() {
    this.gridGroup = this.svg
      .append('g')
      .attr('class', this.getClassName('grid-group'))
  }

  renderGridLines(tickValuesX, tickValuesY) {
    this.gridGroup.selectAll('*').remove()

    // 绘制垂直网格线
    this.gridGroup
      .selectAll('line.vertical-grid')
      .data(tickValuesX)
      .enter()
      .append('line')
      .attr('class', this.getClassName('vertical-grid'))
      .attr('x1', (d) => this.xScale(d))
      .attr('x2', (d) => this.xScale(d))
      .attr('y1', this.config.padding)
      .attr('y2', this.config.height - this.config.padding)
      .attr('stroke', this.config.gridColor)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')

    // 绘制水平网格线
    this.gridGroup
      .selectAll('line.horizontal-grid')
      .data(tickValuesY)
      .enter()
      .append('line')
      .attr('class', this.getClassName('horizontal-grid'))
      .attr('x1', this.config.padding)
      .attr('x2', this.config.width - this.config.padding)
      .attr('y1', (d) => this.yScale(d))
      .attr('y2', (d) => this.yScale(d))
      .attr('stroke', this.config.gridColor)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')
  }

  renderAxes(data) {
    const xAxisClass = this.getClassName('x-axis')
    const yAxisLeftClass = this.getClassName('y-axis-left')
    const yAxisRightClass = this.getClassName('y-axis-right')

    const yExtent = d3.extent(data, (d) => d.price)
    const yMin = yExtent[0]
    const yMax = yExtent[1]
    this.yScale.domain([yMin, yMax])

    // X 轴刻度值
    const tickValuesX =
      this.config.mode === 5
        ? this.uniqueDates.map((_, i) => i) // 5 日分时图使用日期索引
        : [0, 25, 50, 75, 100]
    const tickValuesY = d3.range(yMin, yMax, (yMax - yMin) / 4)
    tickValuesY.push(yMax)

    // 渲染 X 轴
    this.svg
      .append('g')
      .attr(
        'transform',
        `translate(0,${this.config.height - this.config.padding})`
      )
      .attr('class', xAxisClass)
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues(tickValuesX)
          .tickFormat((d) =>
            this.config.mode === 5
              ? this.uniqueDates[d] // 显示 5 日分时图的日期
              : d === 0
                ? '9:30'
                : d === 50
                  ? '12:00/13:00'
                  : d === 100
                    ? '16:00'
                    : ''
          )
      )
      .selectAll('text')
      .attr('fill', this.config.xAxisFontColor)

    this.svg
      .selectAll(`.${xAxisClass} .domain, .${xAxisClass} .tick line`)
      .attr('stroke', this.config.xAxisLineColor)

    const preClose = data[0]?.preClose / this.config.base || yMax / 2
    const colorConfig = this.config.priceColorConfig

    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .attr('class', yAxisLeftClass)
      .call(d3.axisLeft(this.yScale).tickValues(tickValuesY))
      .selectAll('text')
      .attr('fill', (d) =>
        d > preClose ? colorConfig.upColor : colorConfig.downColor
      )

    this.svg
      .selectAll(`.${yAxisLeftClass} .domain, .${yAxisLeftClass} .tick line`)
      .attr('stroke', this.config.yAxisLineColor)

    this.svg
      .append('g')
      .attr('transform', `translate(${this.config.width - 50}, 0)`)
      .attr('class', yAxisRightClass)
      .call(
        d3
          .axisRight(this.yScale)
          .tickValues(tickValuesY)
          .tickFormat((d) => {
            const diff = d - preClose
            const percentage = ((diff / preClose) * 100).toFixed(2)
            return `${percentage}%`
          })
      )
      .selectAll('text')
      .attr('fill', (d) =>
        d > preClose ? colorConfig.upColor : colorConfig.downColor
      )

    this.svg
      .selectAll(`.${yAxisRightClass} .domain, .${yAxisRightClass} .tick line`)
      .attr('stroke', this.config.yAxisLineColor)

    this.renderGridLines(tickValuesX, tickValuesY)
  }

  renderChart() {
    const data = this.config.data
    if (!data.length) {
      console.error('没有数据可供渲染')
      return
    }

    this.clear() // 清除之前的动态内容
    this.renderAxes(data)

    this.svg
      .append('path')
      .datum(data)
      .attr('class', this.getClassName('area-path'))
      .attr('fill', `url(#${this.getClassName('line-gradient')})`)
      .attr('d', this.area)

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

  clear() {
    this.svg.selectAll(`.${this.getClassName('x-axis')}`).remove()
    this.svg.selectAll(`.${this.getClassName('y-axis-left')}`).remove()
    this.svg.selectAll(`.${this.getClassName('y-axis-right')}`).remove()
    this.svg.selectAll(`.${this.getClassName('grid-group')}`).remove()
    this.svg.selectAll(`.${this.getClassName('line-path')}`).remove()
    this.svg.selectAll(`.${this.getClassName('area-path')}`).remove()
  }

  clearAll() {
    // 清除所有内容并移除事件监听器
    d3.select(this.container).selectAll('*').remove()
    this.removeEventListeners()
  }

  resize() {
    this.config.width = this.container.clientWidth
    this.config.height = this.container.clientHeight
    this.clear()
    this.initChart()
  }

  updateData(newData) {
    this.config.data = newData
    this.renderChart()
  }
}

export default LineChart
