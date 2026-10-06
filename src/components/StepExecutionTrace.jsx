// Bộ theo dõi chi tiết từng bước thuật toán chuẩn Pro Developer Dashboard
// Minh họa rõ ràng: Chọn ô nào, chuyển sang ô nào, quét dòng nào, cột nào
import React, { useRef, useEffect } from 'react';
import { LayersIcon, CheckCircleIcon, AlertTriangleIcon, RotateCcwIcon, ZapIcon } from './Icons.jsx';

export function StepExecutionTrace({
  currentStep,
  currentStepIndex,
  totalSteps,
  allSteps = [],
  onSelectStep,
}) {
  const logContainerRef = useRef(null);

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
        <p className="text-xs font-semibold text-primary">Sẵn Sàng Mô Phỏng</p>
        <p className="text-[11px] text-secondary mt-1">
          Bấm <strong className="text-accent">"Chạy Mô Phỏng"</strong> hoặc <strong className="text-accent">"Tiến 1 Bước"</strong> để xem thuật toán chọn ô, quét dòng/cột và quay lui từng bước.
        </p>
      </div>
    );
  }

  const {
    type,
    message,
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

  function renderActionBadge(stepType) {
    switch (stepType) {
      case 'ASSIGN':
        return <span className="badge badge-emerald text-[9px]">GÁN HỢP LỆ</span>;
      case 'CONFLICT':
        return <span className="badge badge-danger text-[9px]">XUNG ĐỘT</span>;
      case 'BACKTRACK':
        return <span className="badge badge-warning text-[9px]">↩ QUAY LUI</span>;
      case 'SELECT_CELL':
        return <span className="badge badge-accent text-[9px]">CHỌN Ô</span>;
      case 'SUCCESS':
        return <span className="badge badge-emerald text-[9px]">HOÀN TẤT</span>;
      case 'DEAD_END':
        return <span className="badge badge-danger text-[9px]">BẾ TẮC</span>;
      default:
        return <span className="badge badge-neutral text-[9px]">BẮT ĐẦU</span>;
    }
  }

  return (
    <div className="trace-panel-card space-y-3">
      {/* Header gọn gàng */}
      <div className="flex items-center justify-between border-b border-subtle pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Theo Dõi Thuật Toán
          </span>
          {renderActionBadge(type)}
        </div>
        <span className="font-mono text-xs text-accent font-semibold">
          Bước {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* 1. Sơ đồ chuyển bước trực quan: [Ô TRƯỚC] ➔ [Ô ĐANG XÉT] ➔ [HÀNH ĐỘNG] */}
      <div className="step-flow-box">
        <div className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-1.5 flex items-center justify-between">
          <span>Tiến Trình Chuyển Ô & Dòng/Cột:</span>
          {transitionNote && <span className="text-accent normal-case font-mono">{transitionNote}</span>}
        </div>

        <div className="flow-nodes-row">
          {/* Ô trước đó */}
          <div className="flow-node flow-node-prev">
            <span className="flow-node-label">Ô Trước:</span>
            <span className="flow-node-val">
              {prevCell ? `(${prevCell.row + 1}, ${prevCell.col + 1})` : 'Khởi đầu'}
            </span>
          </div>

          <span className="flow-arrow">➔</span>

          {/* Ô hiện tại */}
          <div className="flow-node flow-node-curr">
            <span className="flow-node-label">Đang Xét:</span>
            <span className="flow-node-val text-accent font-bold">
              {row !== undefined ? `(${row + 1}, ${col + 1})` : '—'}
            </span>
          </div>

          <span className="flow-arrow">➔</span>

          {/* Vị trí quét Hàng / Cột */}
          <div className="flow-node flow-node-scan">
            <span className="flow-node-label">Vị Trí Quét:</span>
            <span className="flow-node-val text-purple font-mono">
              {row !== undefined ? `Hàng ${row + 1} | Cột ${col + 1}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Chi tiết hành động tại bước này */}
      <div className={`action-detail-card action-${type?.toLowerCase() || 'default'}`}>
        <p className="text-xs font-medium text-primary leading-snug">{message}</p>

        {/* Bảng phân tích kiểm tra ràng buộc 3 tầng nếu đang thử số */}
        {num !== undefined && (
          <div className="mt-2 pt-2 border-t border-subtle grid grid-cols-3 gap-1.5 text-[10px]">
            {/* Kiểm tra Hàng */}
            <div className={`check-chip ${conflicts.some(c => c.reason === 'row') ? 'chip-conflict' : 'chip-ok'}`}>
              <span>Hàng {row + 1}:</span>
              <strong>{conflicts.some(c => c.reason === 'row') ? 'Trùng số' : '✓ Hợp lệ'}</strong>
            </div>

            {/* Kiểm tra Cột */}
            <div className={`check-chip ${conflicts.some(c => c.reason === 'col') ? 'chip-conflict' : 'chip-ok'}`}>
              <span>Cột {col + 1}:</span>
              <strong>{conflicts.some(c => c.reason === 'col') ? 'Trùng số' : '✓ Hợp lệ'}</strong>
            </div>

            {/* Kiểm tra Khối 3x3 */}
            <div className={`check-chip ${conflicts.some(c => c.reason === 'box') ? 'chip-conflict' : 'chip-ok'}`}>
              <span>Khối #{boxIdx || 1}:</span>
              <strong>{conflicts.some(c => c.reason === 'box') ? 'Trùng số' : '✓ Hợp lệ'}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Ngăn xếp đệ quy (Call Stack) gọn gàng */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-secondary mb-1">
          <span>Ngăn Xếp Đệ Quy (Call Stack): Độ sâu {callStack.length}</span>
          <span className="text-[10px] text-subtle">Mỗi ô trống tương ứng 1 tầng đệ quy</span>
        </div>
        {callStack.length === 0 ? (
          <div className="p-1.5 rounded bg-surface-2 text-center text-[10px] text-subtle">
            Call Stack rỗng
          </div>
        ) : (
          <div className="callstack-chips-row">
            {callStack.map((frame, idx) => (
              <div
                key={idx}
                className={`stack-chip ${idx === callStack.length - 1 ? 'chip-top' : ''}`}
                title={`Tầng ${frame.depth + 1}: Ô (${frame.row + 1}, ${frame.col + 1}), đã thử [${frame.tried.join(', ')}]`}
              >
                <span className="text-[9px] opacity-75">T{frame.depth + 1}:</span>
                <span className="font-mono font-bold">({frame.row + 1},{frame.col + 1})</span>
                {frame.tried.length > 0 && (
                  <span className="stack-tried-num font-mono">
                    ={frame.tried[frame.tried.length - 1]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Nhật ký thực thi các bước (Audit Log) */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-secondary mb-1">
          <span>Nhật Ký Các Bước (Bấm để nhảy đến):</span>
          <span className="text-[10px] text-subtle">{allSteps.length} sự kiện</span>
        </div>
        <div className="log-table-compact" ref={logContainerRef}>
          {allSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.stepId || idx}
                className={`log-item ${isCurrent ? 'log-item-active' : ''}`}
                onClick={() => onSelectStep && onSelectStep(idx)}
              >
                <span className="log-num font-mono">#{idx + 1}</span>
                <span className="log-badge-wrapper">{renderActionBadge(step.type)}</span>
                <span className="log-text truncate">{step.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
