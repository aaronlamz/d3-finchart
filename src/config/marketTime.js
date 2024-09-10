// 分时交易时间（北京时间）
// 港股交易时间 9:30-12:00 13:00-16:00 共计5.5小时
// 美股交易时间 21: 30-04: 00 （或22: 30-05: 00） 共计6.5小时
// 新加坡股票交易时间9:00-12:00 13:00-17:16
// A股交易时间 9:30-11:30 13:00-15:00 共计4小时
// A股创业板/科创板为15:30 共计4.5小时

// const ftHour = data[0].time.substring(11)
// const firstTime = new Date(`2021/01/01 ${ftHour}`) // 初始时间取第一条数据时间 待优化

const TRADING_SESSION_TYPES = {
  FULL_DAY: 0, // 全日交易（包含盘前、盘后）
  REGULAR_HOURS: 1, // 正常交易时段（盘中交易）
  PRE_HOURS: 2, // 盘前交易
  AFTER_HOURS: 3, // 盘后交易
}

export const TRADING_SESSIONS = {
  hk: {
    middle: '12:00/13:00', // 午间休市时间
    end: '16:00', // 收盘时间
  },
  us: {
    [TRADING_SESSION_TYPES.FULL_DAY]: {
      middle: '12:00', // 中午休息时间
      end: '20:00', // 收盘时间
    },
    [TRADING_SESSION_TYPES.PRE_HOURS]: {
      middle: '6:45', // 盘前休息时间
      end: '9:30', // 盘前结束
    },
    [TRADING_SESSION_TYPES.REGULAR_HOURS]: {
      middle: '12:45', // 盘中休息时间
      end: '16:00', // 收盘时间
    },
    [TRADING_SESSION_TYPES.AFTER_HOURS]: {
      middle: '18:00', // 盘后休息时间
      end: '20:00', // 盘后结束
    },
  },
  sh: {
    middle: '11:30/13:00', // 午间休市时间
    end: '15:00', // 收盘时间
  },
  sz: {
    middle: '11:30/13:00', // 午间休市时间
    end: '15:00', // 收盘时间
  },
  sg: {
    middle: '12:00/13:00', // 午间休市时间
    end: '17:16', // 收盘时间
  },
  dark_market: {
    middle: '16:15', // 暗盘休市时间
    end: '18:30', // 暗盘结束时间
  },
  cyb_kcb: {
    middle: '11:30/13:00', // 创业板/科创板午间休市时间
    end: '15:30', // 创业板/科创板收盘时间
  },
  option_Index: {
    middle: '12:45', // 期权市场中午休息时间
    end: '16:15', // 期权市场收盘时间
  },
}
