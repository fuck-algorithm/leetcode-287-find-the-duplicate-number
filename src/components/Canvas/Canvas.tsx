import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep, CanvasState } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
  nums: number[];
}

const Canvas: React.FC<CanvasProps> = ({ currentStep, nums }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    
    const svg = d3.select(svgElement);
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k,
        });
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (svg as any).call(zoom);

    const initialTransform = d3.zoomIdentity
      .translate(dimensions.width / 2 - 400, dimensions.height / 2 - 200)
      .scale(0.9);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (svg as any).call(zoom.transform, initialTransform);

    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions]);

  useEffect(() => {
    if (!svgRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('.canvas-content');
    
    g.selectAll('*').remove();

    const state = currentStep.canvasState;
    
    drawArray(g, state, nums);
    drawLinkedList(g, state, nums);
    drawPointers(g, state);
    drawAnnotations(g, state);
    
  }, [currentStep, nums]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-header">
        <span className="canvas-title">可视化画布</span>
        <span className="canvas-hint">拖动平移 | 滚轮缩放</span>
      </div>
      <svg
        ref={svgRef}
        className="canvas-svg"
        width={dimensions.width}
        height={dimensions.height - 40}
      >
        <g
          className="canvas-content"
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        />
      </svg>
      {currentStep?.canvasState.foundDuplicate !== undefined && (
        <div className="result-badge">
          找到重复数字: {currentStep.canvasState.foundDuplicate}
        </div>
      )}
    </div>
  );
};

function drawArray(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  state: CanvasState,
  nums: number[]
) {
  const arrayGroup = g.append('g').attr('class', 'array-group');
  
  arrayGroup.append('text')
    .attr('x', 50)
    .attr('y', 30)
    .attr('fill', '#a0aec0')
    .attr('font-size', '14px')
    .text('数组 nums[]');
  
  const indexGroup = arrayGroup.append('g').attr('class', 'index-row');
  nums.forEach((_, i) => {
    indexGroup.append('text')
      .attr('x', 50 + i * 60 + 25)
      .attr('y', 55)
      .attr('fill', '#718096')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .text(i);
  });
  
  const cellWidth = 50;
  const cellHeight = 40;
  const startX = 50;
  const startY = 60;
  
  state.arrayElements.forEach((elem, i) => {
    const cellGroup = arrayGroup.append('g')
      .attr('class', 'array-cell')
      .attr('transform', `translate(${startX + i * 60}, ${startY})`);
    
    let fillColor = '#2d3748';
    if (elem.isResult) {
      fillColor = '#38a169';
    } else if (elem.highlighted) {
      fillColor = '#4a5568';
    }
    
    cellGroup.append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 4)
      .attr('fill', fillColor)
      .attr('stroke', elem.highlighted ? '#63b3ed' : '#4a5568')
      .attr('stroke-width', elem.highlighted ? 2 : 1);
    
    cellGroup.append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight / 2 + 5)
      .attr('fill', '#f7fafc')
      .attr('font-size', '16px')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .text(elem.value);
  });
  
  arrayGroup.append('text')
    .attr('x', 50)
    .attr('y', 130)
    .attr('fill', '#718096')
    .attr('font-size', '12px')
    .text('映射关系: nums[i] 表示从节点 i 指向节点 nums[i]');
}

function drawLinkedList(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  state: CanvasState,
  nums: number[]
) {
  const linkedListGroup = g.append('g')
    .attr('class', 'linkedlist-group')
    .attr('transform', 'translate(0, 150)');
  
  linkedListGroup.append('text')
    .attr('x', 50)
    .attr('y', 20)
    .attr('fill', '#a0aec0')
    .attr('font-size', '14px')
    .text('链表视图（环形结构）');
  
  const nodeRadius = 25;
  
  const visited = new Set<number>();
  const path: number[] = [];
  let current = 0;
  
  while (!visited.has(current) && current < nums.length) {
    visited.add(current);
    path.push(current);
    current = nums[current];
  }
  
  const positions: { [key: number]: { x: number; y: number } } = {};
  const cycleStartIdx = path.indexOf(current);
  const preCycle = path.slice(0, cycleStartIdx);
  const cycle = cycleStartIdx >= 0 ? path.slice(cycleStartIdx) : [];
  
  preCycle.forEach((idx, i) => {
    positions[idx] = {
      x: 100 + i * 80,
      y: 80,
    };
  });
  
  if (cycle.length > 0) {
    const cycleRadius = Math.max(60, cycle.length * 20);
    const cycleCenterX = 100 + preCycle.length * 80 + cycleRadius;
    const cycleCenterY = 120;
    
    cycle.forEach((idx, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / cycle.length;
      positions[idx] = {
        x: cycleCenterX + cycleRadius * Math.cos(angle),
        y: cycleCenterY + cycleRadius * Math.sin(angle),
      };
    });
  }
  
  const arrowGroup = linkedListGroup.append('g').attr('class', 'arrows');
  
  const defs = g.append('defs');
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#4a5568');
  
  for (let i = 0; i < path.length; i++) {
    const fromIdx = path[i];
    const toIdx = nums[fromIdx];
    
    if (positions[fromIdx] && positions[toIdx]) {
      const from = positions[fromIdx];
      const to = positions[toIdx];
      
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const startX = from.x + (dx / dist) * nodeRadius;
        const startY = from.y + (dy / dist) * nodeRadius;
        const endX = to.x - (dx / dist) * (nodeRadius + 5);
        const endY = to.y - (dy / dist) * (nodeRadius + 5);
        
        arrowGroup.append('line')
          .attr('x1', startX)
          .attr('y1', startY)
          .attr('x2', endX)
          .attr('y2', endY)
          .attr('stroke', '#4a5568')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)');
      }
    }
  }
  
  const nodesGroup = linkedListGroup.append('g').attr('class', 'nodes');
  
  for (const idx of path) {
    if (!positions[idx]) continue;
    
    const pos = positions[idx];
    const node = state.linkedListNodes.find(n => n.id === `node-${idx}`);
    const isHighlighted = node?.highlighted || false;
    const isCycleEntry = node?.isCycleEntry || false;
    const isInCycle = cycle.includes(idx);
    
    const nodeGroup = nodesGroup.append('g')
      .attr('transform', `translate(${pos.x}, ${pos.y})`);
    
    let fillColor = '#2d3748';
    let strokeColor = '#4a5568';
    
    if (isCycleEntry) {
      fillColor = '#38a169';
      strokeColor = '#48bb78';
    } else if (isHighlighted) {
      fillColor = '#3182ce';
      strokeColor = '#63b3ed';
    } else if (isInCycle) {
      fillColor = '#744210';
      strokeColor = '#d69e2e';
    }
    
    nodeGroup.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      .attr('stroke-width', isHighlighted ? 3 : 2);
    
    nodeGroup.append('text')
      .attr('y', 5)
      .attr('fill', '#f7fafc')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .text(nums[idx]);
    
    nodeGroup.append('text')
      .attr('y', -nodeRadius - 8)
      .attr('fill', '#718096')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .text(`[${idx}]`);
  }
  
  if (cycleStartIdx >= 0 && positions[current]) {
    const entryPos = positions[current];
    linkedListGroup.append('text')
      .attr('x', entryPos.x)
      .attr('y', entryPos.y + nodeRadius + 20)
      .attr('fill', '#48bb78')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('环入口');
  }
}

function drawPointers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  state: CanvasState
) {
  if (state.pointers.length === 0) return;
  
  const pointerGroup = g.append('g')
    .attr('class', 'pointer-group')
    .attr('transform', 'translate(0, 0)');
  
  const startX = 50;
  const startY = 60;
  const cellWidth = 60;
  const cellHeight = 40;
  
  state.pointers.forEach((pointer, i) => {
    const x = startX + pointer.targetIndex * cellWidth + 25;
    const y = startY + cellHeight + 15 + i * 25;
    
    pointerGroup.append('path')
      .attr('d', `M${x},${y} L${x-8},${y+12} L${x+8},${y+12} Z`)
      .attr('fill', pointer.color);
    
    pointerGroup.append('text')
      .attr('x', x)
      .attr('y', y + 28)
      .attr('fill', pointer.color)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .text(pointer.label);
  });
}

function drawAnnotations(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  state: CanvasState
) {
  if (state.annotations.length === 0) return;
  
  const annotationGroup = g.append('g').attr('class', 'annotation-group');
  
  state.annotations.forEach((annotation) => {
    annotationGroup.append('text')
      .attr('x', annotation.x)
      .attr('y', annotation.y)
      .attr('fill', annotation.color)
      .attr('font-size', annotation.fontSize || 14)
      .attr('text-anchor', 'middle')
      .text(annotation.text);
  });
}

export default Canvas;
