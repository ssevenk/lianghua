
/**
 * 标准化数值格式化工具
 */
export const formatCurrency = (val: number, decimals: number = 0): string => {
  return val.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

export const formatPercent = (val: string | number, decimals: number = 2): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return `${num > 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

export const formatPrice = (val: number): string => {
  return `¥${val.toFixed(2)}`;
};

/**
 * 获取基于差值的符号前缀
 */
export const getDiffPrefix = (val: string | number): string => {
  return Number(val) > 0 ? '+' : '';
};
