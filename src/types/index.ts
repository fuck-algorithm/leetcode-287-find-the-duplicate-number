// 算法步骤类型
export interface AlgorithmStep {
  id: number;
  description: string;
  // 代码行高亮 - 支持多语言
  codeLines: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  // 变量状态
  variables: {
    name: string;
    value: string | number;
    line: number; // 显示在哪一行旁边
  }[];
  // 画布状态
  canvasState: CanvasState;
}

// 画布状态
export interface CanvasState {
  // 数组元素
  arrayElements: ArrayElement[];
  // 链表节点（用于展示映射关系）
  linkedListNodes: LinkedListNode[];
  // 指针
  pointers: Pointer[];
  // 箭头/连线
  arrows: Arrow[];
  // 标注文本
  annotations: Annotation[];
  // 高亮的数组索引
  highlightedIndices: number[];
  // 当前找到的重复数
  foundDuplicate?: number;
}

// 数组元素
export interface ArrayElement {
  index: number;
  value: number;
  x: number;
  y: number;
  highlighted: boolean;
  visited: boolean;
  isResult?: boolean;
}

// 链表节点
export interface LinkedListNode {
  id: string;
  value: number;
  x: number;
  y: number;
  highlighted: boolean;
  isInCycle: boolean;
  isCycleEntry?: boolean;
}

// 指针
export interface Pointer {
  name: string;
  targetIndex: number;
  color: string;
  label: string;
}

// 箭头
export interface Arrow {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label?: string;
  color: string;
  animated?: boolean;
  dashed?: boolean;
}

// 标注
export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize?: number;
}

// 支持的编程语言
export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// 输入数据
export interface InputData {
  nums: number[];
  isValid: boolean;
  errorMessage?: string;
}
