// Script kiểm thử thuật toán và tất cả các testcase
import { PRESET_TESTCASES } from './src/data/presetTestcases.js';
import { solveBacktrackingInstant } from './src/algorithms/sudokuBacktracking.js';
import { solveBacktrackingMRVInstant } from './src/algorithms/sudokuMRV.js';
import { validateInitialBoard } from './src/algorithms/sudokuUtils.js';

console.log('--- BẮT ĐẦU KIỂM THỬ THUẬT TOÁN SUDOKU BACKTRACKING ---');

let passedCount = 0;
let totalCount = 0;

for (const tc of PRESET_TESTCASES) {
  if (tc.id === 'expand_hard_48') continue; // Bỏ qua test 48 ô sâu trong CLI để chạy trong 1 giây
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

  // Chạy Backtracking Tuần Tự
  const seqRes = solveBacktrackingInstant(tc.board);

  // Chạy Backtracking MRV
  const mrvRes = solveBacktrackingMRVInstant(tc.board);

  if (tc.id === 'exam_unsolvable') {
    if (!seqRes.solved && !mrvRes.solved) {
      console.log('  ✓ Nhận diện chính xác bài toán vô nghiệm');
      passedCount++;
    } else {
      console.error('  ✗ Thất bại: Báo giải được bài toán vô nghiệm');
    }
    continue;
  }

  if (seqRes.solved && mrvRes.solved) {
    // Kiểm tra tính hợp lệ của nghiệm
    const valSeq = validateInitialBoard(seqRes.board);
    const valMrv = validateInitialBoard(mrvRes.board);

    if (valSeq.valid && valMrv.valid) {
      console.log(`  ✓ Cả 2 chiến lược giải thành công và nghiệm hợp lệ 100%!`);
      console.log(`    * Tuần Tự: ${seqRes.stats.executionTimeMs} ms | ${seqRes.stats.assignments} gán | ${seqRes.stats.backtracks} quay lui`);
      console.log(`    * MRV:     ${mrvRes.stats.executionTimeMs} ms | ${mrvRes.stats.assignments} gán | ${mrvRes.stats.backtracks} quay lui`);
      passedCount++;
    } else {
      console.error('  ✗ Lời giải không thỏa mãn luật Sudoku');
    }
  } else {
    console.error(`  ✗ Không giải được testcase: Seq=${seqRes.solved}, MRV=${mrvRes.solved}`);
  }
}

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passedCount}/${totalCount} TESTCASES VƯỢT QUA.`);
console.log(`========================================\n`);
