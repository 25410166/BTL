// Script kiểm thử toàn bộ 5 thuật toán và tất cả các testcase
import { PRESET_TESTCASES } from './src/data/presetTestcases.js';
import { solveBacktrackingInstant } from './src/algorithms/sudokuBacktracking.js';
import { solveBacktrackingMRVInstant } from './src/algorithms/sudokuMRV.js';
import { solveDLXInstant } from './src/algorithms/sudokuDLX.js';
import { solveBitwiseInstant } from './src/algorithms/sudokuBitwise.js';
import { solveCSPInstant } from './src/algorithms/sudokuCSP.js';
import { validateInitialBoard } from './src/algorithms/sudokuUtils.js';

console.log('--- BẮT ĐẦU KIỂM THỬ 5 THUẬT TOÁN SUDOKU ---');

let passedCount = 0;
let totalCount = 0;

for (const tc of PRESET_TESTCASES) {
  totalCount++;
  console.log(`\nTestcase #${totalCount}: [${tc.category.toUpperCase()}] ${tc.name}`);
  console.log(`- Mô tả: ${tc.description}`);
  console.log(`- Số ô trống: ${tc.emptyCount}`);

  if (tc.id === 'exam_invalid_input') {
    const val = validateInitialBoard(tc.board);
    if (!val.valid) {
      console.log(`  ✓ Bắt lỗi input ban đầu thành công: ${val.errors[0]}`);
      passedCount++;
    } else {
      console.error(`  ✗ Thất bại: Không bắt được lỗi dữ liệu trùng`);
    }
    continue;
  }

  // Chạy 5 thuật toán
  const seqRes = solveBacktrackingInstant(tc.board);
  const mrvRes = solveBacktrackingMRVInstant(tc.board);
  const dlxRes = solveDLXInstant(tc.board);
  const bitwiseRes = solveBitwiseInstant(tc.board);
  const cspRes = solveCSPInstant(tc.board);

  if (tc.id === 'exam_unsolvable') {
    if (!seqRes.solved && !mrvRes.solved && !dlxRes.solved && !bitwiseRes.solved && !cspRes.solved) {
      console.log('  ✓ Nhận diện chính xác bài toán vô nghiệm trên cả 5 thuật toán!');
      passedCount++;
    } else {
      console.error('  ✗ Thất bại: Báo giải được bài toán vô nghiệm');
    }
    continue;
  }

  const allSolved = seqRes.solved && mrvRes.solved && dlxRes.solved && bitwiseRes.solved && cspRes.solved;

  if (allSolved) {
    // Kiểm tra tính hợp lệ của nghiệm
    const valSeq = validateInitialBoard(seqRes.board);
    const valMrv = validateInitialBoard(mrvRes.board);
    const valDlx = validateInitialBoard(dlxRes.board);
    const valBitwise = validateInitialBoard(bitwiseRes.board);
    const valCsp = validateInitialBoard(cspRes.board);

    if (valSeq.valid && valMrv.valid && valDlx.valid && valBitwise.valid && valCsp.valid) {
      console.log(`  ✓ Cả 5 thuật toán giải thành công và nghiệm hợp lệ 100%!`);
      console.log(`    * Tuần Tự: ${seqRes.stats.executionTimeMs} ms | ${seqRes.stats.assignments} gán | ${seqRes.stats.backtracks} quay lui`);
      console.log(`    * MRV:     ${mrvRes.stats.executionTimeMs} ms | ${mrvRes.stats.assignments} gán | ${mrvRes.stats.backtracks} quay lui`);
      console.log(`    * DLX:     ${dlxRes.stats.executionTimeMs} ms | ${dlxRes.stats.assignments} gán | ${dlxRes.stats.backtracks} quay lui`);
      console.log(`    * Bitwise: ${bitwiseRes.stats.executionTimeMs} ms | ${bitwiseRes.stats.assignments} gán | ${bitwiseRes.stats.backtracks} quay lui`);
      console.log(`    * CSP:     ${cspRes.stats.executionTimeMs} ms | ${cspRes.stats.assignments} gán | ${cspRes.stats.backtracks} quay lui`);
      passedCount++;
    } else {
      console.error('  ✗ Lời giải không thỏa mãn luật Sudoku');
    }
  } else {
    console.error(`  ✗ Không giải được testcase: Seq=${seqRes.solved}, MRV=${mrvRes.solved}, DLX=${dlxRes.solved}, Bitwise=${bitwiseRes.solved}, CSP=${cspRes.solved}`);
  }
}

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passedCount}/${totalCount} TESTCASES VƯỢT QUA.`);
console.log(`========================================\n`);
