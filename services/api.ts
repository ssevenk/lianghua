/**
 * 转换代码为腾讯 API 格式
 */
function formatTencentCode(code: string): string {
  const c = code.toUpperCase();
  if (c.startsWith('SH')) return 's_sh' + c.slice(2);
  if (c.startsWith('SZ')) return 's_sz' + c.slice(2);
  if (c.startsWith('HK')) return 's_hk' + c.slice(2);
  if (c.startsWith('US')) return 's_us' + c.slice(2);
  return 's_' + c.toLowerCase();
}

/**
 * 批量从腾讯财经接口拉取实时价格
 */
export async function fetchStockPrices(codes: string[]): Promise<Record<string, number>> {
  if (codes.length === 0) return {};
  
  const formattedCodes = codes.map(formatTencentCode).join(',');
  const url = `https://qt.gtimg.cn/q=${formattedCodes}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    
    const results: Record<string, number> = {};
    const lines = text.split(';').filter(line => line.trim().length > 0);
    
    lines.forEach((line, index) => {
      // 改用字符串分割替代正则表达式，避免正则解析问题
      const dataPart = line.split('="')[1];
      if (dataPart) {
        const cleanData = dataPart.split('"')[0];
        const parts = cleanData.split('~');
        // 价格通常在第 3 个索引位（腾讯简版行情）
        const price = parseFloat(parts[3]);
        results[codes[index]] = (isNaN(price) || price === 0) ? 0 : price;
      }
    });
    
    return results;
  } catch (error) {
    throw new Error(`腾讯行情接口拉取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 从外部汇率接口获取实时汇率，包含重试机制
 */
export async function fetchExchangeRates(): Promise<{ hk: number; us: number }> {
  const url = 'https://v6.exchangerate-api.com/v6/6d91a7874cfcbcaf5e118844/latest/CNY';
  let lastError = '';
  
  let retry = 3;
  while (retry > 0) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      
      if (data && data.conversion_rates) {
        return {
          hk: data.conversion_rates.HKD,
          us: data.conversion_rates.USD
        };
      } else {
        throw new Error('返回数据格式错误');
      }
    } catch (e) {
      retry -= 1;
      lastError = e instanceof Error ? e.message : '未知错误';
      if (retry > 0) {
        console.warn(`Exchange rate API attempt failed, retries left: ${retry}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待一秒重试
      }
    }
  }

  throw new Error(`汇率接口拉取失败: ${lastError}`);
}