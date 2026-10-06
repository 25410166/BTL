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
 * Lưu trữ chi tiết: Ô trước đó -> Ô hiện tại -> Ô tiếp theo, quét hàng nào, cột nào
 * @param {number[][]} initialBoard
 * @param {number} maxSteps Giới hạn an toàn số bước ghi nhận
 * @returns {Array<object>} Danh sách các snapshot trạng thái
 */
export function generateBacktrackingTrace(initialBoard, maxSteps = Infinity) {
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

  const callStack = [];
  let lastVisitedCell = null;

  function recordStep(type, payload = {}) {
    if (steps.length >= maxSteps) return;

    steps.push({
      stepId: steps.length + 1,
      type, // 'SCAN' | 'SELECT_CELL' | 'TRY_NUMBER' | 'CONFLICT' | 'ASSIGN' | 'BACKTRACK' | 'SUCCESS' | 'NO_SOLUTION'
      board: cloneBoard(board),
      callStack: [...callStack],
      prevCell: lastVisitedCell ? { ...lastVisitedCell } : null,
      stats: { ...stats },
      ...payload,
    });
  }

  // Bước 0: Bắt đầu thuật toán
  recordStep('START', {
    message: 'Khởi động thuật toán Quay lui. Bắt đầu quét ma trận tìm ô trống đầu tiên...',
    transitionNote: 'Bắt đầu tìm kiếm',
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

    // Nếu không còn ô trống nào -> Đã hoàn tất
    if (emptyRow === -1) {
      recordStep('SUCCESS', {
        message: 'HOÀN TẤT! Tất cả các ô trống đã được điền thỏa mãn 100% luật Sudoku 9x9.',
        transitionNote: 'Đã giải thành công toàn bộ bàn cờ!',
      });
      return true;
    }

    const r = emptyRow;
    const c = emptyCol;
    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;

    const fromCell = lastVisitedCell;
    const transitionText = fromCell
      ? `Chuyển từ ô (${fromCell.row + 1}, ${fromCell.col + 1}) ➔ Đến ô (${r + 1}, ${c + 1})`
      : `Bắt đầu tại ô (${r + 1}, ${c + 1})`;

    recordStep('SELECT_CELL', {
      row: r,
      col: c,
      depth,
      boxIdx,
      transitionNote: transitionText,
      message: `Đang xét ô trống tại Hàng ${r + 1}, Cột ${c + 1} (Khối 3x3 #${boxIdx}). Chuẩn bị thử các số từ 1 đến 9.`,
    });

    lastVisitedCell = { row: r, col: c, depth };
    callStack.push({ row: r, col: c, depth, tried: [] });

    // Thử tuần tự từ 1 đến 9
    for (let num = 1; num <= 9; num++) {
      if (steps.length >= maxSteps) return false;

      callStack[callStack.length - 1].tried.push(num);
      stats.validityChecks++;

      const conflicts = findConflicts(board, r, c, num);
      const isValid = conflicts.length === 0;

      if (!isValid) {
        recordStep('CONFLICT', {
          row: r,
          col: c,
          num,
          depth,
          boxIdx,
          conflicts,
          transitionNote: `Ô (${r + 1}, ${c + 1}): Thử số ${num} bị vi phạm`,
          message: `Thử số ${num} tại (${r + 1}, ${c + 1}) ➔ Xung đột: ${conflicts.map(cf => `${cf.reason === 'row' ? `Hàng ${cf.row + 1}` : cf.reason === 'col' ? `Cột ${cf.col + 1}` : 'Khối 3x3'} đã có số ${num}`).join(', ')}.`,
        });
        continue;
      }

      // Hợp lệ: Gán số
      board[r][c] = num;
      stats.assignments++;

      recordStep('ASSIGN', {
        row: r,
        col: c,
        num,
        depth,
        boxIdx,
        transitionNote: `Gán (${r + 1}, ${c + 1}) = ${num} ➔ Tiến bước sang ô tiếp theo`,
        message: `Hợp lệ! Tạm thời gán số ${num} vào ô (${r + 1}, ${c + 1}). Đệ quy tiến sang ô trống tiếp theo (Độ sâu ${depth + 2}).`,
      });

      lastVisitedCell = { row: r, col: c, depth, num };

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
        boxIdx,
        transitionNote: `↩ QUAY LUI về ô (${r + 1}, ${c + 1}): Rút số ${num}`,
        message: `Quay lui (Backtrack): Nhánh sau tại ô (${r + 1}, ${c + 1}) bị bế tắc! Rút số ${num} ra khỏi ô (${r + 1}, ${c + 1}) để thử giá trị tiếp theo.`,
      });

      lastVisitedCell = { row: r, col: c, depth };
    }

    callStack.pop();
    recordStep('DEAD_END', {
      row: r,
      col: c,
      depth,
      boxIdx,
      transitionNote: `↩ Lùi đệ quy từ ô (${r + 1}, ${c + 1})`,
      message: `Đã thử hết 1..9 tại (${r + 1}, ${c + 1}) mà không có số nào khả thi. Trả về False để quay lui về ô trước đó.`,
    });

    return false;
  }

  const solved = solve(0);
  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  if (!solved) {
    recordStep('NO_SOLUTION', {
      message: 'Không tìm thấy lời giải hợp lệ cho Sudoku này (Bài toán vô nghiệm).',
      transitionNote: 'Vô nghiệm',
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
