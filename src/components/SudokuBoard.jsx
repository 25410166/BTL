import React, { useState, useEffect, useRef } from 'react';
import { getValidCandidates } from '../algorithms/sudokuUtils.js';

export function SudokuBoard({
  board,
  initialEmptySet = new Set(), // Set các tọa độ "r,c" ban đầu mang ký tự 'X'
  currentStep = null,          // Bước hiện thời từ bộ sinh vết
  isEditable = false,          // Cho phép gõ trực tiếp
  onCellChange = null,
  showCandidates = false,
  userSolvedState = false,
}) {
  const [selectedCell, setSelectedCell] = useState({ r: null, c: null });
  const [hoveredCell, setHoveredCell] = useState({ r: null, c: null });
  const boardRef = useRef(null);

  // Phím điều hướng khi ở chế độ chỉnh sửa/tự giải
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
    <div className="sudoku-visual-panel" ref={boardRef}>
      {/* Board Header */}
      <div className="board-panel-header">
        <div className="board-header-titles">
          <span className="board-main-title">Sudoku 9×9</span>
          <span className="board-sub-title">Simulation Board</span>
        </div>

        {activeRow !== null && activeCol !== null && (
          <div className="board-scan-indicator">
            <span className="scan-indicator-dot" />
            <span className="scan-indicator-text">
              Quét Hàng <strong>{activeRow + 1}</strong> · Cột <strong>{activeCol + 1}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Lưới Sudoku 9x9 với coordinate rulers */}
      <div className="board-render-wrapper">
        <div className="sudoku-grid-container">
          {/* Thước Cột 1..9 */}
          <div className="ruler-cols">
            <div className="ruler-corner" />
            {Array.from({ length: 9 }).map((_, c) => (
              <div
                key={c}
                className={`ruler-col-cell ${activeCol === c ? 'ruler-active' : ''}`}
              >
                {c + 1}
              </div>
            ))}
          </div>

          {/* 9 Hàng bàn cờ */}
          <div className="sudoku-cells-box">
            {board.map((row, r) => {
              const isRowActive = activeRow === r;
              return (
                <div key={r} className={`board-row-wrap ${isRowActive ? 'row-active-scan' : ''}`}>
                  {/* Thước Hàng 1..9 */}
                  <div className={`ruler-row-cell ${isRowActive ? 'ruler-active' : ''}`}>
                    {r + 1}
                  </div>

                  {/* 9 Ô */}
                  {row.map((val, c) => {
                    const coordKey = `${r},${c}`;
                    const isInitialEmpty = initialEmptySet.has(coordKey);
                    const isActive = activeRow === r && activeCol === c;
                    const isPrev = prevCell && prevCell.row === r && prevCell.col === c && !isActive;
                    const isSelected = selectedCell.r === r && selectedCell.c === c;
                    const conflictReason = conflictMap.get(coordKey);
                    const isColActive = activeCol === c;

                    const isHoverCross =
                      hoveredCell.r !== null &&
                      (hoveredCell.r === r ||
                        hoveredCell.c === c ||
                        (Math.floor(hoveredCell.r / 3) === Math.floor(r / 3) &&
                          Math.floor(hoveredCell.c / 3) === Math.floor(c / 3)));

                    let cellClasses = 'sudoku-cell';

                    // Thicker 3x3 block borders
                    if (c % 3 === 2 && c !== 8) cellClasses += ' border-box-right';
                    if (r % 3 === 2 && r !== 8) cellClasses += ' border-box-bottom';

                    if (isHoverCross) cellClasses += ' cell-hover-axis';
                    if (isSelected) cellClasses += ' cell-selected';
                    if (isRowActive) cellClasses += ' cell-scan-row';
                    if (isColActive) cellClasses += ' cell-scan-col';

                    if (isPrev) cellClasses += ' cell-prev-step';

                    if (isActive) {
                      cellClasses += ' cell-active-inspect';
                      if (stepType === 'ASSIGN') cellClasses += ' cell-action-assign';
                      else if (stepType === 'BACKTRACK') cellClasses += ' cell-action-backtrack';
                      else if (stepType === 'CONFLICT') cellClasses += ' cell-action-conflict';
                    }

                    if (conflictReason) cellClasses += ' cell-target-conflict';

                    if (isInitialEmpty) {
                      if (val === 0) {
                        cellClasses += ' cell-empty-x';
                      } else {
                        cellClasses += ' cell-solved-x';
                      }
                    } else {
                      cellClasses += ' cell-given-num';
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
                        title={`Ô (${r + 1}, ${c + 1}) - ${val === 0 ? (isInitialEmpty ? "Ký tự 'X'" : 'Trống') : `Số ${val}`}`}
                      >
                        {val === 0 ? (
                          isInitialEmpty ? (
                            <span className="x-char">X</span>
                          ) : showCandidates ? (
                            <div className="mini-candidates-box">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <span
                                  key={n}
                                  className={`candidate-digit ${candidates.includes(n) ? 'active' : ''}`}
                                >
                                  {candidates.includes(n) ? n : ''}
                                </span>
                              ))}
                            </div>
                          ) : null
                        ) : (
                          <span className="num-display">{val}</span>
                        )}

                        {/* Tag nhỏ đánh dấu ô X ban đầu */}
                        {isInitialEmpty && (
                          <span className="x-tag-pin" title="Ô 'X' ban đầu cần giải">
                            X
                          </span>
                        )}

                        {/* Điểm vệt đánh dấu ô bước trước đó */}
                        {isPrev && (
                          <span className="prev-trail-point" title="Ô ở bước trước đó" />
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

      {/* Mini Legend gọn gàng dưới bàn cờ */}
      <div className="board-footer-legend">
        <span className="legend-entry"><span className="legend-dot dot-given" /> Số cho sẵn</span>
        <span className="legend-entry"><span className="legend-dot dot-empty-x" /> Ô trống 'X'</span>
        <span className="legend-entry"><span className="legend-dot dot-active" /> Đang xét</span>
        <span className="legend-entry"><span className="legend-dot dot-conflict" /> Xung đột</span>
        <span className="legend-entry"><span className="legend-dot dot-backtrack" /> Quay lui</span>
        <span className="legend-entry"><span className="legend-dot dot-solved" /> Đã giải</span>
      </div>
    </div>
  );
}
