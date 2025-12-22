import type { InputData } from '../types';

/**
 * 验证输入数组是否符合题目要求
 * 要求：
 * 1. 数组长度为 n + 1
 * 2. 数字都在 [1, n] 范围内
 * 3. 只有一个重复的整数
 */
export function validateInput(input: string): InputData {
  // 尝试解析输入
  let nums: number[];
  
  try {
    // 支持多种输入格式
    const trimmed = input.trim();
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      // JSON数组格式
      nums = JSON.parse(trimmed);
    } else {
      // 逗号分隔格式
      nums = trimmed.split(/[,\s]+/).filter(s => s.length > 0).map(s => {
        const n = parseInt(s, 10);
        if (isNaN(n)) throw new Error(`无效的数字: ${s}`);
        return n;
      });
    }
  } catch {
    return {
      nums: [],
      isValid: false,
      errorMessage: '输入格式错误，请输入有效的数组，如: [1,3,4,2,2] 或 1,3,4,2,2',
    };
  }
  
  // 检查数组长度
  if (nums.length < 2) {
    return {
      nums,
      isValid: false,
      errorMessage: '数组长度至少为2',
    };
  }
  
  const n = nums.length - 1;
  
  // 检查数字范围
  for (const num of nums) {
    if (num < 1 || num > n) {
      return {
        nums,
        isValid: false,
        errorMessage: `数字 ${num} 不在有效范围 [1, ${n}] 内`,
      };
    }
  }
  
  // 检查是否有重复数字
  const count = new Map<number, number>();
  for (const num of nums) {
    count.set(num, (count.get(num) || 0) + 1);
  }
  
  let duplicateCount = 0;
  for (const [, c] of count) {
    if (c > 1) duplicateCount++;
  }
  
  if (duplicateCount === 0) {
    return {
      nums,
      isValid: false,
      errorMessage: '数组中必须有一个重复的数字',
    };
  }
  
  if (duplicateCount > 1) {
    return {
      nums,
      isValid: false,
      errorMessage: '数组中只能有一个重复的数字',
    };
  }
  
  return {
    nums,
    isValid: true,
  };
}

/**
 * 生成随机有效数组
 */
export function generateRandomArray(size: number = 5): number[] {
  // size 是 n+1，所以 n = size - 1
  const n = size - 1;
  
  // 生成 1 到 n 的数组
  const nums: number[] = [];
  for (let i = 1; i <= n; i++) {
    nums.push(i);
  }
  
  // 随机选择一个数字作为重复数
  const duplicate = Math.floor(Math.random() * n) + 1;
  nums.push(duplicate);
  
  // 打乱数组
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  return nums;
}

// 预设的示例数据
export const EXAMPLE_DATA = [
  { label: '示例1', value: [1, 3, 4, 2, 2] },
  { label: '示例2', value: [3, 1, 3, 4, 2] },
  { label: '示例3', value: [3, 3, 3, 3, 3] },
  { label: '示例4', value: [2, 5, 9, 6, 9, 3, 8, 9, 7, 1] },
];
