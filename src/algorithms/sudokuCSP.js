// Thuật toán CSP (Constraint Satisfaction Problem) kết hợp Lan truyền ràng buộc (Constraint Propagation / AC-3 / Forward Checking)
// Mỗi ô duy trì 1 miền giá trị khả thi (Domain 1..9).
// Khi điền 1 số, thuật toán lập tức lan truyền và triệt tiêu số đó khỏi miền giá trị của tất cả các ô cùng hàng, cột, khối.
// Nếu bất kỳ ô nào bị cạn miền giá trị (Domain size = 0), thuật toán cắt nhánh lập tức mà không cần thử tiếp.

import { cloneBoard } from './sudokuUtils.js';

function getPeers(r, c) {
  const peers = [];
  const seen = new Set();
  const boxR = Math.floor(r / 3) * 3;
  const boxC = Math.floor(c / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (i !== c) {
      const k = `${r},${i}`;
      if (!seen.has(k)) { peers.push([r, i]); seen.add(k); }
    }
    if (i !== r) {
      const k = `${i},${c}`;
      if (!seen.has(k)) { peers.push([i, c]); seen.add(k); }
    }
  }

  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const nr = boxR + dr;
      const nc = boxC + dc;
      if (nr !== r || nc !== c) {
        const k = `${nr},${nc}`;
        if (!seen.has(k)) { peers.push([nr, nc]); seen.add(k); }
      }
    }
  }

  return peers;
}

const PEERS_MAP = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => getPeers(r, c))
);

/**
 * Giải tức thì bằng CSP + Constraint Propagation
 * @param {number[][]} initialBoard
 * @returns {object} { solved: boolean, board: number[][], stats: object }
 */
export function solveCSPInstant(initialBoard) {
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

  // Khởi tạo miền giá trị (Domains) cho 81 ô
  const domains = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
  );

  // Lan truyền các số đã cho sẵn
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        domains[r][c] = new Set([val]);
        for (const [pr, pc] of PEERS_MAP[r][c]) {
          domains[pr][pc].delete(val);
        }
      }
    }
  }

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    // Chọn biến có miền giá trị nhỏ nhất (MRV)
    let minSize = 10;
    let targetRow = -1;
    let targetCol = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const sz = domains[r][c].size;
          if (sz === 0) {
            // Lan truyền phát hiện miền giá trị rỗng -> Cắt nhánh tức thì
            return false;
          }
          if (sz < minSize) {
            minSize = sz;
            targetRow = r;
            targetCol = c;
            if (sz === 1) break;
          }
        }
      }
      if (minSize === 1) break;
    }

    if (targetRow === -1) {
      return true;
    }

    const r = targetRow;
    const c = targetCol;
    const candidates = Array.from(domains[r][c]);

    for (const val of candidates) {
      stats.validityChecks++;
      board[r][c] = val;
      stats.assignments++;

      // Sao chép và lan truyền ràng buộc (Forward Checking)
      const removedList = [];
      let failure = false;

      for (const [pr, pc] of PEERS_MAP[r][c]) {
        if (board[pr][pc] === 0 && domains[pr][pc].has(val)) {
          domains[pr][pc].delete(val);
          removedList.push([pr, pc, val]);
          if (domains[pr][pc].size === 0) {
            failure = true;
            break;
          }
        }
      }

      if (!failure && solve(depth + 1)) {
        return true;
      }

      // Khôi phục ràng buộc
      for (const [pr, pc, v] of removedList) {
        domains[pr][pc].add(v);
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
 * Sinh vết thực thi từng bước cho CSP + Constraint Propagation
 * @param {number[][]} initialBoard
 * @returns {object}
 */
export function generateCSPTrace(initialBoard) {
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

  const domains = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        domains[r][c] = new Set([val]);
        for (const [pr, pc] of PEERS_MAP[r][c]) {
          domains[pr][pc].delete(val);
        }
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
    message: 'Khởi động CSP + Lan Truyền Ràng Buộc (AC-3 / Forward Checking). Xây dựng miền giá trị (Domains) ban đầu cho 81 ô.',
    transitionNote: 'Thiết lập Domains',
  });

  function solve(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    let minSize = 10;
    let targetRow = -1;
    let targetCol = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const sz = domains[r][c].size;
          if (sz === 0) {
            recordStep('DEAD_END', {
              row: r,
              col: c,
              depth,
              boxIdx: Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1,
              transitionNote: `Ô (${r + 1}, ${c + 1}): Miền giá trị cạn (0 phần tử)`,
              message: `Lan truyền ràng buộc phát hiện ô (${r + 1}, ${c + 1}) không còn ứng viên nào hợp lệ! Cắt tỉa nhánh ngay.`,
            });
            return false;
          }
          if (sz < minSize) {
            minSize = sz;
            targetRow = r;
            targetCol = c;
            if (sz === 1) break;
          }
        }
      }
      if (minSize === 1) break;
    }

    if (targetRow === -1) {
      recordStep('SUCCESS', {
        message: 'HOÀN TẤT! Toàn bộ các biến CSP đều đã được gán giá trị thỏa mãn 100% ràng buộc.',
        transitionNote: 'Đã giải thành công!',
      });
      return true;
    }

    const r = targetRow;
    const c = targetCol;
    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;
    const candidates = Array.from(domains[r][c]);

    const fromCell = lastVisitedCell;
    const transitionText = fromCell
      ? `Ô (${fromCell.row + 1}, ${fromCell.col + 1}) ➔ Đến (${r + 1}, ${c + 1}) [Domain: {${candidates.join(',')}}]`
      : `Chọn ô (${r + 1}, ${c + 1}) [Domain: {${candidates.join(',')}}]`;

    recordStep('SELECT_CELL', {
      row: r,
      col: c,
      depth,
      boxIdx,
      transitionNote: transitionText,
      message: `Chọn ô (${r + 1}, ${c + 1}) có miền giá trị hẹp nhất: {${candidates.join(', ')}}.`,
    });

    lastVisitedCell = { row: r, col: c, depth };
    callStack.push({ row: r, col: c, depth, tried: [] });

    for (const val of candidates) {
      callStack[callStack.length - 1].tried.push(val);
      stats.validityChecks++;

      board[r][c] = val;
      stats.assignments++;

      const removedList = [];
      let failure = false;

      for (const [pr, pc] of PEERS_MAP[r][c]) {
        if (board[pr][pc] === 0 && domains[pr][pc].has(val)) {
          domains[pr][pc].delete(val);
          removedList.push([pr, pc, val]);
          if (domains[pr][pc].size === 0) {
            failure = true;
          }
        }
      }

      recordStep('ASSIGN', {
        row: r,
        col: c,
        num: val,
        depth,
        boxIdx,
        transitionNote: `Gán (${r + 1}, ${c + 1}) = ${val} & Lan truyền loại trừ ${removedList.length} ràng buộc lân cận`,
        message: `Gán ô (${r + 1}, ${c + 1}) = ${val}. Lan truyền ràng buộc triệt tiêu giá trị ${val} ở ${removedList.length} ô cùng hàng/cột/khối.`,
      });

      lastVisitedCell = { row: r, col: c, depth, num: val };

      if (!failure && solve(depth + 1)) {
        return true;
      }

      // Khôi phục ràng buộc
      for (const [pr, pc, v] of removedList) {
        domains[pr][pc].add(v);
      }

      board[r][c] = 0;
      stats.backtracks++;

      recordStep('BACKTRACK', {
        row: r,
        col: c,
        num: val,
        depth,
        boxIdx,
        transitionNote: `↩ Rút số ${val} tại (${r + 1}, ${c + 1}) & Khôi phục Domain lân cận`,
        message: `Quay lui: Rút số ${val} tại (${r + 1}, ${c + 1}). Khôi phục lại miền giá trị cho các ô lân cận.`,
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
      message: 'Không tìm thấy nghiệm thỏa mãn ràng buộc CSP.',
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
