// Bộ testcase đa dạng, toàn diện phục vụ kiểm thử hệ thống
// Phân chia thành 2 phân loại chính:
// 1. Chuẩn đề thi (Khống chế <= 5 ô trống 'X' theo đúng yêu cầu đề bài)
// 2. Mở rộng & Thử thách (Đa dạng độ khó 20 - 54 ô trống để đánh giá năng lực Backtracking)

export const PRESET_TESTCASES = [
  // ==========================================
  // NHÓM 1: CHUẨN ĐỀ THI (Tối đa 5 ô trống 'X')
  // ==========================================
  {
    id: 'sample_exam',
    category: 'exam',
    name: 'Sample đề thi (1 ô X)',
    description: 'Trùng khớp 100% ví dụ mẫu trong đề bài của giảng viên. Chỉ có 1 ô X tại hàng 4 cột 8, nghiệm là 1.',
    emptyCount: 1,
    board: [
      [5, 8, 1, 6, 7, 2, 4, 3, 9],
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 0, 6], // (4, 8) là X
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 8],
    ],
  },
  {
    id: 'exam_2_holes',
    category: 'exam',
    name: 'Đề thi 2 ô trống (Cùng hàng)',
    description: 'Có đúng 2 ô X nằm trên cùng hàng 2. Thuật toán kiểm tra và điền lần lượt hai số còn thiếu.',
    emptyCount: 2,
    board: [
      [5, 8, 1, 6, 7, 2, 4, 3, 9],
      [7, 0, 2, 8, 4, 3, 6, 0, 1], // Ô (2,2) và (2,8) là X
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 8],
    ],
  },
  {
    id: 'exam_3_holes',
    category: 'exam',
    name: 'Đề thi 3 ô trống (Rải rác 3 khối)',
    description: '3 ô X nằm tại 3 khối 3x3 khác nhau, kiểm tra tính độc lập và khả năng suy luận cục bộ.',
    emptyCount: 3,
    board: [
      [0, 8, 1, 6, 7, 2, 4, 3, 9], // Ô (1,1) là X -> 5
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 0, 7, 2, 1, 6], // Ô (4,5) là X -> 5
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 0], // Ô (9,9) là X -> 8
    ],
  },
  {
    id: 'exam_4_holes',
    category: 'exam',
    name: 'Đề thi 4 ô trống (Giao thoa hàng cột)',
    description: '4 ô trống tạo thành hình chữ nhật giao thoa giữa hàng 1, hàng 9 và cột 1, cột 9.',
    emptyCount: 4,
    board: [
      [0, 8, 1, 6, 7, 2, 4, 3, 0], // Ô (1,1)=5, (1,9)=9
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [0, 2, 7, 4, 3, 5, 1, 9, 0], // Ô (9,1)=6, (9,9)=8
    ],
  },
  {
    id: 'exam_5_holes_standard',
    category: 'exam',
    name: 'Đề thi 5 ô trống (Tối đa đề bài)',
    description: 'Đúng 5 ô trống (mức tối đa theo quy định của đề bài). Kiểm thử đệ quy 5 cấp.',
    emptyCount: 5,
    board: [
      [5, 8, 0, 6, 7, 2, 4, 3, 9], // (1,3)=1
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 0, 1, 7, 8, 2], // (3,5)=9
      [4, 3, 8, 9, 5, 7, 2, 0, 6], // (4,8)=1
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 0, 5, 2, 1, 9, 3, 6, 7], // (7,2)=4
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 0], // (9,9)=8
    ],
  },
  {
    id: 'exam_5_holes_backtracking_deep',
    category: 'exam',
    name: 'Đề thi 5 ô trống (Buộc Backtrack sâu)',
    description: 'Thiết kế để giá trị thử đầu tiên (ví dụ 1, 2) có vẻ hợp lệ tại ô đầu nhưng gây bế tắc ở ô thứ 4 và 5, buộc thuật toán phải quay lui hoàn tác nhiều lần.',
    emptyCount: 5,
    board: [
      [0, 0, 3, 9, 2, 1, 8, 7, 6], // (1,1)=5, (1,2)=4
      [2, 1, 9, 6, 8, 7, 5, 4, 3],
      [8, 7, 6, 3, 5, 4, 2, 1, 9],
      [9, 8, 7, 4, 6, 5, 3, 2, 1],
      [3, 2, 1, 7, 9, 8, 6, 5, 4],
      [6, 5, 4, 1, 3, 2, 9, 8, 7],
      [7, 6, 5, 2, 4, 3, 1, 9, 8],
      [4, 3, 2, 8, 1, 9, 7, 6, 5],
      [1, 9, 8, 5, 7, 6, 0, 0, 0], // (9,7)=4, (9,8)=3, (9,9)=2
    ],
  },
  {
    id: 'exam_unsolvable',
    category: 'exam',
    name: 'Testcase Vô Nghiệm (Không có lời giải)',
    description: 'Có 3 ô X nhưng các số cố định xung quanh tạo nên thế mâu thuẫn không thể thỏa mãn. Thuật toán duyệt hết không gian trạng thái và kết luận vô nghiệm.',
    emptyCount: 3,
    board: [
      [0, 2, 3, 4, 5, 6, 7, 8, 9], // Ô (1,1) trống, hàng 1 cần số 1
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [1, 0, 0, 0, 0, 0, 0, 0, 0], // Ô (9,1)=1 triệt tiêu ứng viên 1 của (1,1) nhưng không trùng hàng/khối
    ],
  },
  {
    id: 'exam_invalid_input',
    category: 'exam',
    name: 'Testcase Dữ Liệu Lỗi (Trùng lặp ban đầu)',
    description: 'Input ban đầu đã vi phạm luật Sudoku (ví dụ 2 số 5 trên cùng một hàng). Hệ thống phát hiện lỗi ngay từ khâu tiền xử lý.',
    emptyCount: 2,
    board: [
      [5, 5, 1, 6, 7, 2, 4, 3, 9], // Trùng số 5 ở cột 1 và 2
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 0, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 0],
    ],
  },

  // ==========================================
  // NHÓM 2: MỞ RỘNG & THỬ THÁCH ĐIỂM 10
  // ==========================================
  {
    id: 'expand_easy_20',
    category: 'expand',
    name: 'Mở rộng: Cấp độ Dễ (20 ô trống)',
    description: 'Ma trận Sudoku chuẩn với 20 ô trống. Kiểm nghiệm sức mạnh thuật toán trên bài toán kích thước vừa.',
    emptyCount: 20,
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  {
    id: 'expand_medium_35',
    category: 'expand',
    name: 'Mở rộng: Cấp độ Vừa (35 ô trống)',
    description: '35 ô trống phân bổ cân xứng, mô phỏng câu đố báo chí hàng ngày, cây quay lui bắt đầu phân nhánh rộng.',
    emptyCount: 35,
    board: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
  },
  {
    id: 'expand_hard_48',
    category: 'expand',
    name: 'Mở rộng: Cấp độ Khó (48 ô trống)',
    description: '48 ô trống, số lượng gợi ý ít, thử thách lớn về số lần quay lui và tối ưu hóa.',
    emptyCount: 48,
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 8, 5],
      [0, 0, 1, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 5, 0, 7, 0, 0, 0],
      [0, 0, 4, 0, 0, 0, 1, 0, 0],
      [0, 9, 0, 0, 0, 0, 0, 0, 0],
      [5, 0, 0, 0, 0, 0, 0, 7, 3],
      [0, 0, 2, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 9],
    ],
  },
  {
    id: 'expand_arto_inkala',
    category: 'expand',
    name: 'Siêu thử thách: "AI Escargot" (Arto Inkala)',
    description: 'Câu đố Sudoku nổi tiếng của nhà toán học Arto Inkala, được coi là một trong những bảng Sudoku khó nhất thế giới, thiết kế riêng để đánh lừa các nhánh tìm kiếm.',
    emptyCount: 58,
    board: [
      [1, 0, 0, 0, 0, 7, 0, 9, 0],
      [0, 3, 0, 0, 2, 0, 0, 0, 8],
      [0, 0, 9, 6, 0, 0, 5, 0, 0],
      [0, 0, 5, 3, 0, 0, 9, 0, 0],
      [0, 1, 0, 0, 8, 0, 0, 0, 2],
      [6, 0, 0, 0, 0, 4, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 4, 0, 0, 0, 0, 0, 0, 7],
      [0, 0, 7, 0, 0, 0, 3, 0, 0],
    ],
  },
];
