export interface StockConfig {
  targetPrice: number; // 机构目标价
  eps: number; // 每股收益
  growth: number; // 未来 10 年复合增速
  dividendYield: number; // 分红率
  repurchaseRatio: number; // 回购率
  isHongkong: boolean; // 是否是港股
}

/**
 * 根据折现模型和估值指标计算个股分数
 */
export const calculateValue = (stock: StockConfig, price: number): number => {
  // 股价回到公允价格的市场回报（按 50% 概率发生来算）
  const calculatePriceValue = () => {
    // 按长期增速毛估估一个合理 pe，a股是15+增速，港股是12+增速（因为流动性更差）， 封顶 30
    const growthPe = Math.min(30, (stock.isHongkong ? 12 : 15) + stock.growth)
    // 根据机构目标价计算目标 pe，封顶 30
    const targetPe = Math.min(30, stock.targetPrice / stock.eps)
    // 取平均 pe 来计算公允价格
    const fairPrice = ((growthPe + targetPe) / 2) * stock.eps
    // 按一半概率来算，这部分收益只是辅助，避免受市场观点影响太大
    return 50 * (fairPrice / price - 1)
  };

  // 未来 10 年股东回报折现
  const calculateReturnValue = () => {
    const g = 1 + (stock.growth || 0) / 100
    const eps2 = (stock.eps * g) / (1 + ZHE_XIAN);
    const eps3 = (eps2 * g) / (1 + ZHE_XIAN);
    const eps4 = (eps3 * g) / (1 + ZHE_XIAN);
    const eps5 = (eps4 * g) / (1 + ZHE_XIAN);
    const eps6 = (eps5 * g) / (1 + ZHE_XIAN);
    const eps7 = (eps6 * g) / (1 + ZHE_XIAN);
    const eps8 = (eps7 * g) / (1 + ZHE_XIAN);
    const eps9 = (eps8 * g) / (1 + ZHE_XIAN);
    const eps10 = (eps9 * g) / (1 + ZHE_XIAN);
    // 如果是港股，需要扣掉 20% 的分红税
    const dividendYield = stock.dividendYield * (stock.isHongkong ? 0.8 : 1)
    return (dividendYield + stock.repurchaseRatio) *
      (stock.eps + eps2 + eps3 + eps4 + eps5 + eps6 + eps7 + eps8 + eps9 + eps10) / 100
  };
  return calculateReturnValue() + calculatePriceValue()
};
