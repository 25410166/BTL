// Tiện ích xử lý dữ liệu ma trận Sudoku 9x9

/**
 * Kiểm tra xem một giá trị `num` (1..9) có thể đặt vào ô (row, col) hợp lệ không
 */
export function isValidPlacement(board, row, col, num) {
  // Kiểm tra hàng
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }

  // Kiểm tra cột
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }

  // Kiểm tra khối 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if ((cr !== row || cc !== col) && board[cr][cc] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Tìm các ô đang gây xung đột với (row, col) khi đặt giá trị num
 * Giúp giao diện trực quan hóa tô màu đỏ các ô vi phạm
 */
export function findConflicts(board, row, col, num) {
  const conflicts = [];

  // Xung đột hàng
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) {
      conflicts.push({ row, col: c, reason: 'row' });
    }
  }

  // Xung đột cột
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) {
      conflicts.push({ row: r, col, reason: 'col' });
    }
  }

  // Xung đột khối 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if ((cr !== row || cc !== col) && board[cr][cc] === num) {
        // Tránh trùng lặp nếu đã thêm bởi hàng/cột
        if (!conflicts.some(item => item.row === cr && item.col === cc)) {
          conflicts.push({ row: cr, col: cc, reason: 'box' });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Lấy danh sách các số ứng viên hợp lệ (1..9) cho ô (row, col)
 */
export function getValidCandidates(board, row, col) {
  if (board[row][col] !== 0) return [];
  const candidates = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/**
 * Kiểm tra tính hợp lệ của bảng ban đầu (chưa điền)
 * Trả về { valid: boolean, errors: string[], conflictCells: [] }
 */
export function validateInitialBoard(board) {
  const errors = [];
  const conflictCells = new Set();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        const conflicts = findConflicts(board, r, c, val);
        if (conflicts.length > 0) {
          conflictCells.add(`${r},${c}`);
          conflicts.forEach(item => conflictCells.add(`${item.row},${item.col}`));
          errors.push(`Ô (${r + 1}, ${c + 1}) chứa số ${val} bị trùng lặp.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    conflictCells: Array.from(conflictCells).map(s => {
      const [r, c] = s.split(',').map(Number);
      return { row: r, col: c };
    }),
  };
}

/**
 * Chuyển chuỗi văn bản đầu vào thành ma trận 9x9 (0 là ô trống 'X')
 * Hỗ trợ các định dạng: 'X', 'x', '0', '.', khoảng trắng, xuống dòng
 */
export function parseInputText(text) {
  // Thay thế ký tự X/x/. bằng 0
  const normalized = text
    .replace(/[Xx\.]/g, ' 0 ')
    .trim();

  // Tách tất cả các tokens là số
  const tokens = normalized.match(/\d+/g);
  if (!tokens || tokens.length !== 81) {
    throw new Error(`Dữ liệu đầu vào cần đủ 81 ô (hiện có: ${tokens ? tokens.length : 0} phần tử).`);
  }

  const board = [];
  const originalEmpty = [];

  for (let r = 0; r < 9; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) {
      const val = parseInt(tokens[r * 9 + c], 10);
      if (val < 0 || val > 9) {
        throw new Error(`Giá trị không hợp lệ tại ô (${r + 1}, ${c + 1}): "${val}". Chỉ chấp nhận 1..9 hoặc X.`);
      }
      row.push(val);
      if (val === 0) {
        originalEmpty.push({ row: r, col: c });
      }
    }
    board.push(row);
  }

  return { board, originalEmpty };
}

/**
 * Chuyển ma trận Sudoku thành chuỗi hiển thị đúng định dạng đề bài (với 'X' cho ô trống)
 */
export function formatBoardToText(board, emptyChar = 'X') {
  return board
    .map(row =>
      row
        .map(cell => (cell === 0 ? emptyChar : cell.toString()))
        .join(' ')
    )
    .join('\n');
}

/**
 * Clone sâu ma trận 9x9
 */
export function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * Đếm số ô trống
 */
export function countEmptyCells(board) {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) count++;
    }
  }
  return count;
}

/**
 * Danh sách vị trí các ô trống
 */
export function getEmptyCells(board) {
  const empty = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

/**
 * Sinh ma trận Sudoku ngẫu nhiên hoàn chỉnh và khoét m ô trống (m <= 5 theo đề hoặc nhiều hơn)
 */
export function generateRandomSudoku(emptyCount = 5) {
  // Tạo ma trận rỗng
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Điền chéo 3 khối 3x3 độc lập trước (đảm bảo ngẫu nhiên)
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }

  // Giải để điền đầy đủ ma trận hợp lệ
  solveBoardQuick(board);

  // Khoét emptyCount ô trống
  const allCoords = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      allCoords.push({ r, c });
    }
  }

  // Xáo trộn ngẫu nhiên danh sách tọa độ (Fisher-Yates)
  for (let i = allCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
  }

  const result = cloneBoard(board);
  const selectedEmpty = allCoords.slice(0, Math.min(emptyCount, 81));
  selectedEmpty.forEach(({ r, c }) => {
    result[r][c] = 0;
  });

  return {
    board: result,
    solvedBoard: board,
    emptyCount: selectedEmpty.length,
    emptyCoords: selectedEmpty.map(({ r, c }) => ({ row: r, col: c })),
  };
}

function fillBox(board, row, col) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[idx++];
    }
  }
}

function solveBoardQuick(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveBoardQuick(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}
