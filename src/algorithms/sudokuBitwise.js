// Thuật toán Quay lui tối ưu bằng Thao tác Bit (Bitwise Backtracking)
// Sử dụng các thanh ghi bitmask 9-bit biểu diễn tập số đã dùng trên từng hàng, cột, khối.
// Tận dụng phép toán bitwise AND (&), OR (|), NOT (~), phép tách bit thấp nhất x & (-x)
// Chạy trực tiếp ở cấp thanh ghi CPU, loại bỏ toàn bộ vòng lặp kiểm tra mảng.

import { cloneBoard, findConflicts } from './sudokuUtils.js';

function countBits(n) {
  let count = 0;
  let x = n;
  while (x > 0) {
    x &= (x - 1);
    count++;
  }
  return count;
}

/**
 * Giải tức thì bằng Bitwise Backtracking
 * @param {number[][]} initialBoard
 * @returns {object} { solved: boolean, board: number[][], stats: object }
 */
export function solveBitwiseInstant(initialBoard) {
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

  const rowMask = new Uint16Array(9);
  const colMask = new Uint16Array(9);
  const boxMask = new Uint16Array(9);

  // Khởi tạo bitmask từ ma trận ban đầu
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        const bit = 1 << (val - 1);
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    // Tìm ô trống có ít bit ứng viên nhất (Bitwise MRV Heuristic)
    let minCandidates = 10;
    let targetRow = -1;
    let targetCol = -1;
    let targetBox = -1;
    let targetCandidates = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          const used = rowMask[r] | colMask[c] | boxMask[b];
          const candidates = (~used) & 0x1FF;
          const count = countBits(candidates);

          if (count === 0) {
            // Không có ứng viên nào khả thi -> bế tắc ngay lập tức
            return false;
          }

          if (count < minCandidates) {
            minCandidates = count;
            targetRow = r;
            targetCol = c;
            targetBox = b;
            targetCandidates = candidates;
            if (count === 1) break; // Duyệt luôn ô chỉ còn 1 ứng viên
          }
        }
      }
      if (minCandidates === 1) break;
    }

    // Không còn ô trống nào -> Thành công
    if (targetRow === -1) {
      return true;
    }

    const r = targetRow;
    const c = targetCol;
    const b = targetBox;
    let cands = targetCandidates;

    // Duyệt qua từng bit ứng viên bằng phép toán bitwise nhanh x & (-x)
    while (cands > 0) {
      const bit = cands & (-cands);
      cands &= ~bit;

      const num = 32 - Math.clz32(bit); // Chuyển bitmask 1<<k thành số 1..9
      stats.validityChecks++;

      // Gán bit
      board[r][c] = num;
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;
      stats.assignments++;

      if (solve(depth + 1)) {
        return true;
      }

      // Quay lui (Hoàn tác bitmask bằng phép XOR)
      board[r][c] = 0;
      rowMask[r] ^= bit;
      colMask[c] ^= bit;
      boxMask[b] ^= bit;
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
 * Sinh vết thực thi từng bước cho Bitwise Backtracking
 * @param {number[][]} initialBoard
 * @returns {object}
 */
export function generateBitwiseTrace(initialBoard) {
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

  const rowMask = new Uint16Array(9);
  const colMask = new Uint16Array(9);
  const boxMask = new Uint16Array(9);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        const bit = 1 << (val - 1);
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  function recordStep(type, payload = {}) {
    steps.push({
      stepId: steps.length + 1,
      type,
      board: cloneBoard(board),
      callStack: [...callStack],
      prevCell: lastVisitedCell ? { ...lastVisitedCell } : null,
      stats: { ...stats },
      ...payload,
    });
  }

  recordStep('START', {
    message: 'Khởi động Bitwise Backtracking. Tính toán bitmask hàng, cột, khối trực tiếp qua thanh ghi CPU.',
    transitionNote: 'Khởi tạo Bitmask',
  });

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    let minCandidates = 10;
    let targetRow = -1;
    let targetCol = -1;
    let targetBox = -1;
    let targetCandidates = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          const used = rowMask[r] | colMask[c] | boxMask[b];
          const candidates = (~used) & 0x1FF;
          const count = countBits(candidates);

          if (count === 0) {
            recordStep('DEAD_END', {
              row: r,
              col: c,
              depth,
              boxIdx: b + 1,
              transitionNote: `Ô (${r + 1}, ${c + 1}): Bitmask rỗng (0 bit)`,
              message: `Bế tắc tại (${r + 1}, ${c + 1}): Toàn bộ 9 bit đều bị khóa bởi Hàng/Cột/Khối! Quay lui lập tức.`,
            });
            return false;
          }

          if (count < minCandidates) {
            minCandidates = count;
            targetRow = r;
            targetCol = c;
            targetBox = b;
            targetCandidates = candidates;
            if (count === 1) break;
          }
        }
      }
      if (minCandidates === 1) break;
    }

    if (targetRow === -1) {
      recordStep('SUCCESS', {
        message: 'HOÀN TẤT! Bitwise Backtracking đã điền trọn vẹn 100% bàn cờ Sudoku.',
        transitionNote: 'Đã giải thành công!',
      });
      return true;
    }

    const r = targetRow;
    const c = targetCol;
    const b = targetBox;
    let cands = targetCandidates;

    const fromCell = lastVisitedCell;
    const transitionText = fromCell
      ? `Ô (${fromCell.row + 1}, ${fromCell.col + 1}) ➔ Đến (${r + 1}, ${c + 1}) [${minCandidates} bit khả thi]`
      : `Chọn ô (${r + 1}, ${c + 1}) [${minCandidates} bit khả thi]`;

    recordStep('SELECT_CELL', {
      row: r,
      col: c,
      depth,
      boxIdx: b + 1,
      transitionNote: transitionText,
      message: `Chọn ô (${r + 1}, ${c + 1}): Bitmask còn ${minCandidates} ứng viên hợp lệ.`,
    });

    lastVisitedCell = { row: r, col: c, depth };
    callStack.push({ row: r, col: c, depth, tried: [] });

    while (cands > 0) {
      const bit = cands & (-cands);
      cands &= ~bit;
      const num = 32 - Math.clz32(bit);

      callStack[callStack.length - 1].tried.push(num);
      stats.validityChecks++;

      board[r][c] = num;
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;
      stats.assignments++;

      recordStep('ASSIGN', {
        row: r,
        col: c,
        num,
        depth,
        boxIdx: b + 1,
        transitionNote: `Gán bit ${bit.toString(2)} (số ${num}) vào (${r + 1}, ${c + 1})`,
        message: `Hợp lệ! Bật bit ${num} và gán ô (${r + 1}, ${c + 1}) = ${num}. Tiến đệ quy độ sâu ${depth + 2}.`,
      });

      lastVisitedCell = { row: r, col: c, depth, num };

      if (solve(depth + 1)) {
        return true;
      }

      board[r][c] = 0;
      rowMask[r] ^= bit;
      colMask[c] ^= bit;
      boxMask[b] ^= bit;
      stats.backtracks++;

      recordStep('BACKTRACK', {
        row: r,
        col: c,
        num,
        depth,
        boxIdx: b + 1,
        transitionNote: `↩ Tắt bit số ${num} tại (${r + 1}, ${c + 1})`,
        message: `Quay lui: Hoàn tác bit ${num} tại (${r + 1}, ${c + 1}). Thử bit ứng viên tiếp theo.`,
      });

      lastVisitedCell = { row: r, col: c, depth };
    }

    callStack.pop();
    return false;
  }

  const solved = solve(0);
  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  if (!solved) {
    recordStep('NO_SOLUTION', {
      message: 'Không tìm thấy nghiệm thỏa mãn ràng buộc.',
      transitionNote: 'Vô nghiệm',
    });
  }

  return {
    steps,
    solved,
    finalBoard: solved ? board : null,
    stats,
  };
}
