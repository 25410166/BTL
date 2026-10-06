// Khu vực hiển thị Kết Quả Đầu Ra (Output) theo yêu cầu bài toán
import React, { useState } from 'react';
import { formatBoardToText } from '../algorithms/sudokuUtils';
import {
  CopyIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ZapIcon,
} from './Icons';

export function OutputSection({
  solvedBoard,
  initialEmptyCoords = [],
  stats = null,
  isSolved = false,
  isUnsolvable = false,
  status = 'IDLE',
}) {
  const [copied, setCopied] = useState(false);

  // Sao chép ma trận text vào clipboard
  function handleCopy() {
    if (!solvedBoard) return;
    const text = formatBoardToText(solvedBoard, 'X');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Tải file .txt kết quả
  function handleDownload() {
    if (!solvedBoard) return;
    const text = formatBoardToText(solvedBoard, 'X');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sudoku_output.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="output-panel-card">
      <div className="panel-header mb-3">
        <h3 className="panel-title flex items-center gap-2">
          <span>Kết Quả Đầu Ra (Output)</span>
        </h3>
        {isSolved && (
          <span className="badge badge-emerald flex items-center gap-1 text-xs">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Đã Tìm Thấy Lời Giải Hợp Lệ
          </span>
        )}
        {isUnsolvable && (
          <span className="badge badge-danger flex items-center gap-1 text-xs">
            <AlertTriangleIcon className="w-3.5 h-3.5" />
            Vô Nghiệm (Không Thể Giải)
          </span>
        )}
      </div>

      {/* Trường hợp đã có kết quả giải */}
      {isSolved && solvedBoard ? (
        <div className="space-y-4">
          {/* Danh sách các ô 'X' ban đầu nay được điền số */}
          <div className="solved-cells-summary p-3 rounded-lg bg-surface-2 border border-subtle">
            <h4 className="text-xs font-semibold text-secondary mb-2 flex items-center gap-1.5">
              <ZapIcon className="w-3.5 h-3.5 text-accent" />
              Chi Tiết Giá Trị Được Điền Vào Các Ô Ký Tự 'X' Ban Đầu:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {initialEmptyCoords.map(({ row, col }, idx) => {
                const filledValue = solvedBoard[row][col];
                return (
                  <div
                    key={idx}
                    className="p-2 rounded bg-surface-3 border border-emerald-subtle flex items-center justify-between text-xs"
                  >
                    <span className="text-secondary font-mono">
                      Ô ({row + 1}, {col + 1}):
                    </span>
                    <span className="badge-emerald font-bold text-sm px-2 py-0.5 rounded">
                      {filledValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiển thị ma trận kết quả dạng text format chuẩn đề bài */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs text-secondary">
              <span>Định dạng ma trận 9×9 đầu ra (chuẩn đề thi để copy nộp bài):</span>
              <div className="flex gap-2">
                <button
                  className="btn btn-xs btn-secondary flex items-center gap-1"
                  onClick={handleCopy}
                  title="Sao chép toàn bộ ma trận kết quả"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã chép!' : 'Sao Chép'}</span>
                </button>
                <button
                  className="btn btn-xs btn-secondary flex items-center gap-1"
                  onClick={handleDownload}
                  title="Tải ma trận về máy dạng text"
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span>Tải .txt</span>
                </button>
              </div>
            </div>
            <pre className="code-box font-mono text-xs max-h-48 overflow-y-auto">
              {formatBoardToText(solvedBoard, 'X')}
            </pre>
          </div>

          {/* Thống kê hiệu năng thực thi */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-subtle">
              <div className="stat-card">
                <span className="stat-label">Thời Gian Giải</span>
                <span className="stat-value text-accent">{stats.executionTimeMs} ms</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Số Lần Gán</span>
                <span className="stat-value text-primary">{stats.assignments}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Số Lần Quay Lui</span>
                <span className="stat-value text-warning">{stats.backtracks}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Độ Sâu Đệ Quy</span>
                <span className="stat-value text-purple">{stats.maxDepth}</span>
              </div>
            </div>
          )}
        </div>
      ) : isUnsolvable ? (
        <div className="p-6 rounded-xl bg-danger-subtle border border-danger text-center">
          <AlertTriangleIcon className="w-10 h-10 text-danger mx-auto mb-2" />
          <h4 className="text-base font-bold text-danger mb-1">Sudoku Không Có Lời Giải Hợp Lệ!</h4>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Thuật toán Backtracking đã duyệt hết toàn bộ cây không gian trạng thái nhưng không thể điền các ô 'X' mà không vi phạm luật Sudoku.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-surface-2 border border-dashed border-subtle text-center text-secondary">
          <p className="text-sm">Chưa có kết quả đầu ra.</p>
          <p className="text-xs mt-1">
            Nhấn <strong className="text-accent">"Chạy Mô Phỏng"</strong> hoặc <strong className="text-accent">"Giải Tức Thì"</strong> trên thanh điều khiển để tìm nghiệm.
          </p>
        </div>
      )}
    </div>
  );
}
