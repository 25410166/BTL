// Trình theo dõi chi tiết từng bước thực hiện của thuật toán (Execution Step Visualizer)
// Hiển thị Call Stack đệ quy, Lịch sử thao tác, và Giải thích từng hành động
import React, { useRef, useEffect } from 'react';
import { LayersIcon, ZapIcon, AlertTriangleIcon, CheckCircleIcon, RotateCcwIcon } from './Icons';

export function StepExecutionTrace({
  currentStep,
  currentStepIndex,
  totalSteps,
  allSteps = [],
  onSelectStep,
}) {
  const logContainerRef = useRef(null);

  // Tự động cuộn danh sách log xuống bước hiện tại
  useEffect(() => {
    if (logContainerRef.current) {
      const activeElem = logContainerRef.current.querySelector('.log-row-active');
      if (activeElem) {
        activeElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStepIndex]);

  if (!currentStep && totalSteps === 0) {
    return (
      <div className="trace-panel-card text-center p-6 text-secondary">
        <LayersIcon className="w-8 h-8 mx-auto mb-2 opacity-60 text-accent" />
        <p className="text-sm">Trình theo dõi từng bước chưa bắt đầu.</p>
        <p className="text-xs text-subtle mt-1">Bấm "Chạy Mô Phỏng" hoặc "Từng Bước" để theo dõi đệ quy & quay lui.</p>
      </div>
    );
  }

  const { type, message, row, col, num, depth = 0, callStack = [], stats = {} } = currentStep || {};

  // Badge màu theo loại hành động
  function renderActionBadge(stepType) {
    switch (stepType) {
      case 'ASSIGN':
        return <span className="badge badge-emerald text-[10px]">GÁN HỢP LỆ</span>;
      case 'CONFLICT':
        return <span className="badge badge-danger text-[10px]">XUNG ĐỘT</span>;
      case 'BACKTRACK':
        return <span className="badge badge-warning text-[10px]">QUAY LUI</span>;
      case 'SELECT_CELL':
        return <span className="badge badge-accent text-[10px]">CHỌN Ô</span>;
      case 'SUCCESS':
        return <span className="badge badge-emerald text-[10px]">THÀNH CÔNG</span>;
      case 'DEAD_END':
        return <span className="badge badge-danger text-[10px]">BẾ TẮC</span>;
      default:
        return <span className="badge badge-neutral text-[10px]">BẮT ĐẦU</span>;
    }
  }

  return (
    <div className="trace-panel-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-subtle pb-2">
        <h4 className="panel-title flex items-center gap-2 text-xs uppercase tracking-wider">
          <LayersIcon className="w-4 h-4 text-accent" />
          <span>Theo Dõi Từng Bước Thực Thi (Step-by-Step Tracker)</span>
        </h4>
        <span className="text-xs font-mono text-secondary">
          Bước {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Hành động hiện tại (Current Action Spotlight) */}
      <div className={`current-action-banner action-${type?.toLowerCase() || 'default'}`}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{renderActionBadge(type)}</div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary leading-snug">{message}</p>
            {row !== undefined && col !== undefined && (
              <div className="flex items-center gap-3 mt-1 text-[11px] text-secondary font-mono">
                <span>
                  Tọa độ: hàng <strong>{row + 1}</strong>, cột <strong>{col + 1}</strong>
                </span>
                {num !== undefined && (
                  <span>
                    Giá trị thử: <strong className="text-accent">{num}</strong>
                  </span>
                )}
                <span>
                  Độ sâu đệ quy: <strong className="text-purple">{depth}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ngăn xếp đệ quy trực quan (Recursion Call Stack) */}
      <div>
        <h5 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Ngăn Xếp Đệ Quy (Call Stack - Độ sâu: {callStack.length})</span>
          <span className="text-[10px] text-subtle">Khung đệ quy hiện thời</span>
        </h5>
        {callStack.length === 0 ? (
          <div className="p-2 rounded bg-surface-2 text-center text-[11px] text-subtle">
            Call Stack rỗng (chưa có hàm đệ quy nào trên stack)
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-2 border border-subtle max-h-24 overflow-y-auto">
            {callStack.map((frame, idx) => (
              <div
                key={idx}
                className={`stack-frame-chip ${idx === callStack.length - 1 ? 'frame-active' : ''}`}
                title={`Độ sâu ${frame.depth}: Ô (${frame.row + 1}, ${frame.col + 1}), đã thử các số [${frame.tried.join(', ')}]`}
              >
                <span className="font-mono text-[10px]">Tầng {frame.depth + 1}:</span>
                <span className="font-bold text-[11px]">
                  ({frame.row + 1},{frame.col + 1})
                </span>
                {frame.tried.length > 0 && (
                  <span className="text-[9px] text-secondary">
                    [{frame.tried[frame.tried.length - 1]}]
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lịch sử tất cả các bước (Audit Log Table) */}
      <div>
        <h5 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Nhật Ký Thực Thi (Log Các Bước)</span>
          <span className="text-[10px] text-subtle">Bấm vào dòng để xem lại trạng thái bàn cờ</span>
        </h5>
        <div className="log-table-container max-h-48 overflow-y-auto" ref={logContainerRef}>
          {allSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.stepId || idx}
                className={`log-row ${isCurrent ? 'log-row-active' : ''}`}
                onClick={() => onSelectStep && onSelectStep(idx)}
              >
                <span className="log-step-id font-mono text-[10px] text-subtle w-8">
                  #{idx + 1}
                </span>
                <span className="log-badge flex-shrink-0">{renderActionBadge(step.type)}</span>
                <span className="log-desc text-xs text-secondary truncate flex-1 pl-2">
                  {step.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
