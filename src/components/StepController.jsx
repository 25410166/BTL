import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Info,
  CheckCircle2,
} from './Icons';

export function StepController({
  steps = [],
  currentStepIndex = 0,
  isPlaying = false,
  playbackSpeed = 1,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onJumpToStep,
  onChangeSpeed,
}) {
  const currentStep = steps[currentStepIndex] || null;
  const totalSteps = steps.length;

  // Auto-play interval
  useEffect(() => {
    let timer = null;
    if (isPlaying && currentStepIndex < totalSteps - 1) {
      const delay = Math.max(200, 1500 / playbackSpeed);
      timer = setTimeout(() => {
        onNextStep();
      }, delay);
    } else if (isPlaying && currentStepIndex >= totalSteps - 1) {
      onPlayPause(false); // Stop when reached end
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed, onNextStep, onPlayPause]);

  if (!currentStep) {
    return (
      <div className="step-controller-card empty-state">
        <Info size={18} />
        <span>Chọn một truy vấn hoặc click 2 căn hộ trên cây để bắt đầu mô phỏng từng bước.</span>
      </div>
    );
  }

  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 100;

  return (
    <div className="step-controller-card">
      {/* Top Bar: Step Counter & Playback Controls */}
      <div className="controller-header">
        <div className="step-badge">
          <span className="badge-pill">
            Bước {currentStepIndex + 1} / {totalSteps}
          </span>
          <span className="step-type-tag">{currentStep.type}</span>
        </div>

        <div className="playback-actions">
          <button
            onClick={onReset}
            disabled={currentStepIndex === 0}
            title="Về bước đầu"
            className="action-btn"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
            title="Bước trước"
            className="action-btn"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => onPlayPause(!isPlaying)}
            className={`action-btn primary ${isPlaying ? 'active' : ''}`}
            title={isPlaying ? 'Tạm dừng' : 'Tự động chạy'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            onClick={onNextStep}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Bước tiếp theo"
            className="action-btn"
          >
            <SkipForward size={16} />
          </button>

          {/* Speed Selector */}
          <div className="speed-selector">
            <span className="speed-label">Tốc độ:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                className={`speed-btn ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => onChangeSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Scrubber */}
      <div className="timeline-container">
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onJumpToStep(Number(e.target.value))}
          className="timeline-slider"
        />
        <div className="timeline-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Step Detail Explanation */}
      <div className="step-detail-box">
        <div className="step-title-row">
          <h4 className="step-title">{currentStep.title}</h4>
          {currentStep.type === 'RESULT' && (
            <span className="success-tag">
              <CheckCircle2 size={14} /> Hoàn tất
            </span>
          )}
        </div>
        <p className="step-desc">{currentStep.description}</p>

        {/* Dynamic Math Formula */}
        {currentStep.formula && (
          <div className="formula-box">
            <span className="formula-icon">∑</span>
            <code className="formula-text">{currentStep.formula}</code>
          </div>
        )}

        {/* Path route preview if finished */}
        {currentStep.finalPath && (
          <div className="path-route-preview">
            <span className="route-label">Lộ trình di chuyển:</span>
            <div className="route-tags">
              {currentStep.finalPath.map((node, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`route-node ${
                      node === currentStep.lca ? 'lca-highlight' : ''
                    }`}
                  >
                    {node}
                  </span>
                  {idx < currentStep.finalPath.length - 1 && (
                    <span className="route-arrow">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
