import { useEffect, useCallback, useRef, useState } from 'react';
import type { PlaybackState } from '../../types';
import { getSetting, saveSetting } from '../../utils/indexedDB';
import './ControlPanel.css';

interface ControlPanelProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (step: number) => void;
  stepDescription: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ControlPanel: React.FC<ControlPanelProps> = ({
  playbackState,
  onPlay,
  onPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSpeedChange,
  onSeek,
  stepDescription,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    getSetting('playback-speed').then((saved) => {
      if (saved && typeof saved === 'number') {
        onSpeedChange(saved);
      }
    });
  }, [onSpeedChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (playbackState.isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextStep();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState.isPlaying, onPlay, onPause, onPrevStep, onNextStep, onReset]);

  const handleSpeedSelect = useCallback((speed: number) => {
    onSpeedChange(speed);
    saveSetting('playback-speed', speed);
    setShowSpeedMenu(false);
  }, [onSpeedChange]);

  const handleProgressSeek = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const step = Math.round(percentage * (playbackState.totalSteps - 1));
    onSeek(step);
  }, [playbackState.totalSteps, onSeek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    handleProgressSeek(e);
  }, [handleProgressSeek]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleProgressSeek(e);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleProgressSeek]);

  const progress = playbackState.totalSteps > 0
    ? (playbackState.currentStep / (playbackState.totalSteps - 1)) * 100
    : 0;

  return (
    <div className="control-panel">
      <div className="control-row">
        <div className="step-info">
          <span className="step-counter">
            步骤 {playbackState.currentStep + 1} / {playbackState.totalSteps}
          </span>
          <span className="step-description">{stepDescription}</span>
        </div>
        
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={onPrevStep}
            disabled={playbackState.currentStep === 0}
            title="上一步"
          >
            ⏮ 上一步 <kbd>←</kbd>
          </button>
          
          <button
            className="control-btn play-btn"
            onClick={playbackState.isPlaying ? onPause : onPlay}
            title={playbackState.isPlaying ? '暂停' : '播放'}
          >
            {playbackState.isPlaying ? '⏸ 暂停' : '▶ 播放'} <kbd>Space</kbd>
          </button>
          
          <button
            className="control-btn"
            onClick={onNextStep}
            disabled={playbackState.currentStep >= playbackState.totalSteps - 1}
            title="下一步"
          >
            下一步 ⏭ <kbd>→</kbd>
          </button>
          
          <button
            className="control-btn reset-btn"
            onClick={onReset}
            title="重置"
          >
            ↺ 重置 <kbd>R</kbd>
          </button>
          
          <div className="speed-control">
            <button
              className="speed-btn"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            >
              {playbackState.speed}x ▾
            </button>
            
            {showSpeedMenu && (
              <div className="speed-menu">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    className={`speed-option ${playbackState.speed === speed ? 'active' : ''}`}
                    onClick={() => handleSpeedSelect(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div
        className="progress-bar"
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-handle"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ControlPanel;
