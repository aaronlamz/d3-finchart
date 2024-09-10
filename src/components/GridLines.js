import * as d3 from 'd3'

// 渲染网格线，支持自定义间距和颜色
export function renderGridLines(svg, xScale, yScale, config) {
  // 默认配置
  const gridConfig = {
    width: config.width || 800,
    height: config.height || 400,
    xAxisOffset: config.xAxisOffset || 50, // X 轴的偏移量
    yAxisOffset: config.yAxisOffset || 50, // Y 轴的偏移量
    xGridSpacing: config.xGridSpacing || 50, // X 轴网格线间距
    yGridSpacing: config.yGridSpacing || 50, // Y 轴网格线间距
    xGrid: config.xGrid !== undefined ? config.xGrid : true, // 是否绘制 X 轴网格
    yGrid: config.yGrid !== undefined ? config.yGrid : true, // 是否绘制 Y 轴网格
    gridColor: config.gridColor || '#e0e0e0', // 网格线颜色，默认为淡色
    gridOpacity: config.gridOpacity || 0.5, // 网格线不透明度
  }

  // 绘制 X 轴网格线
  if (gridConfig.xGrid) {
    const xGrid = d3
      .axisBottom(xScale)
      .ticks(Math.floor(gridConfig.width / gridConfig.xGridSpacing)) // 根据宽度计算刻度数量
      .tickSize(-gridConfig.height + gridConfig.xAxisOffset)
      .tickFormat('')

    svg
      .append('g')
      .attr('class', 'x grid')
      .attr(
        'transform',
        `translate(0,${gridConfig.height - gridConfig.xAxisOffset})`
      )
      .attr('stroke', gridConfig.gridColor)
      .attr('stroke-opacity', gridConfig.gridOpacity)
      .call(xGrid)
  }

  // 绘制 Y 轴网格线
  if (gridConfig.yGrid) {
    const yGrid = d3
      .axisLeft(yScale)
      .ticks(Math.floor(gridConfig.height / gridConfig.yGridSpacing)) // 根据高度计算刻度数量
      .tickSize(-gridConfig.width + gridConfig.yAxisOffset)
      .tickFormat('')

    svg
      .append('g')
      .attr('class', 'y grid')
      .attr('transform', `translate(${gridConfig.yAxisOffset}, 0)`)
      .attr('stroke', gridConfig.gridColor)
      .attr('stroke-opacity', gridConfig.gridOpacity)
      .call(yGrid)
  }
}
