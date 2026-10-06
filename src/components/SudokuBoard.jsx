// Bàn cờ Sudoku 9x9 thiết kế chuẩn Pro Dashboard, gọn gàng, hỗ trợ quét Hàng/Cột và theo dõi bước chuyển ô
import React, { useState, useEffect, useRef } from 'react';
import { getValidCandidates } from '../algorithms/sudokuUtils.js';

export function SudokuBoard({
  board,
  initialEmptySet = new Set(), // Set chứa các tọa độ "r,c" ban đầu là ô trống 'X'
  currentStep = null,          // Bước thực thi hiện tại từ Visualizer
  isEditable = false,          // Cho phép gõ sửa trực tiếp
  onCellChange = null,         // Callback khi sửa ô
  showCandidates = false,      // Hiển thị số khả dĩ
  userSolvedState = false,
}) {
  const [selectedCell, setSelectedCell] = useState({ r: null, c: null });
  const [hoveredCell, setHoveredCell] = useState({ r: null, c: null });
  const boardRef = useRef(null);

  // Phím điều hướng khi chỉnh sửa
  useEffect(() => {
    if (!isEditable) return;

    function handleKeyDown(e) {
      if (selectedCell.r === null || selectedCell.c === null) return;
      const { r, c } = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        onCellChange && onCellChange(r, c, parseInt(e.key, 10));
      } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        onCellChange && onCellChange(r, c, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell({ r: Math.max(0, r - 1), c });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCell({ r: Math.min(8, r + 1), c });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell({ r, c: Math.max(0, c - 1) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell({ r, c: Math.min(8, c + 1) });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditable, selectedCell, onCellChange]);

  // Trích xuất thông tin ô đang xét từ bước hiện thời
  const activeRow = currentStep?.row ?? null;
  const activeCol = currentStep?.col ?? null;
  const prevCell = currentStep?.prevCell ?? null;
  const stepType = currentStep?.type ?? null;
  const conflicts = currentStep?.conflicts ?? [];

  const conflictMap = new Map();
  conflicts.forEach(cf => {
    conflictMap.set(`${cf.row},${cf.col}`, cf.reason);
  });

  return (
    <div className="sudoku-board-card" ref={boardRef}>
      {/* Header trạng thái quét Hàng / Cột */}
      {activeRow !== null && activeCol !== null && (
        <div className="scan-tracker-banner">
          <div className="flex items-center gap-2 text-xs">
            <span className="pulse-dot" />
            <span>
              Đang xét: <strong className="text-accent">Hàng {activeRow + 1}</strong>,{' '}
              <strong className="text-accent">Cột {activeCol + 1}</strong>{' '}
              <span className="text-secondary">(Khối 3×3 #{Math.floor(activeRow / 3) * 3 + Math.floor(activeCol / 3) + 1})</span>
            </span>
          </div>
          {currentStep?.transitionNote && (
            <span className="text-[11px] text-secondary font-mono truncate max-w-[280px]">
              {currentStep.transitionNote}
            </span>
          )}
        </div>
      )}

      {/* Lưới bàn cờ kèm thước số tọa độ */}
      <div className="sudoku-board-container">
        {/* Thước số Cột 1..9 */}
        <div className="board-col-headers">
          <div className="corner-spacer" />
          {Array.from({ length: 9 }).map((_, c) => {
            const isColActive = activeCol === c;
            return (
              <div
                key={c}
                className={`col-header ${isColActive ? 'header-highlight active-col-ruler' : ''}`}
              >
                {c + 1}
              </div>
            );
          })}
        </div>

        {/* 9 hàng bàn cờ */}
        <div className="board-grid-wrapper">
          {board.map((row, r) => {
            const isRowActive = activeRow === r;
            return (
              <div key={r} className={`board-row ${isRowActive ? 'active-row-scan' : ''}`}>
                {/* Thước số Hàng 1..9 */}
                <div className={`row-header ${isRowActive ? 'header-highlight active-row-ruler' : ''}`}>
                  {r + 1}
                </div>

                {/* 9 ô trong hàng */}
                {row.map((val, c) => {
                  const coordKey = `${r},${c}`;
                  const isInitialEmpty = initialEmptySet.has(coordKey);
                  const isActive = activeRow === r && activeCol === c;
                  const isPrev = prevCell && prevCell.row === r && prevCell.col === c && !isActive;
                  const isSelected = selectedCell.r === r && selectedCell.c === c;
                  const conflictReason = conflictMap.get(coordKey);
                  const isHoverRelated =
                    hoveredCell.r !== null &&
                    (hoveredCell.r === r ||
                      hoveredCell.c === c ||
                      (Math.floor(hoveredCell.r / 3) === Math.floor(r / 3) &&
                        Math.floor(hoveredCell.c / 3) === Math.floor(c / 3)));

                  let cellClasses = 'sudoku-cell';

                  // Viền đậm phân tách khối 3x3
                  if (c % 3 === 2 && c !== 8) cellClasses += ' border-box-right';
                  if (r % 3 === 2 && r !== 8) cellClasses += ' border-box-bottom';

                  if (isHoverRelated) cellClasses += ' cell-hover-axis';
                  if (isSelected) cellClasses += ' cell-selected';

                  // Highlight quét hàng / cột của thuật toán
                  if (isRowActive) cellClasses += ' cell-row-scanned';
                  if (activeCol === c) cellClasses += ' cell-col-scanned';

                  if (isPrev) {
                    cellClasses += ' cell-prev-step';
                  }

                  if (isActive) {
                    cellClasses += ' cell-active-anim';
                    if (stepType === 'ASSIGN') {
                      cellClasses += ' cell-assigning';
                    } else if (stepType === 'BACKTRACK') {
                      cellClasses += ' cell-backtracking';
                    } else if (stepType === 'CONFLICT') {
                      cellClasses += ' cell-conflict-source';
                    }
                  }

                  if (conflictReason) {
                    cellClasses += ' cell-conflict-target';
                  }

                  if (isInitialEmpty) {
                    if (val === 0) {
                      cellClasses += ' cell-initial-x';
                    } else {
                      cellClasses += ' cell-solved-x';
                    }
                  } else {
                    cellClasses += ' cell-given';
                  }

                  const candidates = showCandidates && val === 0 ? getValidCandidates(board, r, c) : [];

                  return (
                    <div
                      key={c}
                      className={cellClasses}
                      onClick={() => setSelectedCell({ r, c })}
                      onMouseEnter={() => setHoveredCell({ r, c })}
                      onMouseLeave={() => setHoveredCell({ r: null, c: null })}
                      tabIndex={isEditable ? 0 : -1}
                      title={`Tọa độ (${r + 1}, ${c + 1}) - Giá trị: ${val === 0 ? (isInitialEmpty ? "'X'" : 'Trống') : val}`}
                    >
                      {val === 0 ? (
                        isInitialEmpty ? (
                          <span className="x-placeholder">X</span>
                        ) : showCandidates ? (
                          <div className="candidates-mini-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                              <span
                                key={n}
                                className={`candidate-num ${candidates.includes(n) ? 'candidate-active' : ''}`}
                              >
                                {candidates.includes(n) ? n : ''}
                              </span>
                            ))}
                          </div>
                        ) : null
                      ) : (
                        <span className="cell-value">{val}</span>
                      )}

                      {/* Badge đánh dấu ô 'X' */}
                      {isInitialEmpty && (
                        <span className="x-origin-tag" title="Ô 'X' ban đầu của đề bài">
                          X
                        </span>
                      )}

                      {/* Vết đánh dấu ô trước đó để người xem biết vừa từ ô nào chuyển sang */}
                      {isPrev && (
                        <span className="prev-trail-dot" title="Ô bước trước đó" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
