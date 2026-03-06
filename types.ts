
export interface StockConfig {
  code: string;
  历史估值?: number;
  目标价格?: number;
  动态收益: number;
  g1?: number; // 未来第一年
  g2?: number; // 未来第二年
  远期增速?: number;
  分红率?: number;
  回购率?: number;
  股权折价?: number;
  额外价值?: number;
  onlyPrice?: boolean;
  ifPrice?: number;
  roic?: number;
  cashP?: number;
  确定性?: boolean; // 指股东能获得上述中性利润的概率有多大，基于商业模式等六维度表得出
}

export interface Property {
  code?: string;
  tag: string;
  num: number;
  name?: string;
  exchange?: 'us' | 'hk' | 'hs';
  danbao?: boolean;
  ifPrice?: number;
}

export interface CalculatedStock extends StockConfig {
  name: string;
  price: number;
  v: string;
  v2: string;
  v3: string;
  p2: number;
  p3: number;
  zhenshiPe: number;
  normalPe: number;
  normalPb?: number;
}

export interface TagAllocation {
  tag: string;
  targetRatio: number;
  currentTotal: number;
  realRatio: number;
  departure: number;
  departureRatio: number;
  departureAmountCNY: number;
  departureAmountUSD: number;
  departureAmountHKD: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PieItem {
  name: string;
  value: number;
  ratio: number;
  // Fix: Add index signature to allow Recharts to access properties dynamically
  [key: string]: string | number | boolean | undefined;
}

export interface GlobalState {
  exchange: {
    us: number;
    hk: number;
  };
  allClean: number;
  allDanBao: number;
  allTotal: number;
  debt: number;
  debtRatio: number;
  availableDebt: number;
  yield: string;
  miAsset: number;
  maAsset: number;
  myAsset: number;
}
