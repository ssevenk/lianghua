
/**
 * 标准化数值格式化工具
 */
export const formatCurrency = (val: number | undefined | null, decimals: number = 0): string => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return val.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

export const formatPercent = (val: string | number | undefined | null, decimals: number = 2): string => {
  if (val === undefined || val === null) return '0.00%';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00%';
  return `${num > 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

export const formatPrice = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '¥0.00';
  return `¥${val.toFixed(2)}`;
};

/**
 * 获取基于差值的符号前缀
 */
export const getDiffPrefix = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  return Number(val) > 0 ? '+' : '';
};
