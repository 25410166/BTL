// Thuật toán Quay lui (Backtracking) thuần túy cho bài toán Sudoku 9x9
import { isValidPlacement, findConflicts, cloneBoard } from './sudokuUtils.js';

/**
 * Trình giải tức thì bằng Backtracking thuần túy (không lưu animation để đạt tốc độ tối đa)
 * @param {number[][]} initialBoard Ma trận 9x9 (0 là ô trống 'X')
 * @returns {object} { solved: boolean, board: number[][], stats: object }
 */
export function solveBacktrackingInstant(initialBoard) {
  const board = cloneBoard(initialBoard);
  const startTime = performance.now();

  const stats = {
    assignments: 0,
    backtracks: 0,
    validityChecks: 0,
    recursiveCalls: 0,
    maxDepth: 0,
    executionTimeMs: 0,
  };

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    // Tìm ô trống đầu tiên theo thứ tự tuần tự
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          // Thử lần lượt các giá trị từ 1 đến 9
          for (let num = 1; num <= 9; num++) {
            stats.validityChecks++;
            if (isValidPlacement(board, r, c, num)) {
              board[r][c] = num;
              stats.assignments++;

              // Đệ quy sang ô tiếp theo
              if (solve(depth + 1)) {
                return true;
              }

              // QUAY LUI (Backtrack) - Hoàn tác lựa chọn
              board[r][c] = 0;
              stats.backtracks++;
            }
          }
          // Đã thử hết 1..9 mà không có số nào dẫn đến nghiệm
          return false;
        }
      }
    }

    // Không còn ô trống nào -> Đã giải xong toàn bộ Sudoku
    return true;
  }

  const solved = solve(0);
  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  return {
    solved,
    board: solved ? board : null,
    stats,
  };
}

/**
 * Bộ tạo vết thực thi từng bước (Step-by-step Trace Generator)
 * Phục vụ trực quan hóa quá trình đệ quy và quay lui
 * @param {number[][]} initialBoard
 * @param {number} maxSteps Giới hạn an toàn số bước ghi nhận (tránh tràn RAM với bài toán cực lớn)
 * @returns {Array<object>} Danh sách các snapshot trạng thái
 */
export function generateBacktrackingTrace(initialBoard, maxSteps = 15000) {
  const board = cloneBoard(initialBoard);
  const steps = [];
  const startTime = performance.now();

  const stats = {
    assignments: 0,
    backtracks: 0,
    validityChecks: 0,
    recursiveCalls: 0,
    maxDepth: 0,
    executionTimeMs: 0,
  };

  // Stack lưu trữ vết đệ quy để hiển thị Recursion Call Stack
  const callStack = [];

  function recordStep(type, payload = {}) {
    if (steps.length >= maxSteps) return;

    steps.push({
      stepId: steps.length + 1,
      type, // 'SELECT_CELL' | 'TRY_NUMBER' | 'CONFLICT' | 'ASSIGN' | 'BACKTRACK' | 'SUCCESS' | 'NO_SOLUTION'
      board: cloneBoard(board),
      callStack: [...callStack],
      stats: { ...stats },
      ...payload,
    });
  }

  // Bước 0: Bắt đầu thuật toán
  recordStep('START', {
    message: 'Bắt đầu thuật toán Quay lui (Backtracking). Tìm ô trống đầu tiên...',
  });

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    // Tìm ô trống đầu tiên
    let emptyRow = -1;
    let emptyCol = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          emptyRow = r;
          emptyCol = c;
          break;
        }
      }
      if (emptyRow !== -1) break;
    }

    // Nếu không còn ô trống nào -> Đã tìm ra lời giải hợp lệ
    if (emptyRow === -1) {
      recordStep('SUCCESS', {
        message: 'Hoàn tất! Tất cả các ô trống đã được điền thỏa mãn luật Sudoku 9x9.',
      });
      return true;
    }

    const r = emptyRow;
    const c = emptyCol;

    recordStep('SELECT_CELL', {
      row: r,
      col: c,
      depth,
      message: `Đang xét ô trống tại hàng ${r + 1}, cột ${c + 1} (Độ sâu đệ quy: ${depth + 1}).`,
    });

    // Đẩy vào call stack
    callStack.push({ row: r, col: c, depth, tried: [] });

    // Thử tuần tự từ 1 đến 9
    for (let num = 1; num <= 9; num++) {
      if (steps.length >= maxSteps) return false;

      callStack[callStack.length - 1].tried.push(num);
      stats.validityChecks++;

      const conflicts = findConflicts(board, r, c, num);
      const isValid = conflicts.length === 0;

      if (!isValid) {
        // Ghi lại bước xung đột
        recordStep('CONFLICT', {
          row: r,
          col: c,
          num,
          depth,
          conflicts,
          message: `Thử số ${num} tại (${r + 1}, ${c + 1}) ➔ Xung đột với ${conflicts.map(cf => `${cf.reason === 'row' ? 'Hàng' : cf.reason === 'col' ? 'Cột' : 'Khối 3x3'} tại (${cf.row + 1}, ${cf.col + 1})`).join(', ')}.`,
        });
        continue;
      }

      // Hợp lệ: Gán số vào ô
      board[r][c] = num;
      stats.assignments++;

      recordStep('ASSIGN', {
        row: r,
        col: c,
        num,
        depth,
        message: `Hợp lệ! Tạm thời gán số ${num} vào ô (${r + 1}, ${c + 1}). Đệ quy sang ô tiếp theo...`,
      });

      // Đệ quy bước tiếp theo
      const solvedNext = solve(depth + 1);
      if (solvedNext) {
        return true;
      }

      // QUAY LUI: Hoàn tác
      board[r][c] = 0;
      stats.backtracks++;

      recordStep('BACKTRACK', {
        row: r,
        col: c,
        num,
        depth,
        message: `Quay lui (Backtrack): Nhánh thử ${num} tại (${r + 1}, ${c + 1}) đi vào ngõ cụt. Hủy gán, quay lại ô (${r + 1}, ${c + 1}) để thử giá trị tiếp theo.`,
      });
    }

    // Đã thử hết 1..9 mà không có số nào thỏa mãn
    callStack.pop();
    recordStep('DEAD_END', {
      row: r,
      col: c,
      depth,
      message: `Đã thử hết 1..9 tại (${r + 1}, ${c + 1}) nhưng không tìm được giá trị hợp lệ. Trả về false và lùi đệ quy.`,
    });

    return false;
  }

  const solved = solve(0);
  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  if (!solved && steps.length < maxSteps) {
    recordStep('NO_SOLUTION', {
      message: 'Không tìm thấy lời giải hợp lệ cho Sudoku này (Bài toán vô nghiệm).',
    });
  }

  return {
    steps,
    solved,
    finalBoard: solved ? board : null,
    stats,
    truncated: steps.length >= maxSteps,
  };
}
