
import { CalculatedStock, StockConfig, GlobalState, TagAllocation, PieItem } from '../types';
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
  if (stock.利润表 && stock.roic表 && stock.现金) {
    const roicTable = stock.roic表;
    const profitTable = stock.利润表;
    const cashTable = stock.现金;

    // 用近5年的roic和最新一年的roic取平均（避免低估roic在持续改善的公司）
    stock.roic =
      (roicTable[4] +
        (100 * profitTable.reduce((prev, next) => prev + next, 0)) /
          (profitTable[0] / (roicTable[0] / 100) +
            profitTable[1] / (roicTable[1] / 100) +
            profitTable[2] / (roicTable[2] / 100) +
            profitTable[3] / (roicTable[3] / 100) +
            profitTable[4] / (roicTable[4] / 100))) / 2;
    // 净现比
    stock.cashP =
      cashTable.reduce((prev, next) => prev + next, 0) /
      profitTable.reduce((prev, next) => prev + next, 0);
  } else if (stock.roic表) {
    // 沪深300没有利润表处理的，由于银行占比高，以及亏损股的存在，roic有失真，要还原
    stock.roic = (0.7 * stock.roic表.reduce((prev, cur) => prev + cur, 0)) / 5;
    stock.cashP = 1;
  } else {
    stock.roic = 0;
    stock.cashP = 1;
  }

  // 3年后的增速，取未来3年均值的70%乘以折价
  if (stock.增速 && stock.增速.length > 0) {
    stock.g =
      stock.折价 * Math.min((0.7 * stock.增速.reduce((prev, next) => prev + next, 0)) / 300, 0.1);
  } else {
    stock.g = 0;
  }
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
  const roicPe = Math.min(30, roic * cashP * zhejia);
  
  // 2. 历史估值分量 (上限 30)
  const historyPe = Math.min(30, historicalPe * zhejia);
  
  // 3. 增速计算pe
  const g1 = 1 + g;
  const growthList = stock.增速 || [0, 0, 0];
  const y2 = 1 + (growthList[1] || 0) / 100;
  const y3 = y2 * (1 + (growthList[2] || 0) / 100);
  const y4 = y3 * g1;
  const y5 = y4 * g1;
  const y6 = y5 * g1;
  const y7 = y6 * g1;
  const y8 = y7 * g1;
  const y9 = y8 * g1;
  const y10 = y9 * g1;
  
  const growPe = Math.min(
    30,
    zhejia * 1.2 * (1 + y2 + y3 + y4 + y5 + y6 + y7 + y8 + y9 + y10)
  );

  // 综合合理 PE
  const normalPe = (historyPe + roicPe + growPe) / 3;
  const zhenshiPe = price / (dynamicYield || 1);

  const calculatePev = (currPrice: number) => {
    const zPe = currPrice / (dynamicYield || 1);
    return 70 * (normalPe / (zPe || 1) - 1);
  };

  const calculatePbv = (currPrice: number) => {
    const zPe = currPrice / (dynamicYield || 1);
    const y1 = 100 / zPe;
    const dy2 = (y1 * (1 + (growthList[1] || 0) / 100)) / (1 + ZHE_XIAN);
    const dy3 = (dy2 * (1 + (growthList[2] || 0) / 100)) / (1 + ZHE_XIAN);
    const dy4 = (dy3 * (1 + g)) / (1 + ZHE_XIAN);
    const dy5 = (dy4 * (1 + g)) / (1 + ZHE_XIAN);
    const dy6 = (dy5 * (1 + g)) / (1 + ZHE_XIAN);
    const dy7 = (dy6 * (1 + g)) / (1 + ZHE_XIAN);
    const dy8 = (dy7 * (1 + g)) / (1 + ZHE_XIAN);
    const dy9 = (dy8 * (1 + g)) / (1 + ZHE_XIAN);
    const dy10 = (dy9 * (1 + g)) / (1 + ZHE_XIAN);
    return (
      (zhejia *
        (bonusRate * equityZhejia + buybackRate) *
        (y1 + dy2 + dy3 + dy4 + dy5 + dy6 + dy7 + dy8 + dy9 + dy10)) /
      100
    );
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
  pieData: PieItem[];
}> {
  const codesToFetch = new Set<string>();
  RAW_PROPERTIES.forEach(p => { if (p.code) codesToFetch.add(p.code); });
  Object.values(RAW_STOCKS).forEach(s => { if (s.code && !s.onlyPrice) codesToFetch.add(s.code); });

  const [rates, priceMap] = await Promise.all([
    fetchExchangeRates(),
    fetchStockPrices(Array.from(codesToFetch))
  ]);

  const tagTotals: Record<string, number> = {};
  const tempPieItems: PieItem[] = [];
  const otherTagTotals: Record<string, number> = {};
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

    // 饼图逻辑：如果是中港，拆分；否则按 tag 聚合
    if (total > 0) {
      if (p.tag === '中港') {
        tempPieItems.push({
          name: p.name || p.code || '未命名资产',
          value: total,
          ratio: 0
        });
      } else {
        otherTagTotals[p.tag] = (otherTagTotals[p.tag] || 0) + total;
      }
    }
  });

  const nowTotalTotal = Object.values(tagTotals).reduce((acc, curr) => acc + curr, 0);
  const allClean = nowTotalTotal - ALL_DEBT;
  const maxDebt = allDanBao * 0.25;
  const availableDebt = Math.max(0, maxDebt - ALL_DEBT);
  const allTotal = allClean + maxDebt;

  // 完成饼图数据构建
  Object.entries(otherTagTotals).forEach(([tag, val]) => {
    tempPieItems.push({ name: tag, value: val, ratio: 0 });
  });
  const pieData = tempPieItems.map(item => ({
    ...item,
    ratio: (100 * item.value) / (allTotal || 1)
  })).sort((a, b) => b.value - a.value);
  
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

  const stockResults: CalculatedStock[] = [];
  for (const [name, config] of Object.entries(RAW_STOCKS)) {
    if (!config.onlyPrice) {
      const price = priceMap[config.code] || 0;
      stockResults.push(calculateValue(name, config, price));
    }
  }
  const stocks = stockResults.sort((a, b) => Number(b.v) - Number(a.v));

  // 计算资产偏差及偏差金额
  const allocData: TagAllocation[] = Object.keys(TAG_RATIO_MAP).map(tag => {
    const targetRatio = TAG_RATIO_MAP[tag];
    const currentTotal = tagTotals[tag] || 0;
    const realRatio = (100 * currentTotal) / (allTotal || 1);
    
    // 偏差百分点
    const departure = realRatio - targetRatio;
    
    // 相对偏差率 (例如偏离了目标的 10%)
    const departureRatio = targetRatio > 0 ? (departure / targetRatio) * 100 : (realRatio > 0 ? 100 : 0);
    
    // 偏差金额计算 (人民币)
    // 目标应有金额 = 总资产 * 目标比例
    const targetAmountCNY = (allTotal * targetRatio) / 100;
    const departureAmountCNY = currentTotal - targetAmountCNY;
    
    // 换算为美元和港币 (使用 conversion_rates 比例：1 CNY = X USD)
    const departureAmountUSD = departureAmountCNY * rates.us;
    const departureAmountHKD = departureAmountCNY * rates.hk;

    return { 
      tag, 
      targetRatio, 
      currentTotal, 
      realRatio, 
      departure, 
      departureRatio,
      departureAmountCNY,
      departureAmountUSD,
      departureAmountHKD
    };
  });
  
  const allocations = allocData.sort((a, b) => (b.realRatio as number) - (a.realRatio as number));

  return { globalState, stocks, allocations, pieData };
}
