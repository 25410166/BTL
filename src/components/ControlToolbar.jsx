// Thanh điều khiển mô phỏng gọn gàng chuẩn Pro Dashboard
import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  StepBackIcon,
  RotateCcwIcon,
  ZapIcon,
  LayersIcon,
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
  strategy,
  onChangeStrategy,
  status,
}) {
  return (
    <div className="control-toolbar-compact">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Nút hành động chính */}
        <div className="flex items-center gap-1.5">
          {/* Nút Play / Pause */}
          <button
            className={`btn-control ${isPlaying ? 'btn-ctrl-pause' : 'btn-ctrl-play'}`}
            onClick={onTogglePlay}
            disabled={status === 'SOLVED' && currentStepIndex >= totalSteps - 1}
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Bắt đầu chạy từng bước'}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="w-3.5 h-3.5" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-3.5 h-3.5" />
                <span>{currentStepIndex > 0 ? 'Tiếp Tục' : 'Chạy Mô Phỏng'}</span>
              </>
            )}
          </button>

          {/* Lùi 1 bước */}
          <button
            className="btn-control btn-ctrl-secondary"
            onClick={onStepBackward}
            disabled={isPlaying || currentStepIndex <= 0}
            title="Lùi 1 bước đệ quy"
          >
            <StepBackIcon className="w-3.5 h-3.5" />
          </button>

          {/* Tiến 1 bước */}
          <button
            className="btn-control btn-ctrl-secondary"
            onClick={onStepForward}
            disabled={isPlaying || (totalSteps > 0 && currentStepIndex >= totalSteps - 1)}
            title="Tiến 1 bước đệ quy"
          >
            <StepForwardIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Từng Bước</span>
          </button>

          {/* Đặt lại (Reset) */}
          <button
            className="btn-control btn-ctrl-secondary"
            onClick={onReset}
            title="Đặt lại trạng thái ban đầu"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Đặt Lại</span>
          </button>

          {/* Giải tức thì (Instant) */}
          <button
            className="btn-control btn-ctrl-instant"
            onClick={onInstantSolve}
            title="Giải trực tiếp không qua animation để xem ngay kết quả"
          >
            <ZapIcon className="w-3.5 h-3.5 text-accent" />
            <span>Giải Tức Thì</span>
          </button>
        </div>

        {/* Lựa chọn Chiến lược & Tốc độ */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chiến lược */}
          <div className="flex items-center gap-1.5 text-xs text-secondary">
            <LayersIcon className="w-3 h-3 text-accent" />
            <select
              className="select-custom-compact"
              value={strategy}
              onChange={e => onChangeStrategy(e.target.value)}
              disabled={isPlaying}
            >
              <option value="sequential">Backtracking Tuần Tự (Chuẩn đề)</option>
              <option value="mrv">Backtracking MRV Heuristic (Điểm 10)</option>
            </select>
          </div>

          {/* Tốc độ slider */}
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span>Tốc độ: <strong className="text-primary font-mono">{speedMs}ms</strong></span>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={speedMs}
              onChange={e => onChangeSpeed(parseInt(e.target.value, 10))}
              className="range-slider-compact"
            />
            <div className="flex gap-1">
              <button
                className={`btn-tag-compact ${speedMs === 300 ? 'tag-active' : ''}`}
                onClick={() => onChangeSpeed(300)}
              >
                Chậm
              </button>
              <button
                className={`btn-tag-compact ${speedMs === 50 ? 'tag-active' : ''}`}
                onClick={() => onChangeSpeed(50)}
              >
                Vừa
              </button>
              <button
                className={`btn-tag-compact ${speedMs === 10 ? 'tag-active' : ''}`}
                onClick={() => onChangeSpeed(10)}
              >
                Nhanh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh tua bước (Timeline Scrubber) */}
      {totalSteps > 0 && (
        <div className="mt-2.5 pt-2 border-t border-subtle flex items-center gap-3">
          <span className="text-[11px] text-secondary font-mono whitespace-nowrap">
            Tiến trình: <strong className="text-accent">{currentStepIndex + 1}</strong> / {totalSteps}
          </span>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={e => onSeekStep(parseInt(e.target.value, 10))}
            disabled={isPlaying}
            className="timeline-slider flex-1"
          />
          <span className="text-[11px] font-mono text-secondary">
            {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
