
export interface StockConfig {
  code: string;
  折价: number;
  现金?: number[];
  roic表?: number[];
  利润表?: number[];
  历史估值?: number;
  动态收益?: number;
  增速?: number[];
  分红率?: number;
  回购率?: number;
  股权折价?: number;
  额外价值?: number;
  周期?: number;
  onlyPrice?: boolean;
  ifPrice?: number;
  // Added optional fields for preprocessing results
  roic?: number;
  cashP?: number;
  g?: number;
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
  g: number;
  roic: number;
  cashP: number;
}

// Added index signature to satisfy Recharts and other charting libraries that 
// require dynamic property access (Index signature for type 'string').
export interface TagAllocation {
  tag: string;
  targetRatio: number;
  currentTotal: number;
  realRatio: number;
  departure: number;
  departureRatio: number;
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
  availableDebt: number; // 虚金 (剩余可用债务)
  yield: string;
  miAsset: number;
  maAsset: number;
  myAsset: number;
}
