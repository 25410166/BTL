import React from 'react';

export function StatusBar({
  boardTitle,
  emptyCount,
  strategy,
  onOpenProblemSpec,
}) {
  const isExamStandard = emptyCount <= 5;

  return (
    <div className="status-bar-root">
      <div className="status-bar-container">
        {/* Left: Testcase Info */}
        <div className="status-left">
          <span className="status-label">Đang nạp:</span>
          <span className="status-title">{boardTitle}</span>
          <span className="badge-status badge-x-count">{emptyCount} ô 'X'</span>
          {isExamStandard ? (
            <span className="badge-status badge-exam-std">Chuẩn đề ≤ 5 ô X</span>
          ) : (
            <span className="badge-status badge-expand-std">Mở rộng & Thử thách</span>
          )}
        </div>

        {/* Right: Algorithm Info */}
        <div className="status-right">
          <div className="status-algo-chip">
            <span className="status-label">Thuật toán:</span>
            <span className="status-algo-name">BACKTRACKING</span>
          </div>
          <span className="status-divider">·</span>
          <div className="status-algo-chip">
            <span className="status-label">Chiến lược:</span>
            <span className="status-algo-strategy">
              {strategy === 'mrv' ? 'MRV Heuristic' : 'Tuần Tự'}
            </span>
          </div>
          <button
            className="status-link-btn"
            onClick={onOpenProblemSpec}
            title="Xem chi tiết đề bài"
          >
            Quy định đề bài ↗
          </button>
        </div>
      </div>
    </div>
  );
}
