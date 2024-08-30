# d3-finchart
A customizable lightweight financial chart built on d3.js

## Project
```
D3-FINCHAT/
├── public/                      # 静态资源目录
│   └── index.html               # 入口 HTML 文件
├── src/                         # 源代码目录
│   ├── charts/                  # 图表组件
│   │   ├── LineChart.js         # 分时图（折线图）组件
│   │   ├── CandlestickChart.js  # K 线图组件
│   │   ├── VolumeChart.js       # 成交量柱状图组件
│   │   └── index.js             # 图表组件的汇总导出
│   ├── indicators/              # 技术指标
│   │   ├── MA.js                # 移动平均线
│   │   ├── EMA.js               # 指数移动平均线
│   │   ├── MACD.js              # MACD 指标
│   │   └── index.js             # 技术指标的汇总导出
│   ├── data/                    # 数据管理模块
│   │   ├── dataManager.js       # 数据管理模块
│   │   ├── websocketService.js  # WebSocket 数据服务
│   │   ├── httpPollingService.js # HTTP 轮询数据服务
│   │   └── utils.js             # 数据处理工具函数
│   ├── settings/                # 图表设置模块
│   │   ├── chartSettings.js     # 图表设置管理
│   │   └── index.js             # 设置模块的汇总导出
│   ├── components/              # 通用组件
│   │   ├── Tooltip.js           # 工具提示组件
│   │   ├── Crosshair.js         # 十字线组件
│   │   └── index.js             # 通用组件的汇总导出
│   ├── utils/                   # 通用工具函数
│   │   └── chartUtils.js        # 图表通用工具函数
│   ├── styles/                  # 样式文件
│   │   └── styles.css           # 通用样式文件
│   ├── index.js                 # SDK 主入口文件
│   └── main.js                  # 应用启动入口文件
├── tests/                       # 测试目录
│   ├── unit/                    # 单元测试
│   └── integration/             # 集成测试
├── vite.config.js               # Vite 配置文件
├── package.json                 # 项目配置文件
└── README.md                    # 项目说明文件
```
