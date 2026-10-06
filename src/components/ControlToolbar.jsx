import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  StepBackIcon,
  RotateCcwIcon,
  ZapIcon,
} from './Icons.jsx';

export function ControlToolbar({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onInstantSolve,
  speedMs,
  onChangeSpeed,
  currentStepIndex,
  totalSteps,
  onSeekStep,
  status,
}) {
  function renderStatusBadge() {
    switch (status) {
      case 'RUNNING':
        return <span className="status-indicator-badge badge-running">● Đang Chạy</span>;
      case 'PAUSED':
        return <span className="status-indicator-badge badge-paused">❚❚ Tạm Dừng</span>;
      case 'SOLVED':
        return <span className="status-indicator-badge badge-solved">✓ Đã Giải Xong</span>;
      case 'NO_SOLUTION':
        return <span className="status-indicator-badge badge-error">✗ Vô Nghiệm</span>;
      default:
        return <span className="status-indicator-badge badge-ready">● Sẵn Sàng</span>;
    }
  }

  return (
    <div className="control-bar-single-row-panel">
      {/* Tiêu đề & trạng thái */}
      <div className="control-bar-header">
        <div className="flex items-center gap-2">
          <span className="card-heading-title">Điều Khiển Thuật Toán</span>
          <span className="control-sub-badge font-mono">
            {totalSteps > 0 ? `Bước ${currentStepIndex + 1} / ${totalSteps}` : 'Mô phỏng đệ quy'}
          </span>
        </div>
        {renderStatusBadge()}
      </div>

      {/* 1. DUY NHẤT 1 HÀNG CHỨA TẤT CẢ CÁC NÚT ĐIỀU KHIỂN & THÔNG SỐ */}
      <div className="control-actions-single-line">
        {/* Play / Pause button */}
        <button
          className={`btn-single-row ${isPlaying ? 'btn-sr-pause' : 'btn-sr-play'}`}
          onClick={onTogglePlay}
          disabled={status === 'SOLVED' && currentStepIndex >= totalSteps - 1}
          title={isPlaying ? 'Tạm dừng mô phỏng' : 'Bắt đầu chạy mô phỏng'}
        >
          {isPlaying ? (
            <>
              <PauseIcon size={13} />
              <span>Tạm Dừng</span>
            </>
          ) : (
            <>
              <PlayIcon size={13} />
              <span>{currentStepIndex > 0 ? 'Tiếp Tục' : 'Chạy Mô Phỏng'}</span>
            </>
          )}
        </button>

        {/* Step Forward */}
        <button
          className="btn-single-row btn-sr-sub"
          onClick={onStepForward}
          disabled={isPlaying || (totalSteps > 0 && currentStepIndex >= totalSteps - 1)}
          title="Tiến 1 bước đệ quy"
        >
          <StepForwardIcon size={13} />
          <span>Tiến 1 Bước</span>
        </button>

        {/* Step Back */}
        <button
          className="btn-single-row btn-sr-sub"
          onClick={onStepBackward}
          disabled={isPlaying || currentStepIndex <= 0}
          title="Lùi 1 bước đệ quy"
        >
          <StepBackIcon size={13} />
          <span>Lùi</span>
        </button>

        {/* Reset */}
        <button
          className="btn-single-row btn-sr-sub text-danger-hover"
          onClick={onReset}
          title="Đặt lại trạng thái ban đầu"
        >
          <RotateCcwIcon size={13} />
          <span>Reset</span>
        </button>

        {/* Instant Solve */}
        <button
          className="btn-single-row btn-sr-instant"
          onClick={onInstantSolve}
          title="Giải tức thì không cần đợi animation"
        >
          <ZapIcon size={13} />
          <span>Giải Tức Thì</span>
        </button>

        <span className="sr-divider" />

        {/* Algorithm label (Thuần túy Backtracking) */}
        <div className="sr-param-group">
          <span className="sr-param-label">Thuật Toán:</span>
          <span className="sr-algo-badge font-mono">BACKTRACKING</span>
        </div>

        <span className="sr-divider" />

        {/* Speed Slider */}
        <div className="sr-param-group">
          <span className="sr-param-label">Tốc Độ: <strong className="font-mono text-primary">{speedMs}ms</strong></span>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={speedMs}
            onChange={e => onChangeSpeed(parseInt(e.target.value, 10))}
            className="sr-slider"
          />
        </div>
      </div>

      {/* 2. THANH TIẾN TRÌNH (TIMELINE SCRUBBER) GỌN GÀNG DƯỚI HÀNG NÚT */}
      {totalSteps > 0 && (
        <div className="sr-timeline-row">
          <span className="sr-timeline-text font-mono">
            Tiến trình: <strong className="text-accent">{currentStepIndex + 1}</strong> / {totalSteps}
          </span>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={e => onSeekStep(parseInt(e.target.value, 10))}
            disabled={isPlaying}
            className="sr-timeline-bar"
          />
          <span className="sr-timeline-percent font-mono">
            {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
