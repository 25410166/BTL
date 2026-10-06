// Chế độ Tự Giải & Luyện Tập Tương Tác (Interactive Practice & Play Mode)
// Cho phép người dùng trực tiếp điền số vào các ô 'X', kiểm tra xung đột và nhận gợi ý thông minh từ Backtracking

import React, { useState } from 'react';
import { SudokuBoard } from './SudokuBoard';
import { solveBacktrackingInstant } from '../algorithms/sudokuBacktracking';
import { validateInitialBoard, cloneBoard } from '../algorithms/sudokuUtils';
import { fireConfetti } from '../utils/confetti';
import {
  GamepadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  RotateCcwIcon,
  SparklesIcon,
} from './Icons';

export function PlayPracticeMode({ initialBoard, initialEmptySet }) {
  const [board, setBoard] = useState(() => cloneBoard(initialBoard));
  const [checkResult, setCheckResult] = useState(null);
  const [hintMessage, setHintMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Xử lý khi người dùng đổi giá trị ô
  function handleCellChange(r, c, val) {
    const key = `${r},${c}`;
    // Chỉ cho phép sửa các ô ban đầu là 'X'
    if (!initialEmptySet.has(key)) return;

    const newBoard = cloneBoard(board);
    newBoard[r][c] = val;
    setBoard(newBoard);
    setCheckResult(null);
    setHintMessage(null);
  }

  // Đặt lại bàn cờ về ban đầu
  function handleReset() {
    setBoard(cloneBoard(initialBoard));
    setCheckResult(null);
    setHintMessage(null);
    setIsSuccess(false);
  }

  // Kiểm tra tính hợp lệ
  function handleCheckValid() {
    const validation = validateInitialBoard(board);

    // Đếm xem còn ô trống không
    let emptyCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) emptyCount++;
      }
    }

    if (!validation.valid) {
      setCheckResult({
        status: 'error',
        message: `Phát hiện xung đột: ${validation.errors[0]}`,
        conflictCells: validation.conflictCells,
      });
      setIsSuccess(false);
    } else if (emptyCount > 0) {
      setCheckResult({
        status: 'warning',
        message: `Hiện tại chưa có xung đột, nhưng vẫn còn ${emptyCount} ô chưa được điền!`,
      });
      setIsSuccess(false);
    } else {
      setCheckResult({
        status: 'success',
        message: 'Xuất sắc! Bạn đã giải chính xác toàn bộ bàn cờ Sudoku hợp lệ 100%!',
      });
      setIsSuccess(true);
      fireConfetti();
    }
  }

  // Gợi ý 1 ô (Hint) dùng Backtracking
  function handleHint() {
    const solveRes = solveBacktrackingInstant(initialBoard);
    if (!solveRes.solved) {
      setHintMessage('Không thể đưa ra gợi ý vì đề bài này vô nghiệm!');
      return;
    }

    // Tìm ô 'X' đầu tiên chưa điền hoặc bị điền sai
    let targetCell = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (initialEmptySet.has(`${r},${c}`)) {
          if (board[r][c] !== solveRes.board[r][c]) {
            targetCell = { r, c, val: solveRes.board[r][c] };
            break;
          }
        }
      }
      if (targetCell) break;
    }

    if (targetCell) {
      const newBoard = cloneBoard(board);
      newBoard[targetCell.r][targetCell.r] = targetCell.val;
      newBoard[targetCell.r][targetCell.c] = targetCell.val;
      setBoard(newBoard);
      setHintMessage(
        `Gợi ý từ Backtracking: Ô (${targetCell.r + 1}, ${targetCell.c + 1}) cần điền số ${targetCell.val}!`
      );
    } else {
      setHintMessage('Tất cả các ô trống đã được điền chính xác!');
    }
  }

  return (
    <div className="practice-mode-card space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle pb-4">
        <div>
          <h3 className="section-title text-base flex items-center gap-2">
            <GamepadIcon className="w-5 h-5 text-accent" />
            <span>Chế Độ Tự Giải & Tương Tác Trực Tiếp (Play Mode)</span>
          </h3>
          <p className="text-xs text-secondary mt-1">
            Bấm vào các ô mang ký tự <strong className="text-accent">'X'</strong> màu cam và gõ số 1..9 từ bàn phím để tự mình giải đố.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary text-xs px-3 py-2" onClick={handleReset}>
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span>Đặt Lại</span>
          </button>
          <button className="btn btn-secondary text-xs px-3 py-2 text-accent" onClick={handleHint}>
            <LightbulbIcon className="w-3.5 h-3.5" />
            <span>Gợi Ý (Hint)</span>
          </button>
          <button
            className="btn btn-primary-gradient text-xs px-4 py-2 font-semibold"
            onClick={handleCheckValid}
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Kiểm Tra Kết Quả</span>
          </button>
        </div>
      </div>

      {/* Thông báo kiểm tra / Gợi ý */}
      {checkResult && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            checkResult.status === 'success'
              ? 'bg-emerald-subtle border border-emerald text-emerald'
              : checkResult.status === 'error'
              ? 'bg-danger-subtle border border-danger text-danger'
              : 'bg-warning-subtle border border-warning text-warning'
          }`}
        >
          {checkResult.status === 'success' && <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />}
          {checkResult.status === 'error' && <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />}
          {checkResult.status === 'warning' && <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />}
          <span>{checkResult.message}</span>
        </div>
      )}

      {hintMessage && (
        <div className="p-3 rounded-lg bg-accent-subtle border border-accent text-accent text-xs flex items-center gap-2">
          <LightbulbIcon className="w-4 h-4 flex-shrink-0" />
          <span>{hintMessage}</span>
        </div>
      )}

      {/* Bàn cờ Sudoku có tương tác */}
      <div className="flex flex-col items-center justify-center">
        <SudokuBoard
          board={board}
          initialEmptySet={initialEmptySet}
          isEditable={true}
          onCellChange={handleCellChange}
          showCandidates={true}
        />
        <div className="mt-3 flex items-center gap-4 text-xs text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-surface-2 border border-subtle inline-block" /> Số cố định đề bài
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 inline-block" /> Ô 'X' cần điền (Click & gõ phím 1-9)
          </span>
        </div>
      </div>
    </div>
  );
}
