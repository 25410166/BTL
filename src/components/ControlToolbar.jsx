// Thanh điều khiển mô phỏng trực quan hóa thuật toán Quay lui
import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  StepBackIcon,
  RotateCcwIcon,
  ZapIcon,
  LayersIcon,
} from './Icons';

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
  status, // 'IDLE' | 'RUNNING' | 'PAUSED' | 'SOLVED' | 'NO_SOLUTION'
}) {
  return (
    <div className="control-toolbar-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Nút hành động chính */}
        <div className="flex items-center gap-2">
          {/* Nút Play / Pause */}
          <button
            className={`btn ${isPlaying ? 'btn-warning' : 'btn-primary-gradient'} px-4 py-2 font-semibold shadow-glow`}
            onClick={onTogglePlay}
            disabled={status === 'SOLVED' && currentStepIndex >= totalSteps - 1}
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Bắt đầu chạy từng bước'}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>{currentStepIndex > 0 ? 'Tiếp Tục' : 'Chạy Mô Phỏng'}</span>
              </>
            )}
          </button>

          {/* Lùi 1 bước */}
          <button
            className="btn btn-secondary px-3 py-2"
            onClick={onStepBackward}
            disabled={isPlaying || currentStepIndex <= 0}
            title="Lùi lại 1 bước đệ quy"
          >
            <StepBackIcon className="w-4 h-4" />
          </button>

          {/* Tiến 1 bước */}
          <button
            className="btn btn-secondary px-3 py-2"
            onClick={onStepForward}
            disabled={isPlaying || (totalSteps > 0 && currentStepIndex >= totalSteps - 1)}
            title="Thực hiện 1 bước tiếp theo"
          >
            <StepForwardIcon className="w-4 h-4" />
          </button>

          {/* Nút Đặt lại (Reset) */}
          <button
            className="btn btn-secondary px-3 py-2 text-danger-hover"
            onClick={onReset}
            title="Đặt lại trạng thái ban đầu"
          >
            <RotateCcwIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Đặt Lại</span>
          </button>

          {/* Giải tức thì (Instant) */}
          <button
            className="btn btn-accent-outline px-3 py-2 font-medium"
            onClick={onInstantSolve}
            title="Giải trực tiếp không qua animation để xem ngay kết quả"
          >
            <ZapIcon className="w-4 h-4 text-accent" />
            <span>Giải Tức Thì</span>
          </button>
        </div>

        {/* Lựa chọn Chiến lược Backtracking */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary font-medium flex items-center gap-1">
            <LayersIcon className="w-3.5 h-3.5" />
            Chiến Lược:
          </span>
          <select
            className="select-custom text-xs"
            value={strategy}
            onChange={e => onChangeStrategy(e.target.value)}
            disabled={isPlaying}
          >
            <option value="sequential">Backtracking Tuần Tự (Chuẩn đề bài)</option>
            <option value="mrv">Backtracking + MRV Heuristic (Tối ưu điểm 10)</option>
          </select>
        </div>

        {/* Điều chỉnh Tốc độ (Speed Slider) */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-secondary whitespace-nowrap">
            Tốc độ: <strong className="text-primary">{speedMs} ms</strong>
          </span>
          <input
            type="range"
            min="5"
            max="600"
            step="5"
            value={speedMs}
            onChange={e => onChangeSpeed(parseInt(e.target.value, 10))}
            className="range-slider"
            title="Kéo sang trái để chạy nhanh hơn, sang phải để xem chậm rõ từng bước"
          />
          <div className="flex gap-1">
            <button
              className={`btn-tag ${speedMs === 500 ? 'tag-active' : ''}`}
              onClick={() => onChangeSpeed(500)}
            >
              Chậm
            </button>
            <button
              className={`btn-tag ${speedMs === 80 ? 'tag-active' : ''}`}
              onClick={() => onChangeSpeed(80)}
            >
              Vừa
            </button>
            <button
              className={`btn-tag ${speedMs === 10 ? 'tag-active' : ''}`}
              onClick={() => onChangeSpeed(10)}
            >
              Nhanh
            </button>
          </div>
        </div>
      </div>

      {/* Thanh tua bước (Timeline Progress Scrubber) */}
      {totalSteps > 0 && (
        <div className="mt-4 pt-3 border-t border-subtle">
          <div className="flex justify-between items-center text-xs text-secondary mb-1">
            <span>
              Tiến trình: <strong className="text-accent">{currentStepIndex + 1}</strong> / {totalSteps} bước
            </span>
            <span className="font-mono text-xs text-subtle">
              {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={e => onSeekStep(parseInt(e.target.value, 10))}
            disabled={isPlaying}
            className="timeline-slider"
          />
        </div>
      )}
    </div>
  );
}
