// 根据当前国内的低利率环境，定一个 4% 的折现率
export const ZHE_XIAN = 0.04

// eps 统一到26年q1
export const RAW_STOCKS: Record<string, StockConfig> = {
  腾讯: {
    targetPrice: 725,
    eps: 7.58 + 7.61 + 8.15 + 8.54,
    growth: 10,
    // 14.96, 16.01, 18.79, 17.05, 17.12
    dividendYield: (14.96 + 16.01 + 18.79 + 17.05 + 17.12) / 5,
    // 1.94, 27.05, 29.01, 46.57, 28.53
    repurchaseRatio: 28.53,
  },
  茅台: {
    targetPrice: 1678,
    eps: 14.8 + 15.35 + 14.13 + 21.76,
    growth: 6,
    // 51.9,95.78,84.01,78.9
    dividendYield: 78.9,
    // 0,0,6.96,7.29
    repurchaseRatio: 7.29,
  },
  港交: {
    targetPrice: 489,
    eps: 3.5 + 3.88 + 3.43 + 3.612,
    growth: 8,
    growthpe: 12 + 8,
    // 一直都是90
    dividendYield: 90,
    repurchaseRatio: 0,
  },
  泡泡: {
    targetPrice: 222.4,
    eps: 2.852 + 4.291 + 2.748 + 2.918,
    growth: 4,
    growthpe: 12 + 4,
    // 25.07, 25.33, 35.03, 35.01, 25.02
    dividendYield: (25.07 + 25.33 + 35.03 + 35.01 + 25.02) / 5,
    // 38.13, 100, 31.55, 2.09, 0
    repurchaseRatio: 31.55,
  },
  汾酒: {
    targetPrice: 200.8,
    eps: 1.52 + 2.38 + 0.69 + 4.41,
    growth: 2,
    growthpe: 15 + 2,
    // 41.33,50.03,51.07,60.39,65.35
    dividendYield: 65.35,
    repurchaseRatio: 0,
  },
  顺丰: {
    eps: 0.71 + 0.51 + 0.55 + 0.51,
    targetPrice: 53,
    growth: 6,
    growthpe: 15 + 6,
    // 18.86, 19.63, 35, 40.34, 40
    dividendYield: 40,
    // 0,0,0,8.44,13.87
    repurchaseRatio: 13.87,
  },
  老窖: {
    eps: 2.08 + 2.1 + 0.05 + 2.52,
    targetPrice: 120.8,
    growth: 0,
    growthpe: 15 + 0,
    // 60.01,60,60,65,78.5
    dividendYield: 78.5,
    repurchaseRatio: 0
  }
};