// Thuật toán Quay lui mở rộng: Backtracking kết hợp Heuristic MRV (Minimum Remaining Values)
// Vẫn sử dụng 100% kỹ thuật Backtracking (đệ quy + hoàn tác), nhưng thay đổi chiến lược chọn biến
// giúp cắt tỉa không gian trạng thái (State Space Tree Pruning) cực kỳ mạnh mẽ.

import { isValidPlacement, getValidCandidates, findConflicts, cloneBoard } from './sudokuUtils.js';

/**
 * Tìm ô trống có số lượng ứng viên hợp lệ ít nhất (MRV - Most Constrained Variable)
 */
function findBestCellMRV(board) {
  let minCandidatesCount = 10;
  let bestCell = null;
  let bestCandidates = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates = getValidCandidates(board, r, c);
        if (candidates.length < minCandidatesCount) {
          minCandidatesCount = candidates.length;
          bestCell = { row: r, col: c };
          bestCandidates = candidates;
          // Nếu tìm thấy ô chỉ có 1 ứng viên duy nhất (naked single) thì chọn ngay lập tức
          if (minCandidatesCount === 1) {
            return { cell: bestCell, candidates: bestCandidates };
          }
        }
      }
    }
  }

  return { cell: bestCell, candidates: bestCandidates };
}

/**
 * Giải tức thì bằng Backtracking MRV
 */
export function solveBacktrackingMRVInstant(initialBoard) {
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

    const { cell, candidates } = findBestCellMRV(board);
    if (!cell) {
      // Không còn ô trống nào -> Đã giải xong
      return true;
    }

    // Nếu ô còn 0 ứng viên hợp lệ -> Nhánh này vô nghiệm, lập tức quay lui
    if (candidates.length === 0) {
      return false;
    }

    const { row: r, col: c } = cell;

    for (const num of candidates) {
      stats.validityChecks++;
      board[r][c] = num;
      stats.assignments++;

      if (solve(depth + 1)) {
        return true;
      }

      board[r][c] = 0;
      stats.backtracks++;
    }

    return false;
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
 * Tạo vết thực thi từng bước cho Backtracking MRV
 */
export function generateMRVTrace(initialBoard, maxSteps = 15000) {
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

  function recordStep(type, payload = {}) {
    if (steps.length >= maxSteps) return;

    steps.push({
      stepId: steps.length + 1,
      type,
      board: cloneBoard(board),
      callStack: [...callStack],
      stats: { ...stats },
      ...payload,
    });
  }

  recordStep('START', {
    message: 'Bắt đầu Backtracking với Heuristic MRV (Chọn ô có ít ứng viên nhất để duyệt trước)...',
  });

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    const { cell, candidates } = findBestCellMRV(board);

    if (!cell) {
      recordStep('SUCCESS', {
        message: 'Hoàn tất! Thuật toán Backtracking MRV đã điền xong toàn bộ Sudoku.',
      });
      return true;
    }

    const { row: r, col: c } = cell;

    if (candidates.length === 0) {
      recordStep('DEAD_END', {
        row: r,
        col: c,
        depth,
        message: `Ô (${r + 1}, ${c + 1}) không còn số nào hợp lệ (0 ứng viên). Lập tức quay lui (Early Pruning).`,
      });
      return false;
    }

    recordStep('SELECT_CELL', {
      row: r,
      col: c,
      depth,
      candidates,
      message: `MRV chọn ô (${r + 1}, ${c + 1}) vì chỉ có ${candidates.length} ứng viên khả dĩ: [${candidates.join(', ')}].`,
    });

    callStack.push({ row: r, col: c, depth, tried: [] });

    for (const num of candidates) {
      if (steps.length >= maxSteps) return false;

      callStack[callStack.length - 1].tried.push(num);
      stats.validityChecks++;

      board[r][c] = num;
      stats.assignments++;

      recordStep('ASSIGN', {
        row: r,
        col: c,
        num,
        depth,
        message: `Gán số ${num} vào ô (${r + 1}, ${c + 1}). Tiến hành đệ quy...`,
      });

      if (solve(depth + 1)) {
        return true;
      }

      board[r][c] = 0;
      stats.backtracks++;

      recordStep('BACKTRACK', {
        row: r,
        col: c,
        num,
        depth,
        message: `Quay lui (Backtrack): Rút số ${num} khỏi ô (${r + 1}, ${c + 1}) để thử ứng viên khác.`,
      });
    }

    callStack.pop();
    return false;
  }

  const solved = solve(0);
  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  if (!solved && steps.length < maxSteps) {
    recordStep('NO_SOLUTION', {
      message: 'Không tìm thấy lời giải hợp lệ cho Sudoku này.',
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
