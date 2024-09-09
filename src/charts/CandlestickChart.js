import * as d3 from 'd3'

class CandlestickChart {
  constructor(container, config = {}) {
    this.container = container
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      data: config.data || [],
    }
    this.initChart()
  }

  initChart() {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    this.xScale = d3
      .scaleBand()
      .range([50, this.config.width - 50])
      .padding(0.2)

    this.yScale = d3.scaleLinear().range([this.config.height - 50, 50])

    this.render()
  }

  render() {
    const data = this.config.data
    const xExtent = data.map((d) => new Date(d.timestamp))
    const yExtent = [d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)]

    this.xScale.domain(xExtent)
    this.yScale.domain(yExtent)

    this.svg.selectAll('*').remove()

    // X轴
    this.svg
      .append('g')
      .attr('transform', `translate(0,${this.config.height - 50})`)
      .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat('%Y-%m-%d')))

    // Y轴
    this.svg
      .append('g')
      .attr('transform', 'translate(50, 0)')
      .call(d3.axisLeft(this.yScale))

    // 绘制蜡烛图
    this.svg
      .selectAll('.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => this.xScale(new Date(d.timestamp)))
      .attr('y', (d) => this.yScale(Math.max(d.open, d.close)))
      .attr('width', this.xScale.bandwidth())
      .attr('height', (d) =>
        Math.abs(this.yScale(d.open) - this.yScale(d.close))
      )
      .attr('fill', (d) => (d.open > d.close ? 'red' : 'green'))

    // 绘制高低价线
    this.svg
      .selectAll('.wick')
      .data(data)
      .enter()
      .append('line')
      .attr(
        'x1',
        (d) => this.xScale(new Date(d.timestamp)) + this.xScale.bandwidth() / 2
      )
      .attr(
        'x2',
        (d) => this.xScale(new Date(d.timestamp)) + this.xScale.bandwidth() / 2
      )
      .attr('y1', (d) => this.yScale(d.high))
      .attr('y2', (d) => this.yScale(d.low))
      .attr('stroke', 'black')
  }

  updateData(newData) {
    this.config.data = newData
    this.render()
  }
}

export default CandlestickChart
