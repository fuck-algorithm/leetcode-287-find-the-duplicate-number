import type { AlgorithmStep, CanvasState, ArrayElement, LinkedListNode } from '../types';

// 计算数组元素位置
function calculateArrayPositions(nums: number[], startX: number, startY: number, cellWidth: number): ArrayElement[] {
  return nums.map((value, index) => ({
    index,
    value,
    x: startX + index * cellWidth,
    y: startY,
    highlighted: false,
    visited: false,
  }));
}

// 计算链表节点位置（环形布局）
function calculateLinkedListPositions(nums: number[]): LinkedListNode[] {
  const nodes: LinkedListNode[] = [];
  const visited = new Set<number>();
  const positions: { [key: number]: { x: number; y: number } } = {};
  
  // 找出链表路径
  const path: number[] = [];
  let current = 0;
  while (!visited.has(current) && current < nums.length) {
    visited.add(current);
    path.push(current);
    current = nums[current];
  }
  
  // 找到环的部分
  const cycleStartIdx = path.indexOf(current);
  const preCycle = path.slice(0, cycleStartIdx);
  const cycle = cycleStartIdx >= 0 ? path.slice(cycleStartIdx) : [];
  
  // 布局前环部分（水平排列）
  const preCycleStartX = 100;
  const preCycleY = 80;
  preCycle.forEach((idx, i) => {
    positions[idx] = {
      x: preCycleStartX + i * 80,
      y: preCycleY,
    };
  });
  
  // 布局环部分（圆形排列）
  if (cycle.length > 0) {
    const cycleRadius = Math.max(60, cycle.length * 20);
    const cycleCenterX = preCycleStartX + preCycle.length * 80 + cycleRadius;
    const cycleCenterY = 120;
    
    cycle.forEach((idx, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / cycle.length;
      positions[idx] = {
        x: cycleCenterX + cycleRadius * Math.cos(angle),
        y: cycleCenterY + cycleRadius * Math.sin(angle),
      };
    });
  }
  
  // 创建节点
  for (const idx of path) {
    const pos = positions[idx];
    nodes.push({
      id: `node-${idx}`,
      value: nums[idx],
      x: pos.x,
      y: pos.y,
      highlighted: false,
      isInCycle: cycle.includes(idx),
      isCycleEntry: idx === current,
    });
  }
  
  return nodes;
}

// 生成算法步骤
export function generateSteps(nums: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepId = 0;
  
  const arrayStartX = 50;
  const arrayStartY = 50;
  const cellWidth = 60;
  const linkedListCenterX = 400;
  
  // 计算链表节点位置
  const linkedListNodes = calculateLinkedListPositions(nums);
  
  // 创建基础画布状态
  const createBaseCanvasState = (): CanvasState => ({
    arrayElements: calculateArrayPositions(nums, arrayStartX, arrayStartY, cellWidth),
    linkedListNodes: JSON.parse(JSON.stringify(linkedListNodes)),
    pointers: [],
    arrows: [],
    annotations: [],
    highlightedIndices: [],
  });
  
  // 步骤0：初始化
  const initState = createBaseCanvasState();
  initState.annotations.push({
    id: 'init-annotation',
    x: linkedListCenterX,
    y: 50,
    text: '将数组看作链表：nums[i] 表示节点 i 指向的下一个节点',
    color: '#666',
    fontSize: 14,
  });
  
  steps.push({
    id: stepId++,
    description: '初始化：将数组看作链表，nums[i] 表示从节点 i 指向节点 nums[i]',
    codeLines: { java: [3, 4], python: [3, 4], golang: [2, 3], javascript: [2, 3] },
    variables: [
      { name: 'slow', value: 0, line: 3 },
      { name: 'fast', value: 0, line: 4 },
    ],
    canvasState: initState,
  });
  
  // 模拟算法执行
  let slow = 0;
  let fast = 0;
  
  // 第一步移动
  slow = nums[slow];
  fast = nums[nums[fast]];
  
  const step1State = createBaseCanvasState();
  step1State.pointers = [
    { name: 'slow', targetIndex: slow, color: '#4CAF50', label: 'slow' },
    { name: 'fast', targetIndex: fast, color: '#F44336', label: 'fast' },
  ];
  step1State.arrayElements[slow].highlighted = true;
  step1State.arrayElements[fast].highlighted = true;
  step1State.annotations.push({
    id: 'phase1-start',
    x: linkedListCenterX,
    y: 50,
    text: '第一阶段：快慢指针找相遇点',
    color: '#1976D2',
    fontSize: 16,
  });
  
  // 高亮链表节点
  const slowNode1 = step1State.linkedListNodes.find(n => n.id === `node-${slow}`);
  const fastNode1 = step1State.linkedListNodes.find(n => n.id === `node-${fast}`);
  if (slowNode1) slowNode1.highlighted = true;
  if (fastNode1) fastNode1.highlighted = true;
  
  steps.push({
    id: stepId++,
    description: `第一阶段开始：slow走一步到${slow}，fast走两步到${fast}`,
    codeLines: { java: [6, 7], python: [6, 7], golang: [5, 6], javascript: [5, 6] },
    variables: [
      { name: 'slow', value: slow, line: 6 },
      { name: 'fast', value: fast, line: 7 },
    ],
    canvasState: step1State,
  });
  
  // 循环直到相遇
  let iteration = 0;
  const maxIterations = nums.length * 2; // 防止无限循环
  
  while (slow !== fast && iteration < maxIterations) {
    const prevSlow = slow;
    const prevFast = fast;
    
    slow = nums[slow];
    fast = nums[nums[fast]];
    iteration++;
    
    const loopState = createBaseCanvasState();
    loopState.pointers = [
      { name: 'slow', targetIndex: slow, color: '#4CAF50', label: 'slow' },
      { name: 'fast', targetIndex: fast, color: '#F44336', label: 'fast' },
    ];
    
    // 高亮当前位置
    loopState.arrayElements[slow].highlighted = true;
    loopState.arrayElements[fast].highlighted = true;
    
    // 添加移动箭头
    loopState.arrows.push({
      id: `slow-move-${iteration}`,
      fromX: arrayStartX + prevSlow * cellWidth + cellWidth / 2,
      fromY: arrayStartY + 40,
      toX: arrayStartX + slow * cellWidth + cellWidth / 2,
      toY: arrayStartY + 40,
      label: 'slow',
      color: '#4CAF50',
      animated: true,
    });
    
    // 高亮链表节点
    const slowNode = loopState.linkedListNodes.find(n => n.id === `node-${slow}`);
    const fastNode = loopState.linkedListNodes.find(n => n.id === `node-${fast}`);
    if (slowNode) slowNode.highlighted = true;
    if (fastNode) fastNode.highlighted = true;
    
    loopState.annotations.push({
      id: 'phase1-loop',
      x: linkedListCenterX,
      y: 50,
      text: `第一阶段：寻找相遇点 (迭代 ${iteration})`,
      color: '#1976D2',
      fontSize: 16,
    });
    
    steps.push({
      id: stepId++,
      description: `slow: ${prevSlow} → ${slow}, fast: ${prevFast} → ${fast}`,
      codeLines: { java: [8, 9, 10], python: [8, 9, 10], golang: [7, 8, 9], javascript: [7, 8, 9] },
      variables: [
        { name: 'slow', value: slow, line: 9 },
        { name: 'fast', value: fast, line: 10 },
      ],
      canvasState: loopState,
    });
  }
  
  // 相遇点
  const meetState = createBaseCanvasState();
  meetState.pointers = [
    { name: 'slow', targetIndex: slow, color: '#4CAF50', label: 'slow' },
    { name: 'fast', targetIndex: fast, color: '#F44336', label: 'fast' },
  ];
  meetState.arrayElements[slow].highlighted = true;
  meetState.annotations.push({
    id: 'meet-point',
    x: linkedListCenterX,
    y: 50,
    text: `相遇点：位置 ${slow}，值为 ${nums[slow]}`,
    color: '#FF9800',
    fontSize: 16,
  });
  
  const meetNode = meetState.linkedListNodes.find(n => n.id === `node-${slow}`);
  if (meetNode) meetNode.highlighted = true;
  
  steps.push({
    id: stepId++,
    description: `快慢指针在位置 ${slow} 相遇！`,
    codeLines: { java: [12, 13], python: [11, 12], golang: [11, 12], javascript: [11, 12] },
    variables: [
      { name: 'slow', value: slow, line: 12 },
      { name: 'fast', value: fast, line: 12 },
    ],
    canvasState: meetState,
  });
  
  // 第二阶段：找环入口
  let pre1 = 0;
  let pre2 = slow;
  
  const phase2StartState = createBaseCanvasState();
  phase2StartState.pointers = [
    { name: 'pre1', targetIndex: pre1, color: '#9C27B0', label: 'pre1' },
    { name: 'pre2', targetIndex: pre2, color: '#00BCD4', label: 'pre2' },
  ];
  phase2StartState.arrayElements[pre1].highlighted = true;
  phase2StartState.arrayElements[pre2].highlighted = true;
  phase2StartState.annotations.push({
    id: 'phase2-start',
    x: linkedListCenterX,
    y: 50,
    text: '第二阶段：从起点和相遇点同时出发找环入口',
    color: '#1976D2',
    fontSize: 16,
  });
  
  const pre1Node = phase2StartState.linkedListNodes.find(n => n.id === `node-${pre1}`);
  const pre2Node = phase2StartState.linkedListNodes.find(n => n.id === `node-${pre2}`);
  if (pre1Node) pre1Node.highlighted = true;
  if (pre2Node) pre2Node.highlighted = true;
  
  steps.push({
    id: stepId++,
    description: `第二阶段开始：pre1从起点0出发，pre2从相遇点${slow}出发`,
    codeLines: { java: [13, 14], python: [12, 13], golang: [12, 13], javascript: [12, 13] },
    variables: [
      { name: 'pre1', value: pre1, line: 13 },
      { name: 'pre2', value: pre2, line: 14 },
    ],
    canvasState: phase2StartState,
  });
  
  // 循环直到找到环入口
  iteration = 0;
  while (pre1 !== pre2 && iteration < maxIterations) {
    const prevPre1 = pre1;
    const prevPre2 = pre2;
    
    pre1 = nums[pre1];
    pre2 = nums[pre2];
    iteration++;
    
    const phase2LoopState = createBaseCanvasState();
    phase2LoopState.pointers = [
      { name: 'pre1', targetIndex: pre1, color: '#9C27B0', label: 'pre1' },
      { name: 'pre2', targetIndex: pre2, color: '#00BCD4', label: 'pre2' },
    ];
    phase2LoopState.arrayElements[pre1].highlighted = true;
    phase2LoopState.arrayElements[pre2].highlighted = true;
    
    // 高亮链表节点
    const p1Node = phase2LoopState.linkedListNodes.find(n => n.id === `node-${pre1}`);
    const p2Node = phase2LoopState.linkedListNodes.find(n => n.id === `node-${pre2}`);
    if (p1Node) p1Node.highlighted = true;
    if (p2Node) p2Node.highlighted = true;
    
    phase2LoopState.annotations.push({
      id: 'phase2-loop',
      x: linkedListCenterX,
      y: 50,
      text: `第二阶段：寻找环入口 (迭代 ${iteration})`,
      color: '#1976D2',
      fontSize: 16,
    });
    
    steps.push({
      id: stepId++,
      description: `pre1: ${prevPre1} → ${pre1}, pre2: ${prevPre2} → ${pre2}`,
      codeLines: { java: [15, 16, 17], python: [14, 15, 16], golang: [14, 15, 16], javascript: [14, 15, 16] },
      variables: [
        { name: 'pre1', value: pre1, line: 16 },
        { name: 'pre2', value: pre2, line: 17 },
      ],
      canvasState: phase2LoopState,
    });
  }
  
  // 找到重复数字 - 注意：pre1 就是重复的数字（环入口的索引）
  const resultState = createBaseCanvasState();
  // 高亮所有值等于 pre1 的数组元素
  resultState.arrayElements.forEach((elem, idx) => {
    if (elem.value === pre1) {
      elem.isResult = true;
      elem.highlighted = true;
    }
    // 也高亮索引为 pre1 的元素
    if (idx === pre1) {
      elem.highlighted = true;
    }
  });
  resultState.foundDuplicate = pre1;
  resultState.annotations.push({
    id: 'result',
    x: linkedListCenterX,
    y: 50,
    text: `找到重复数字：${pre1}`,
    color: '#4CAF50',
    fontSize: 20,
  });
  
  const resultNode = resultState.linkedListNodes.find(n => n.id === `node-${pre1}`);
  if (resultNode) {
    resultNode.highlighted = true;
    resultNode.isCycleEntry = true;
  }
  
  steps.push({
    id: stepId++,
    description: `找到重复数字：${pre1}（环的入口点）`,
    codeLines: { java: [19], python: [17], golang: [18], javascript: [18] },
    variables: [
      { name: 'pre1', value: pre1, line: 19 },
      { name: 'result', value: pre1, line: 19 },
    ],
    canvasState: resultState,
  });
  
  return steps;
}
