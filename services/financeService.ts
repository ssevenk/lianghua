/**
 * ====================================================================
 * 【核心算法保护声明】
 * 未经用户明确允许，禁止修改此文件中的任何估值逻辑、预处理公式或业务聚合函数。
 * 此文件包含系统的核心建模逻辑：ROIC 计算、折现模型 (DCF 变体) 及资产配比算法。
 * ====================================================================
 */

import { CalculatedStock, StockConfig, GlobalState, TagAllocation, PieItem } from '../types';
import {
  ZHE_XIAN,
  RAW_PROPERTIES,
  RAW_STOCKS,
  TAG_RATIO_MAP,
  MI_RATIO,
  MA_RATIO,
  ALL_DEBT,
  MA_YEAR_START_ASSET,
} from '../constants';
import { fetchStockPrices, fetchExchangeRates } from './api';

/**
 * 核心建模计算：根据折现模型和估值指标计算个股合理分值
 */
export const calculateValue = (name: string, stock: StockConfig, price: number): CalculatedStock => {
  // 目标价格pe计算,封顶30
  const normalPe = Math.min(30, (stock.目标价格 || 0) / stock.动态收益)

  // 沪深300没有目标价格，只用历史pe和growpe来算
  const zhenshiPe = price / stock.动态收益

  const calculatePev = (currPrice: number) => {
    const zPe = currPrice / stock.动态收益;
    // 沪深300没有目标价，不做pe价值计算
    if (!normalPe) return 0;
    // 估值回归有时间和预测上的不确定性，按大概率(70%)来算
    return 70 * (normalPe / (zPe || 1) - 1)
  };

  const calculatePbv = (currPrice: number) => {
    const zPe = currPrice / stock.动态收益 || 1;
    const y1 = 100 / zPe;
    const g = 1 + (stock.远期增速 || 0) / 100
    const g1 = 1 + (stock.g1 || 0) / 100
    const g2 = 1 + (stock.g2 || 0) / 100
    const dy2 = (y1 * g1) / (1 + ZHE_XIAN);
    const dy3 = (dy2 * g2) / (1 + ZHE_XIAN);
    const dy4 = (dy3 * g) / (1 + ZHE_XIAN);
    const dy5 = (dy4 * g) / (1 + ZHE_XIAN);
    const dy6 = (dy5 * g) / (1 + ZHE_XIAN);
    const dy7 = (dy6 * g) / (1 + ZHE_XIAN);
    const dy8 = (dy7 * g) / (1 + ZHE_XIAN);
    const dy9 = (dy8 * g) / (1 + ZHE_XIAN);
    const dy10 = (dy9 * g) / (1 + ZHE_XIAN);
    return ((stock.分红率 || 0) * (stock.股权折价 || 0) + (stock.回购率 || 0)) *
      (y1 + dy2 + dy3 + dy4 + dy5 + dy6 + dy7 + dy8 + dy9 + dy10) / 100
  };

  // 不确定性的企业，减去一档的风险溢价
  const v1Num = calculatePev(price) + calculatePbv(price) + (stock.额外价值 || 0) - (!stock.确定性 ? 20 : 0)
  const v1 = v1Num.toFixed(2);

  const p2 = price * 1.05;
  const v2 = (calculatePev(p2) + calculatePbv(p2) + (stock.额外价值 || 0) - (!stock.确定性 ? 20 : 0)).toFixed(2);

  const p3 = price * 0.95;
  const v3 = (calculatePev(p3) + calculatePbv(p3) + (stock.额外价值 || 0) - (!stock.确定性 ? 20 : 0)).toFixed(2);

  return { ...stock, name, price, v: v1, v2, v3, p2, p3, zhenshiPe, normalPe };
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
  let allDanBao = -ALL_DEBT;

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
  const availableDebt = maxDebt - ALL_DEBT
  const allTotal = allClean + Math.max(maxDebt, ALL_DEBT)

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
  let debtRatio = Math.floor((100 * (allDanBao + ALL_DEBT)) / ALL_DEBT);
  if (isNaN(debtRatio)) {
    debtRatio = 0
  }

  const globalState: GlobalState = {
    exchange: rates,
    allClean,
    allDanBao,
    allTotal,
    debt: ALL_DEBT,
    debtRatio,
    availableDebt,
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