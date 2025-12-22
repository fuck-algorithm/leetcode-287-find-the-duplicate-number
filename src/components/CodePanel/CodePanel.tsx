import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ProgrammingLanguage, AlgorithmStep } from '../../types';
import { algorithmCode } from '../../algorithms/floydCycle';
import { getSetting, saveSetting } from '../../utils/indexedDB';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript',
};

// 语法高亮的token类型
interface Token {
  type: 'keyword' | 'comment' | 'number' | 'string' | 'text';
  value: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ currentStep }) => {
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');

  useEffect(() => {
    getSetting('preferred-language').then((saved) => {
      if (saved && typeof saved === 'string') {
        setLanguage(saved as ProgrammingLanguage);
      }
    });
  }, []);

  const handleLanguageChange = useCallback((lang: ProgrammingLanguage) => {
    setLanguage(lang);
    saveSetting('preferred-language', lang);
  }, []);

  const code = algorithmCode[language];
  const lines = code.split('\n');
  const highlightedLines = currentStep?.codeLines[language] || [];
  
  const variableValues = useMemo(() => {
    if (!currentStep) return new Map<number, string>();
    const map = new Map<number, string>();
    currentStep.variables.forEach(v => {
      const existing = map.get(v.line);
      if (existing) {
        map.set(v.line, `${existing}, ${v.name}=${v.value}`);
      } else {
        map.set(v.line, `${v.name}=${v.value}`);
      }
    });
    return map;
  }, [currentStep]);

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-title">算法代码</span>
        <div className="language-tabs">
          {(Object.keys(LANGUAGE_LABELS) as ProgrammingLanguage[]).map((lang) => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="code-content">
        <pre className="code-pre">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightedLines.includes(lineNum);
            const variableInfo = variableValues.get(lineNum);
            const tokens = tokenizeLine(line, language);
            
            return (
              <div
                key={index}
                className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
              >
                <span className="line-number">{lineNum}</span>
                <span className="line-content">
                  <code>
                    {tokens.map((token, i) => (
                      <span key={i} className={token.type === 'text' ? '' : token.type}>
                        {token.value}
                      </span>
                    ))}
                  </code>
                </span>
                {variableInfo && isHighlighted && (
                  <span className="variable-value">{variableInfo}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};

// 将代码行分解为tokens
function tokenizeLine(line: string, language: ProgrammingLanguage): Token[] {
  const tokens: Token[] = [];
  
  const keywords: Record<ProgrammingLanguage, string[]> = {
    java: ['class', 'public', 'int', 'while', 'return', 'new', 'private', 'static', 'void', 'if', 'else', 'for'],
    python: ['class', 'def', 'while', 'return', 'self', 'if', 'else', 'for', 'in', 'import', 'from', 'List'],
    golang: ['func', 'for', 'return', 'int', 'var', 'if', 'else', 'package', 'import', 'type', 'struct'],
    javascript: ['var', 'let', 'const', 'function', 'while', 'return', 'if', 'else', 'for', 'new'],
  };
  
  const keywordSet = new Set(keywords[language]);
  const commentStart = language === 'python' ? '#' : '//';
  
  // 检查是否有注释
  const commentIndex = line.indexOf(commentStart);
  const codePart = commentIndex >= 0 ? line.substring(0, commentIndex) : line;
  const commentPart = commentIndex >= 0 ? line.substring(commentIndex) : '';
  
  // 处理代码部分
  if (codePart) {
    // 使用正则分割，保留分隔符
    const parts = codePart.split(/(\s+|[{}()[\];,=!<>+\-*/.])/);
    
    for (const part of parts) {
      if (!part) continue;
      
      if (keywordSet.has(part)) {
        tokens.push({ type: 'keyword', value: part });
      } else if (/^\d+$/.test(part)) {
        tokens.push({ type: 'number', value: part });
      } else if (/^".*"$/.test(part) || /^'.*'$/.test(part)) {
        tokens.push({ type: 'string', value: part });
      } else {
        tokens.push({ type: 'text', value: part });
      }
    }
  }
  
  // 添加注释部分
  if (commentPart) {
    tokens.push({ type: 'comment', value: commentPart });
  }
  
  return tokens;
}

export default CodePanel;
