
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData } from '../services/financeService';
import { GlobalState, CalculatedStock, TagAllocation, PieItem } from '../types';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<{
    globalState: GlobalState | null;
    stocks: CalculatedStock[];
    allocations: TagAllocation[];
    pieData: PieItem[];
    lastUpdated: Date;
  }>({
    globalState: null,
    stocks: [],
    allocations: [],
    pieData: [],
    lastUpdated: new Date(),
  });

  const initData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardData();
      
      setState({
        globalState: data.globalState,
        stocks: data.stocks,
        allocations: data.allocations,
        pieData: data.pieData,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化数据时发生未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  return { ...state, loading, error, refresh: initData };
};
