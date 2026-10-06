// Thuật toán Knuth's Algorithm X kết hợp Kỹ thuật Dancing Links (DLX)
// Quy bài toán Sudoku 9x9 về bài toán Bao phủ chính xác (Exact Cover Problem) với 324 cột ràng buộc và 729 hàng lựa chọn.
// Dùng danh sách liên kết kép 4 chiều (Circular Doubly Linked Lists).
// Gỡ bỏ và khôi phục nhánh tìm kiếm bằng hoán đổi con trỏ với chi phí O(1).
// Đây là thuật toán kinh điển đạt tốc độ giải Sudoku tối thượng trong Khoa học Máy tính.

import { cloneBoard } from './sudokuUtils.js';

class DLXNode {
  constructor(rowId = -1, colNode = null) {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.col = colNode || this;
    this.rowId = rowId;
    this.size = 0; // Chỉ dùng cho Column Header
    this.name = '';
  }
}

function getColIndices(r, c, num) {
  const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
  return [
    r * 9 + c,                          // Ràng buộc 1: Mỗi ô phải có 1 số (0..80)
    81 + r * 9 + (num - 1),              // Ràng buộc 2: Mỗi hàng phải có số num (81..161)
    162 + c * 9 + (num - 1),             // Ràng buộc 3: Mỗi cột phải có số num (162..242)
    243 + box * 9 + (num - 1),           // Ràng buộc 4: Mỗi khối 3x3 phải có số num (243..323)
  ];
}

class DancingLinksMatrix {
  constructor() {
    this.root = new DLXNode();
    this.root.name = 'ROOT';
    this.headers = [];
    this.rowMeta = []; // rowId -> { r, c, num }

    let prev = this.root;
    for (let i = 0; i < 324; i++) {
      const h = new DLXNode();
      h.name = `C_${i}`;
      h.col = h;
      h.left = prev;
      h.right = this.root;
      prev.right = h;
      this.root.left = h;
      prev = h;
      this.headers.push(h);
    }
  }

  addRow(r, c, num) {
    const rowId = this.rowMeta.length;
    this.rowMeta.push({ r, c, num });

    const cols = getColIndices(r, c, num);
    let firstNode = null;

    for (const colIdx of cols) {
      const header = this.headers[colIdx];
      const node = new DLXNode(rowId, header);

      node.up = header.up;
      node.down = header;
      header.up.down = node;
      header.up = node;
      header.size++;

      if (!firstNode) {
        firstNode = node;
      } else {
        node.left = firstNode.left;
        node.right = firstNode;
        firstNode.left.right = node;
        firstNode.left = node;
      }
    }
  }

  cover(colNode) {
    colNode.right.left = colNode.left;
    colNode.left.right = colNode.right;

    let row = colNode.down;
    while (row !== colNode) {
      let node = row.right;
      while (node !== row) {
        node.down.up = node.up;
        node.up.down = node.down;
        node.col.size--;
        node = node.right;
      }
      row = row.down;
    }
  }

  uncover(colNode) {
    let row = colNode.up;
    while (row !== colNode) {
      let node = row.left;
      while (node !== row) {
        node.col.size++;
        node.down.up = node;
        node.up.down = node;
        node = node.left;
      }
      row = row.up;
    }

    colNode.right.left = colNode;
    colNode.left.right = colNode;
  }
}

/**
 * Giải tức thì bằng Dancing Links (DLX)
 * @param {number[][]} initialBoard
 * @returns {object} { solved: boolean, board: number[][], stats: object }
 */
export function solveDLXInstant(initialBoard) {
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

  const dlx = new DancingLinksMatrix();

  // Nạp các lựa chọn hàng vào ma trận DLX
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        dlx.addRow(r, c, val);
      } else {
        for (let num = 1; num <= 9; num++) {
          dlx.addRow(r, c, num);
        }
      }
    }
  }

  // Cover các ô đã có số sẵn ban đầu
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        const targetCols = getColIndices(r, c, val);
        for (const colIdx of targetCols) {
          dlx.cover(dlx.headers[colIdx]);
        }
      }
    }
  }

  const solutionRows = [];

  function search(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    // Nếu ma trận đã bị cover hết toàn bộ cột -> Exact Cover hoàn tất
    if (dlx.root.right === dlx.root) {
      return true;
    }

    // Heuristic Knuth: Chọn cột có size nhỏ nhất để cực tiểu hóa hệ số phân nhánh
    let minSize = Infinity;
    let chosenCol = null;

    let col = dlx.root.right;
    while (col !== dlx.root) {
      if (col.size < minSize) {
        minSize = col.size;
        chosenCol = col;
        if (minSize === 0) break;
      }
      col = col.right;
    }

    if (!chosenCol || minSize === 0) {
      return false;
    }

    dlx.cover(chosenCol);

    let row = chosenCol.down;
    while (row !== chosenCol) {
      solutionRows.push(row.rowId);
      stats.assignments++;

      let node = row.right;
      while (node !== row) {
        dlx.cover(node.col);
        node = node.right;
      }

      if (search(depth + 1)) {
        return true;
      }

      // Quay lui (Uncover)
      solutionRows.pop();
      stats.backtracks++;

      node = row.left;
      while (node !== row) {
        dlx.uncover(node.col);
        node = node.left;
      }

      row = row.down;
    }

    dlx.uncover(chosenCol);
    return false;
  }

  const solved = search(0);

  if (solved) {
    for (const rowId of solutionRows) {
      const { r, c, num } = dlx.rowMeta[rowId];
      board[r][c] = num;
    }
  }

  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  return {
    solved,
    board: solved ? board : null,
    stats,
  };
}

/**
 * Sinh vết thực thi từng bước cho Dancing Links (DLX)
 * @param {number[][]} initialBoard
 * @returns {object}
 */
export function generateDLXTrace(initialBoard) {
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

  const dlx = new DancingLinksMatrix();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        dlx.addRow(r, c, val);
      } else {
        for (let num = 1; num <= 9; num++) {
          dlx.addRow(r, c, num);
        }
      }
    }
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val > 0) {
        const targetCols = getColIndices(r, c, val);
        for (const colIdx of targetCols) {
          dlx.cover(dlx.headers[colIdx]);
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
    message: 'Khởi động Knuth\'s Algorithm X + Dancing Links (DLX). Thiết lập ma trận Exact Cover 729x324 với danh sách liên kết kép 4 chiều.',
    transitionNote: 'Thiết lập ma trận DLX',
  });

  const solutionRows = [];

  function search(depth = 0) {
    stats.recursiveCalls++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    if (dlx.root.right === dlx.root) {
      recordStep('SUCCESS', {
        message: 'HOÀN TẤT! Toàn bộ 324 cột ràng buộc trong ma trận Exact Cover đã được bao phủ chính xác.',
        transitionNote: 'Đã giải thành công!',
      });
      return true;
    }

    let minSize = Infinity;
    let chosenCol = null;

    let col = dlx.root.right;
    while (col !== dlx.root) {
      if (col.size < minSize) {
        minSize = col.size;
        chosenCol = col;
        if (minSize === 0) break;
      }
      col = col.right;
    }

    if (!chosenCol || minSize === 0) {
      recordStep('DEAD_END', {
        depth,
        transitionNote: 'DLX Cắt nhánh (Cột không còn lựa chọn)',
        message: 'Nhánh bế tắc trong ma trận DLX: Tồn tại ràng buộc không còn hàng nào bao phủ được. Quay lui lập tức!',
      });
      return false;
    }

    dlx.cover(chosenCol);

    let row = chosenCol.down;
    while (row !== chosenCol) {
      const meta = dlx.rowMeta[row.rowId];
      solutionRows.push(row.rowId);
      stats.assignments++;

      board[meta.r][meta.c] = meta.num;

      recordStep('ASSIGN', {
        row: meta.r,
        col: meta.c,
        num: meta.num,
        depth,
        boxIdx: Math.floor(meta.r / 3) * 3 + Math.floor(meta.c / 3) + 1,
        transitionNote: `DLX Cover ô (${meta.r + 1}, ${meta.c + 1}) = ${meta.num}`,
        message: `Thuật toán X chọn hàng DLX #${row.rowId}: Điền ô (${meta.r + 1}, ${meta.c + 1}) = ${meta.num} và gỡ bỏ các cột ràng buộc xung đột liên quan.`,
      });

      lastVisitedCell = { row: meta.r, col: meta.c, depth, num: meta.num };
      callStack.push({ row: meta.r, col: meta.c, depth, tried: [meta.num] });

      let node = row.right;
      while (node !== row) {
        dlx.cover(node.col);
        node = node.right;
      }

      if (search(depth + 1)) {
        return true;
      }

      solutionRows.pop();
      board[meta.r][meta.c] = 0;
      stats.backtracks++;
      callStack.pop();

      recordStep('BACKTRACK', {
        row: meta.r,
        col: meta.c,
        num: meta.num,
        depth,
        boxIdx: Math.floor(meta.r / 3) * 3 + Math.floor(meta.c / 3) + 1,
        transitionNote: `↩ DLX Uncover khôi phục ô (${meta.r + 1}, ${meta.c + 1})`,
        message: `Quay lui DLX: Khôi phục lại các liên kết con trỏ cho ô (${meta.r + 1}, ${meta.c + 1}) và thử hàng tiếp theo trong cột.`,
      });

      node = row.left;
      while (node !== row) {
        dlx.uncover(node.col);
        node = node.left;
      }

      row = row.down;
    }

    dlx.uncover(chosenCol);
    return false;
  }

  const solved = search(0);

  if (solved) {
    for (const rowId of solutionRows) {
      const { r, c, num } = dlx.rowMeta[rowId];
      board[r][c] = num;
    }
  }

  stats.executionTimeMs = parseFloat((performance.now() - startTime).toFixed(3));

  if (!solved) {
    recordStep('NO_SOLUTION', {
      message: 'Không tìm thấy nghiệm Exact Cover cho Sudoku này.',
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
