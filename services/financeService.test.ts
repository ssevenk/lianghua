
import { describe, it, expect } from 'vitest';
import { calculateValue } from './financeService';
import { RAW_STOCKS } from '../constants';

describe('核心估值模型算法测试 (FinanceService)', () => {
  it('验证 茅台 (SH600519) 的模型分计算稳定性', () => {
    // 1. 准备测试数据，从常量中深拷贝，避免 side effect 影响其他测试
    const name = '茅台';
    const config = JSON.parse(JSON.stringify(RAW_STOCKS[name]));
    const testPrice = 1500.00; // 设定 1500 元为基准测试价格

    // 2. 执行核心计算
    const result = calculateValue(name, config, testPrice);

    // 3. 基础输出验证
    expect(result.name).toBe('茅台');
    expect(result.price).toBe(1500.00);

    // 4. 验证预处理计算 (preprocessStock)
    // 茅台 5 年均 ROIC 及其净现比应该是稳定的
    expect(result.roic).toBeCloseTo(32.45, 1);
    expect(result.cashP).toBeCloseTo(0.965, 2);

    // 5. 验证模型分回归 (v)
    // 这是一个回归测试点。如果算法逻辑未改动，在 1500 元时的分值应当固定为 21.36
    // 此数值包含了：ROIC估值分量 + 历史PE分量 + 增速PE分量 的均值，加上分红/回购折现(calculatePbv)
    expect(result.v).toBe('21.36');

    // 6. 验证波动趋势 (+/- 5%)
    // v2 是涨5%后的分值，理应低于基准分
    expect(parseFloat(result.v2)).toBeLessThan(parseFloat(result.v));
    // v3 是跌5%后的分值，理应高于基准分
    expect(parseFloat(result.v3)).toBeGreaterThan(parseFloat(result.v));
    
    // 7. 验证具体估值指标
    // 真实 PE: 1500 / 72.65 (动态收益) = 20.647
    expect(result.zhenshiPe).toBeCloseTo(20.647, 2);
    // 合理 PE: (历史PE + ROIC折价PE + 增速PE) / 3
    expect(result.normalPe).toBeCloseTo(23.70, 1);
  });

  it('验证 沪深300 基准数据的处理分支', () => {
    const name = '沪深';
    const config = JSON.parse(JSON.stringify(RAW_STOCKS[name]));
    const testPrice = 4000;
    
    const result = calculateValue(name, config, testPrice);
    
    // 沪深300 的 ROIC 计算走的是特殊的 0.7*average 逻辑
    // 原始数据: [14.6, 15.1, 15.1, 12.7, 11.2] -> avg: 12.94 -> 12.94 * 0.7 = 9.058
    expect(result.roic).toBeCloseTo(9.058, 1);
    expect(result.cashP).toBe(1);
  });

  it('验证 极低估 时的分数反馈', () => {
    const name = '腾讯';
    const config = JSON.parse(JSON.stringify(RAW_STOCKS[name]));
    // 模拟一个极端低的股价，验证分数是否大幅上升
    const extremeLowPrice = 50.00; 
    const result = calculateValue(name, config, extremeLowPrice);
    
    expect(parseFloat(result.v)).toBeGreaterThan(100);
  });
});
