import React, { useState, useRef, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StepForwardIcon,
  StepBackIcon,
  RotateCcwIcon,
  ZapIcon,
  CopyIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from './Icons.jsx';
import { formatBoardToText } from '../algorithms/sudokuUtils.js';

export function SimulationSidebar({
  // Simulation Controls props
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

  // Step Trace props
  currentStep,
  allSteps = [],
  onSelectStep,

  // Output props
  solvedBoard,
  initialEmptyCoords = [],
  executionStats,
}) {
  const [copied, setCopied] = useState(false);
  const logRef = useRef(null);

  // Auto-scroll log to active item
  useEffect(() => {
    if (logRef.current) {
      const activeItem = logRef.current.querySelector('.log-row-current');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStepIndex]);

  function handleCopyMatrix() {
    if (!solvedBoard) return;
    const txt = formatBoardToText(solvedBoard, 'X');
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleDownloadTxt() {
    if (!solvedBoard) return;
    const txt = formatBoardToText(solvedBoard, 'X');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sudoku_output.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  const {
    type = 'START',
    message = '',
    row,
    col,
    num,
    depth = 0,
    boxIdx,
    conflicts = [],
    prevCell = null,
    callStack = [],
    transitionNote = '',
  } = currentStep || {};

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
    <div className="sidebar-deck-root">
      {/* ========================================================
          1. SIMULATION CONTROLS
          ======================================================== */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="card-heading-title">Điều Khiển Thuật Toán</span>
          {renderStatusBadge()}
        </div>

        {/* Action Buttons Row */}
        <div className="control-btn-grid">
          {/* Primary Run / Pause */}
          <button
            className={`btn-primary-action ${isPlaying ? 'btn-pause-mode' : 'btn-play-mode'}`}
            onClick={onTogglePlay}
            disabled={status === 'SOLVED' && currentStepIndex >= totalSteps - 1}
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

          {/* Step Controls */}
          <div className="btn-group-secondary">
            <button
              className="btn-sec-action"
              onClick={onStepBackward}
              disabled={isPlaying || currentStepIndex <= 0}
              title="Lùi 1 bước"
            >
              <StepBackIcon className="w-3.5 h-3.5" />
            </button>
            <button
              className="btn-sec-action"
              onClick={onStepForward}
              disabled={isPlaying || (totalSteps > 0 && currentStepIndex >= totalSteps - 1)}
              title="Tiến 1 bước"
            >
              <StepForwardIcon className="w-3.5 h-3.5" />
              <span>Tiến 1 Bước</span>
            </button>
            <button
              className="btn-sec-action text-subtle hover:text-danger"
              onClick={onReset}
              title="Đặt lại trạng thái ban đầu"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              className="btn-sec-action btn-instant-solve"
              onClick={onInstantSolve}
              title="Giải tức thì không delay animation"
            >
              <ZapIcon className="w-3.5 h-3.5 text-accent" />
              <span>Giải Tức Thì</span>
            </button>
          </div>
        </div>

        {/* Strategy & Speed Row */}
        <div className="control-params-row">
          <div className="param-item">
            <span className="param-label">Chiến Lược:</span>
            <select
              className="select-param"
              value={strategy}
              onChange={e => onChangeStrategy(e.target.value)}
              disabled={isPlaying}
            >
              <option value="sequential">Quay Lui Tuần Tự (Chuẩn đề)</option>
              <option value="mrv">MRV Heuristic (Điểm 10)</option>
            </select>
          </div>

          <div className="param-item">
            <span className="param-label">Tốc Độ: <strong className="text-primary font-mono">{speedMs}ms</strong></span>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={speedMs}
              onChange={e => onChangeSpeed(parseInt(e.target.value, 10))}
              className="slider-param"
            />
          </div>
        </div>

        {/* Timeline Scrubber */}
        {totalSteps > 0 && (
          <div className="timeline-scrubber-box">
            <div className="timeline-info">
              <span>Bước: <strong className="text-accent">{currentStepIndex + 1}</strong> / {totalSteps}</span>
              <span>{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              onChange={e => onSeekStep(parseInt(e.target.value, 10))}
              disabled={isPlaying}
              className="timeline-slider-bar"
            />
          </div>
        )}
      </div>

      {/* ========================================================
          2. STEP INFORMATION (Current Step Inspector)
          ======================================================== */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="card-heading-title">Bước Hiện Tại</span>
          <span className="step-counter-tag font-mono">
            {totalSteps > 0 ? `${currentStepIndex + 1} / ${totalSteps}` : '0 / 0'}
          </span>
        </div>

        {/* Transition Summary */}
        {transitionNote && (
          <div className="step-transition-banner">
            <span className="transition-icon">➔</span>
            <span className="transition-text font-mono">{transitionNote}</span>
          </div>
        )}

        {/* Compact Key-Value Data Rows */}
        <div className="step-data-table">
          <div className="data-row">
            <span className="data-key">Ô đang xét</span>
            <span className="data-val text-accent font-bold">
              {row !== undefined ? `Hàng ${row + 1} · Cột ${col + 1}` : '—'}
              {boxIdx ? ` (Khối #${boxIdx})` : ''}
            </span>
          </div>

          <div className="data-row">
            <span className="data-key">Ô trước đó</span>
            <span className="data-val font-mono">
              {prevCell ? `(${prevCell.row + 1}, ${prevCell.col + 1})` : '—'}
            </span>
          </div>

          <div className="data-row">
            <span className="data-key">Giá trị thử</span>
            <span className="data-val text-warning font-mono font-bold">
              {num !== undefined ? num : '—'}
            </span>
          </div>

          <div className="data-row">
            <span className="data-key">Độ sâu (Depth)</span>
            <span className="data-val font-mono text-purple">{depth}</span>
          </div>

          <div className="data-row">
            <span className="data-key">Ràng buộc</span>
            <span className="data-val">
              {num === undefined ? (
                '—'
              ) : conflicts.length === 0 ? (
                <span className="text-emerald font-semibold">✓ Hợp lệ (Hàng/Cột/Khối)</span>
              ) : (
                <span className="text-danger font-semibold">
                  ✗ Trùng {conflicts.map(c => c.reason === 'row' ? 'Hàng' : c.reason === 'col' ? 'Cột' : 'Khối').join(', ')}
                </span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="data-key">Hành động</span>
            <span className="data-val text-primary truncate max-w-[190px]" title={message}>
              {type === 'ASSIGN' ? 'Gán hợp lệ ➔ Tiến đệ quy' :
               type === 'BACKTRACK' ? '↩ Quay lui ➔ Rút số' :
               type === 'CONFLICT' ? 'Xung đột ➔ Thử số kế' :
               type === 'SUCCESS' ? 'Hoàn tất nghiệm' :
               type === 'DEAD_END' ? 'Bế tắc ➔ Lùi đệ quy' : 'Khởi động'}
            </span>
          </div>
        </div>

        {/* Call Stack Compact Chips */}
        {callStack.length > 0 && (
          <div className="callstack-wrap">
            <span className="callstack-label">Call Stack ({callStack.length}):</span>
            <div className="callstack-chips">
              {callStack.map((frame, idx) => (
                <span
                  key={idx}
                  className={`stack-badge ${idx === callStack.length - 1 ? 'stack-badge-active' : ''}`}
                >
                  T{frame.depth + 1}:({frame.row + 1},{frame.col + 1})
                  {frame.tried.length > 0 && `=${frame.tried[frame.tried.length - 1]}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compact Event Log */}
        {allSteps.length > 0 && (
          <div className="mini-log-container" ref={logRef}>
            {allSteps.map((st, idx) => (
              <div
                key={idx}
                className={`mini-log-item ${idx === currentStepIndex ? 'log-row-current' : ''}`}
                onClick={() => onSelectStep && onSelectStep(idx)}
              >
                <span className="log-idx font-mono">#{idx + 1}</span>
                <span className="log-msg truncate">{st.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          3. OUTPUT PANEL
          ======================================================== */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="card-heading-title">Kết Quả Đầu Ra</span>
          {status === 'SOLVED' ? (
            <span className="badge-status badge-solved flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" /> Thành Công
            </span>
          ) : status === 'NO_SOLUTION' ? (
            <span className="badge-status badge-error flex items-center gap-1">
              <AlertTriangleIcon className="w-3 h-3" /> Vô Nghiệm
            </span>
          ) : (
            <span className="text-[11px] text-subtle">Chờ thực thi</span>
          )}
        </div>

        {status === 'SOLVED' && solvedBoard ? (
          <div className="output-content-space">
            {/* Metric Rows */}
            <div className="output-metrics-grid">
              <div className="metric-box">
                <span className="metric-lbl">Thời Gian</span>
                <span className="metric-num text-accent">{executionStats?.executionTimeMs ?? 0} ms</span>
              </div>
              <div className="metric-box">
                <span className="metric-lbl">Số Phép Gán</span>
                <span className="metric-num text-primary">{executionStats?.assignments ?? 0}</span>
              </div>
              <div className="metric-box">
                <span className="metric-lbl">Số Quay Lui</span>
                <span className="metric-num text-warning">{executionStats?.backtracks ?? 0}</span>
              </div>
              <div className="metric-box">
                <span className="metric-lbl">Độ Sâu Max</span>
                <span className="metric-num text-purple">{executionStats?.maxDepth ?? 0}</span>
              </div>
            </div>

            {/* Filled 'X' cells breakdown */}
            <div className="output-filled-list">
              <span className="filled-list-title">Giá trị các ô 'X' đã giải:</span>
              <div className="filled-cells-chips">
                {initialEmptyCoords.map(({ row: r, col: c }, idx) => (
                  <span key={idx} className="filled-chip">
                    ({r + 1}, {c + 1}) = <strong>{solvedBoard[r][c]}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="output-actions-row">
              <button className="btn-out-copy" onClick={handleCopyMatrix}>
                <CopyIcon className="w-3.5 h-3.5" />
                <span>{copied ? 'Đã Sao Chép!' : 'Chép Ma Trận Kết Quả'}</span>
              </button>
              <button className="btn-out-download" onClick={handleDownloadTxt}>
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Tải .TXT</span>
              </button>
            </div>
          </div>
        ) : status === 'NO_SOLUTION' ? (
          <div className="output-empty-hint text-danger">
            Không tìm thấy nghiệm thỏa mãn ràng buộc Sudoku 9x9.
          </div>
        ) : (
          <div className="output-empty-hint">
            Bấm <strong>"Chạy Mô Phỏng"</strong> hoặc <strong>"Giải Tức Thì"</strong> để xem kết quả.
          </div>
        )}
      </div>
    </div>
  );
}
