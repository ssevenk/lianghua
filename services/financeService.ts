
import { CalculatedStock, StockConfig, GlobalState, TagAllocation } from '../types';
import { 
  ZHE_XIAN, 
  RAW_PROPERTIES, 
  RAW_STOCKS, 
  TAG_RATIO_MAP, 
  MI_RATIO, 
  MA_RATIO, 
  ALL_DEBT, 
  MA_YEAR_START_ASSET 
} from '../constants';
import { fetchStockPrices, fetchExchangeRates } from './api';

/**
 * 股票数据预处理：计算 ROIC 和 预期增速
 */
export const preprocessStock = (stock: StockConfig) => {
  if (stock.利润表) {
    // 用近5年的roic和最新一年的roic取平均（避免低估roic在持续改善的公司）
    stock.roic =
      (stock.roic表[4] +
        (100 * stock.利润表.reduce((prev, next) => prev + next, 0)) /
          (stock.利润表[0] / (stock.roic表[0] / 100) +
            stock.利润表[1] / (stock.roic表[1] / 100) +
            stock.利润表[2] / (stock.roic表[2] / 100) +
            stock.利润表[3] / (stock.roic表[3] / 100) +
            stock.利润表[4] / (stock.roic表[4] / 100))) /2
    // 净现比
    stock.cashP =
      stock.现金.reduce((prev, next) => prev + next, 0) /
      stock.利润表.reduce((prev, next) => prev + next, 0)
  } else {
    // 沪深300没有利润表处理的，由于银行占比高，以及亏损股的存在，roic有失真，要还原
    stock.roic = (0.7 * stock.roic表.reduce((prev, cur) => prev + cur, 0)) / 5
    stock.cashP = 1
  }

  // 3年后的增速，取未来3年均值的70%乘以折价，为了避免成长股过于乐观导致安全边际太小，将3年均值70%封顶10%
  stock.g =
    stock.折价 * Math.min((0.7 * stock.增速.reduce((prev, next) => prev + next, 0)) / 300, 0.1)
};

/**
 * 核心建模计算：根据折现模型和估值指标计算个股合理分值
 */
export const calculateValue = (name: string, stock: StockConfig, price: number): CalculatedStock => {
  preprocessStock(stock);
  const g = stock.g || 0;
  const roic = stock.roic || 0;
  const cashP = stock.cashP || 1;
  const zhejia = stock.折价 || 1;
  const historicalPe = stock.历史估值 || 15;
  const dynamicYield = stock.动态收益 || 1;
  const bonusRate = stock.分红率 || 0;
  const buybackRate = stock.回购率 || 0;
  const equityZhejia = stock.股权折价 || 1;
  const extraValue = stock.额外价值 || 0;

  // 1. ROIC 估值分量 (上限 30)
  const roicPe = Math.min(30, roic * cashP * zhejia)
  
  // 2. 历史估值分量 (上限 30)
  const historyPe = Math.min(30, historicalPe * zhejia)
  
  // 3. 增速计算pe。不算第一年的，因为最终是用动态pe来对比
    const g1 = 1 + g
    const y2 = 1 + stock.增速[1] / 100
    const y3 = y2 * (1 + stock.增速[2] / 100)
    const y4 = y3 * g1
    const y5 = y4 * g1
    const y6 = y5 * g1
    const y7 = y6 * g1
    const y8 = y7 * g1
    const y9 = y8 * g1
    const y10 = y9 * g1
    // 取1.2是为了和折价修正，即S企业可以适用原版的计算规则
    const growPe = Math.min(
      30,
      zhejia * 1.2 * (1 + y2 + y3 + y4 + y5 + y6 + y7 + y8 + y9 + y10)
    )

  // 综合合理 PE = (三个维度分别封顶 30 后的平均值) * 安全折价
  const normalPe = (historyPe + roicPe + growPe) / 3;
  
  // 实际 PE (当前价 / 动态每股收益)
  const zhenshiPe = price / (dynamicYield || 1);

  // 计算 PE 估值得分 (PEV)
  const calculatePev = (currPrice: number) => {
    const zPe = currPrice / (dynamicYield || 1);
    return 70 * (normalPe / (zPe || 1) - 1);
  };

  // 计算 PB/分红 估值得分 (PBV - 10 年现金流回馈折现)
  const calculatePbv = (currPrice: number) => {
    const zPe = currPrice / (dynamicYield || 1);
    const y1 = 100 / zPe
    const y2 = (y1 * (1 + stock.增速[1] / 100)) / (1 + ZHE_XIAN)
    const y3 = (y2 * (1 + stock.增速[2] / 100)) / (1 + ZHE_XIAN)
    const y4 = (y3 * (1 + g)) / (1 + ZHE_XIAN)
    const y5 = (y4 * (1 + g)) / (1 + ZHE_XIAN)
    const y6 = (y5 * (1 + g)) / (1 + ZHE_XIAN)
    const y7 = (y6 * (1 + g)) / (1 + ZHE_XIAN)
    const y8 = (y7 * (1 + g)) / (1 + ZHE_XIAN)
    const y9 = (y8 * (1 + g)) / (1 + ZHE_XIAN)
    const y10 = (y9 * (1 + g)) / (1 + ZHE_XIAN)
    return (
      (zhejia *
        (bonusRate * equityZhejia + buybackRate) *
        (y1 + y2 + y3 + y4 + y5 + y6 + y7 + y8 + y9 + y10)) /
      100
    )
  };

  const v1Num = calculatePev(price) + calculatePbv(price) + extraValue;
  const v1 = v1Num.toFixed(2);
  
  const p2 = price * 1.05;
  const v2 = (calculatePev(p2) + calculatePbv(p2) + extraValue).toFixed(2);
  
  const p3 = price * 0.95;
  const v3 = (calculatePev(p3) + calculatePbv(p3) + extraValue).toFixed(2);

  return { ...stock, name, price, v: v1, v2, v3, p2, p3, zhenshiPe, normalPe, g, roic, cashP };
};

/**
 * 业务聚合函数：协调数据获取与各模块财务计算
 */
export async function fetchDashboardData(): Promise<{
  globalState: GlobalState;
  stocks: CalculatedStock[];
  allocations: TagAllocation[];
}> {
  // 1. 确定需要更新行情的代码
  const codesToFetch = new Set<string>();
  RAW_PROPERTIES.forEach(p => { if (p.code) codesToFetch.add(p.code); });
  Object.values(RAW_STOCKS).forEach(s => { if (s.code && !s.onlyPrice) codesToFetch.add(s.code); });

  // 2. 调用 API 模块拉取数据
  const [rates, priceMap] = await Promise.all([
    fetchExchangeRates(),
    fetchStockPrices(Array.from(codesToFetch))
  ]);

  // 3. 执行资产汇总财务逻辑
  const tagTotals: Record<string, number> = {};
  let allDanBao = 0;

  RAW_PROPERTIES.forEach((p) => {
    let price = p.code ? (priceMap[p.code] || 0) : 1;
    const finalPrice = p.ifPrice || price;
    let total = (p.code ? finalPrice * p.num : p.num);

    if (p.exchange === 'hk') total /= rates.hk;
    if (p.exchange === 'us') total /= rates.us;

    if (isNaN(total)) total = 0;
    if (p.danbao) allDanBao += total;
    
    tagTotals[p.tag] = (tagTotals[p.tag] || 0) + total;
  });

  // 4. 计算全局仪表盘指标
  const nowTotalTotal = Object.values(tagTotals).reduce((acc, curr) => acc + curr, 0);
  const allClean = nowTotalTotal - ALL_DEBT;
  const maxDebt = allDanBao * 0.25;
  const availableDebt = Math.max(0, maxDebt - ALL_DEBT);
  const allTotal = allClean + maxDebt;
  
  const miAsset = allClean * MI_RATIO;
  const maAsset = allClean * MA_RATIO;
  const myAsset = allClean - miAsset - maAsset;
  
  const yieldValue = ((100 * (maAsset - MA_YEAR_START_ASSET)) / MA_YEAR_START_ASSET);
  const yieldPct = isNaN(yieldValue) ? "0.00" : yieldValue.toFixed(2);
  const debtRatio = ALL_DEBT === 0 ? 0 : Math.floor((100 * (allDanBao + ALL_DEBT)) / ALL_DEBT);

  const globalState: GlobalState = {
    exchange: rates,
    allClean,
    allDanBao,
    allTotal,
    debt: ALL_DEBT,
    debtRatio: debtRatio,
    availableDebt: availableDebt,
    yield: yieldPct,
    miAsset,
    maAsset,
    myAsset
  };

  // 5. 执行个股建模逻辑
  const stockResults: CalculatedStock[] = [];
  for (const [name, config] of Object.entries(RAW_STOCKS)) {
    if (!config.onlyPrice) {
      const price = priceMap[config.code] || 0;
      stockResults.push(calculateValue(name, config, price));
    }
  }
  const stocks = stockResults.sort((a, b) => Number(b.v) - Number(a.v));

  // 6. 执行资产配置分析逻辑
  const allocData: TagAllocation[] = Object.keys(TAG_RATIO_MAP).map(tag => {
    const target = TAG_RATIO_MAP[tag];
    const current = tagTotals[tag] || 0;
    const realRatio = (100 * current) / (allTotal || 1);
    const departure = realRatio - target;
    const relDev = target > 0 ? (departure / target) * 100 : (realRatio > 0 ? 100 : 0);
    return { tag, targetRatio: target, currentTotal: current, realRatio, departure, departureRatio: relDev };
  });
  
  const allocations = allocData.sort((a, b) => (b.realRatio as number) - (a.realRatio as number));

  return { globalState, stocks, allocations };
}
