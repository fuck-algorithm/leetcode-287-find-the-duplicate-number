import React from 'react';
import { algorithmThought } from '../../algorithms/floydCycle';
import './AlgorithmThought.css';

interface AlgorithmThoughtProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlgorithmThought: React.FC<AlgorithmThoughtProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // 简单的Markdown渲染
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let key = 0;

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={key++} className="thought-code">
              <code>{codeContent}</code>
            </pre>
          );
          codeContent = '';
        }
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="thought-h2">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="thought-h3">{line.slice(4)}</h3>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={key++} className="thought-bold">{line.slice(2, -2)}</p>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={key++} className="thought-li">{line.slice(2)}</li>);
      } else if (line.match(/^\d+\. /)) {
        elements.push(<li key={key++} className="thought-li-num">{line.replace(/^\d+\. /, '')}</li>);
      } else if (line.trim()) {
        elements.push(<p key={key++} className="thought-p">{line}</p>);
      } else {
        elements.push(<br key={key++} />);
      }
    }

    return elements;
  };

  return (
    <div className="thought-overlay" onClick={onClose}>
      <div className="thought-modal" onClick={(e) => e.stopPropagation()}>
        <div className="thought-header">
          <h2 className="thought-title">💡 算法思路</h2>
          <button className="thought-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="thought-content">
          {renderMarkdown(algorithmThought)}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmThought;
