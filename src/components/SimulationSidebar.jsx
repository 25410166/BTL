import React, { useState, useRef, useEffect } from 'react';
import {
  CopyIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from './Icons.jsx';
import { formatBoardToText } from '../algorithms/sudokuUtils.js';

export function SimulationSidebar({
  currentStep,
  currentStepIndex,
  totalSteps,
  allSteps = [],
  onSelectStep,
  status,
  solvedBoard,
  initialEmptyCoords = [],
  executionStats,
}) {
  const [copied, setCopied] = useState(false);
  const logRef = useRef(null);

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
          1. BƯỚC HIỆN TẠI (Step Information / Inspector)
          ======================================================== */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="card-heading-title">Bước Hiện Tại</span>
          <div className="flex items-center gap-2">
            {renderStatusBadge()}
            <span className="step-counter-tag font-mono">
              {totalSteps > 0 ? `${currentStepIndex + 1} / ${totalSteps}` : '0 / 0'}
            </span>
          </div>
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
            <span className="data-key">Độ sâu đệ quy</span>
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
          2. KẾT QUẢ ĐẦU RA (Output Panel)
          ======================================================== */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <span className="card-heading-title">Kết Quả Đầu Ra</span>
          {status === 'SOLVED' ? (
            <span className="badge-status badge-solved flex items-center gap-1">
              <CheckCircleIcon size={12} /> Thành Công
            </span>
          ) : status === 'NO_SOLUTION' ? (
            <span className="badge-status badge-error flex items-center gap-1">
              <AlertTriangleIcon size={12} /> Vô Nghiệm
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
                <CopyIcon size={13} />
                <span>{copied ? 'Đã Sao Chép!' : 'Chép Ma Trận Kết Quả'}</span>
              </button>
              <button className="btn-out-download" onClick={handleDownloadTxt}>
                <DownloadIcon size={13} />
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
            Bấm <strong>"Chạy Mô Phỏng"</strong> hoặc <strong>"Giải Tức Thì"</strong> trên thanh điều khiển bên dưới bàn cờ để xem kết quả.
          </div>
        )}
      </div>
    </div>
  );
}
