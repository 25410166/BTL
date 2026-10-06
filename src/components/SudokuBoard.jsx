// Bàn cờ Sudoku 9x9 tương tác, hỗ trợ minh họa động, highlight xung đột, và chỉnh sửa
import React, { useState, useEffect, useRef } from 'react';
import { getValidCandidates } from '../algorithms/sudokuUtils';

export function SudokuBoard({
  board,
  initialEmptySet = new Set(), // Set chứa các tọa độ "r,c" ban đầu là ô trống 'X'
  currentStep = null,          // Bước thực thi hiện tại từ Visualizer
  isEditable = false,          // Cho phép gõ sửa trực tiếp
  onCellChange = null,         // Callback khi sửa ô
  showCandidates = false,      // Hiển thị số khả dĩ (pencil marks)
  userSolvedState = false,     // Đã giải xong
}) {
  const [selectedCell, setSelectedCell] = useState({ r: null, c: null });
  const [hoveredCell, setHoveredCell] = useState({ r: null, c: null });
  const boardRef = useRef(null);

  // Xử lý phím khi người dùng chỉnh sửa bàn cờ
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

  // Trích xuất thông tin highlight từ bước visualizer hiện tại
  const activeRow = currentStep?.row ?? null;
  const activeCol = currentStep?.col ?? null;
  const stepType = currentStep?.type ?? null;
  const conflicts = currentStep?.conflicts ?? [];

  // Tạo tập hợp các ô bị xung đột để tra cứu O(1)
  const conflictMap = new Map();
  conflicts.forEach(cf => {
    conflictMap.set(`${cf.row},${cf.col}`, cf.reason);
  });

  return (
    <div className="sudoku-board-container" ref={boardRef}>
      {/* Tiêu đề cột 1..9 */}
      <div className="board-col-headers">
        <div className="corner-spacer" />
        {Array.from({ length: 9 }).map((_, c) => (
          <div
            key={c}
            className={`col-header ${selectedCell.c === c || activeCol === c ? 'header-highlight' : ''}`}
          >
            {c + 1}
          </div>
        ))}
      </div>

      {/* Thân bàn cờ gồm 9 hàng */}
      <div className="board-grid-wrapper">
        {board.map((row, r) => (
          <div key={r} className="board-row">
            {/* Tiêu đề hàng 1..9 */}
            <div className={`row-header ${selectedCell.r === r || activeRow === r ? 'header-highlight' : ''}`}>
              {r + 1}
            </div>

            {/* 9 ô trong hàng */}
            {row.map((val, c) => {
              const coordKey = `${r},${c}`;
              const isInitialEmpty = initialEmptySet.has(coordKey);
              const isActive = activeRow === r && activeCol === c;
              const isSelected = selectedCell.r === r && selectedCell.c === c;
              const conflictReason = conflictMap.get(coordKey);
              const isHoverRelated =
                hoveredCell.r !== null &&
                (hoveredCell.r === r ||
                  hoveredCell.c === c ||
                  (Math.floor(hoveredCell.r / 3) === Math.floor(r / 3) &&
                    Math.floor(hoveredCell.c / 3) === Math.floor(c / 3)));

              // Xác định lớp CSS cho ô
              let cellClasses = 'sudoku-cell';

              // Viền khối 3x3
              if (c % 3 === 2 && c !== 8) cellClasses += ' border-box-right';
              if (r % 3 === 2 && r !== 8) cellClasses += ' border-box-bottom';

              if (isHoverRelated) cellClasses += ' cell-hover-axis';
              if (isSelected) cellClasses += ' cell-selected';

              if (isActive) {
                cellClasses += ' cell-active-anim';
                if (stepType === 'TRY_NUMBER' || stepType === 'ASSIGN') {
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

              // Lấy candidates nếu bật chế độ xem gợi ý số
              const candidates = showCandidates && val === 0 ? getValidCandidates(board, r, c) : [];

              return (
                <div
                  key={c}
                  className={cellClasses}
                  onClick={() => {
                    setSelectedCell({ r, c });
                  }}
                  onMouseEnter={() => setHoveredCell({ r, c })}
                  onMouseLeave={() => setHoveredCell({ r: null, c: null })}
                  tabIndex={isEditable ? 0 : -1}
                  role="gridcell"
                  aria-label={`Ô hàng ${r + 1} cột ${c + 1} giá trị ${val === 0 ? (isInitialEmpty ? 'X' : 'trống') : val}`}
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

                  {/* Badge nhỏ đánh dấu ô ban đầu là X */}
                  {isInitialEmpty && (
                    <span className="x-origin-tag" title="Ô ban đầu mang ký tự 'X' cần tìm nghiệm">
                      X
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
