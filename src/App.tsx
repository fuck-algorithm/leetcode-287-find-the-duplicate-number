import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import DataInput from './components/DataInput';
import CodePanel from './components/CodePanel';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import AlgorithmThought from './components/AlgorithmThought';
import WeChatFloat from './components/WeChatFloat';
import { generateSteps } from './algorithms/stepGenerator';
import type { PlaybackState, InputData } from './types';
import './App.css';

const INITIAL_DATA = [1, 3, 4, 2, 2];

function App() {
  const [nums, setNums] = useState<number[]>(INITIAL_DATA);
  const [showThought, setShowThought] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
  });
  
  const playIntervalRef = useRef<number | null>(null);

  // 使用useMemo计算步骤，避免在useEffect中调用setState
  const steps = useMemo(() => generateSteps(nums), [nums]);

  // 当步骤变化时重置播放状态
  useEffect(() => {
    setPlaybackState((prev) => ({
      ...prev,
      currentStep: 0,
      totalSteps: steps.length,
      isPlaying: false,
    }));
    
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, [steps]);

  const handleDataChange = useCallback((data: InputData) => {
    if (data.isValid) {
      setNums(data.nums);
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (playbackState.currentStep >= playbackState.totalSteps - 1) {
      setPlaybackState((prev) => ({ ...prev, currentStep: 0, isPlaying: true }));
    } else {
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [playbackState.currentStep, playbackState.totalSteps]);

  const handlePause = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handlePrevStep = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      isPlaying: false,
    }));
  }, []);

  const handleNextStep = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.totalSteps - 1, prev.currentStep + 1),
      isPlaying: false,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
    }));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackState((prev) => ({ ...prev, speed }));
  }, []);

  const handleSeek = useCallback((step: number) => {
    setPlaybackState((prev) => ({
      ...prev,
      currentStep: step,
      isPlaying: false,
    }));
  }, []);

  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    if (playbackState.isPlaying) {
      const interval = 1500 / playbackState.speed;
      playIntervalRef.current = window.setInterval(() => {
        setPlaybackState((prev) => {
          if (prev.currentStep >= prev.totalSteps - 1) {
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [playbackState.isPlaying, playbackState.speed]);

  const currentStep = steps[playbackState.currentStep] || null;

  return (
    <div className="app">
      <Header onShowThought={() => setShowThought(true)} />
      <DataInput onDataChange={handleDataChange} currentData={nums} />
      <div className="main-content">
        <div className="left-panel">
          <CodePanel currentStep={currentStep} />
        </div>
        <div className="right-panel">
          <Canvas currentStep={currentStep} nums={nums} />
        </div>
      </div>
      <ControlPanel
        playbackState={playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        onSeek={handleSeek}
        stepDescription={currentStep?.description || ''}
      />
      <AlgorithmThought isOpen={showThought} onClose={() => setShowThought(false)} />
      <WeChatFloat />
    </div>
  );
}

export default App;
