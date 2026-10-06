// Bộ testcase phong phú, trực quan trên bàn cờ Sudoku
export const PRESET_TESTCASES = [
  // ==========================================
  // NHÓM 1: CHUẨN ĐỀ THI (Tối đa 5 ô trống 'X')
  // ==========================================
  {
    id: 'sample_exam',
    category: 'exam',
    name: 'Sample Đề (1 ô X)',
    shortName: '1 ô X (Đề mẫu)',
    description: 'Ví dụ mẫu trong đề thi. 1 ô X tại hàng 4 cột 8, nghiệm là 1.',
    emptyCount: 1,
    board: [
      [5, 8, 1, 6, 7, 2, 4, 3, 9],
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 0, 6], // (4, 8) là X -> 1
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
    name: '2 ô X (Cùng hàng)',
    shortName: '2 ô X (Hàng 2)',
    description: '2 ô X nằm trên hàng 2 tại cột 2 và cột 8. Thuật toán điền lần lượt 2 số còn thiếu.',
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
    id: 'exam_2_holes_diag',
    category: 'exam',
    name: '2 ô X (Chéo góc)',
    shortName: '2 ô X (Chéo)',
    description: '2 ô X nằm ở hai góc đối đỉnh (hàng 1 cột 1 và hàng 9 cột 9).',
    emptyCount: 2,
    board: [
      [0, 8, 1, 6, 7, 2, 4, 3, 9], // Ô (1,1) là X -> 5
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 0], // Ô (9,9) là X -> 8
    ],
  },
  {
    id: 'exam_3_holes',
    category: 'exam',
    name: '3 ô X (Rải rác 3 khối)',
    shortName: '3 ô X (3 Khối)',
    description: '3 ô X tại 3 khối 3x3 khác nhau, quan sát chuyển ô mượt mà giữa các khối.',
    emptyCount: 3,
    board: [
      [0, 8, 1, 6, 7, 2, 4, 3, 9], // Ô (1,1)=5
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 0, 7, 2, 1, 6], // Ô (4,5)=5
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 0], // Ô (9,9)=8
    ],
  },
  {
    id: 'exam_4_holes',
    category: 'exam',
    name: '4 ô X (Chữ nhật 4 góc)',
    shortName: '4 ô X (4 Góc)',
    description: '4 ô X tại 4 góc bảng (1,1), (1,9), (9,1), (9,9), kiểm tra giao thoa hàng và cột.',
    emptyCount: 4,
    board: [
      [0, 8, 1, 6, 7, 2, 4, 3, 0], // (1,1)=5, (1,9)=9
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [0, 2, 7, 4, 3, 5, 1, 9, 0], // (9,1)=6, (9,9)=8
    ],
  },
  {
    id: 'exam_5_holes_standard',
    category: 'exam',
    name: '5 ô X (Tối đa đề thi)',
    shortName: '5 ô X (Chuẩn đề)',
    description: 'Đúng 5 ô trống mang ký tự X theo giới hạn tối đa của đề bài.',
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
    name: '5 ô X (Bẫy Backtrack sâu)',
    shortName: '5 ô X (Bẫy)',
    description: 'Thiết kế để giá trị thử đầu tiên gây bế tắc ở ô thứ 4 và 5, buộc thuật toán quay lui hoàn tác nhiều lần.',
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
    name: 'Vô Nghiệm (Không có lời giải)',
    shortName: 'Vô Nghiệm',
    description: 'Ma trận ban đầu không có số trùng lặp, nhưng các ô trống bị triệt tiêu hết mọi ứng viên hợp lệ. Thuật toán duyệt hết cây và kết luận vô nghiệm.',
    emptyCount: 1,
    board: [
      [0, 2, 3, 4, 5, 6, 7, 8, 9], // Ô (1,1) thiếu số 1
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [1, 0, 0, 0, 0, 0, 0, 0, 0], // Ô (9,1)=1 triệt tiêu ứng viên 1 của (1,1)
    ],
  },

  // ==========================================
  // NHÓM 2: MỞ RỘNG & THỬ THÁCH (ĐIỂM 10)
  // ==========================================
  {
    id: 'expand_10_holes',
    category: 'expand',
    name: 'Mở rộng: 10 ô trống (Trung bình)',
    shortName: '10 ô trống',
    description: '10 ô trống phân bổ cân xứng, minh họa quá trình duyệt nhiều cấp độ.',
    emptyCount: 10,
    board: [
      [5, 8, 0, 6, 7, 2, 4, 3, 0],
      [7, 0, 2, 8, 4, 3, 6, 0, 1],
      [3, 6, 4, 5, 0, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 0, 6],
      [2, 0, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [0, 2, 7, 4, 3, 5, 1, 9, 0],
    ],
  },
  {
    id: 'expand_easy_20',
    category: 'expand',
    name: 'Mở rộng: 20 ô trống (Dễ)',
    shortName: '20 ô trống',
    description: 'Ma trận Sudoku chuẩn với 20 ô trống, quan sát rõ ràng quá trình nhảy ô trên toàn bàn cờ.',
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
    name: 'Mở rộng: 35 ô trống (Vừa)',
    shortName: '35 ô trống',
    description: '35 ô trống mô phỏng câu đố chuẩn, cây quay lui bắt đầu phân nhánh rộng.',
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
    id: 'expand_arto_inkala',
    category: 'expand',
    name: 'Siêu thử thách: AI Escargot (58 ô)',
    shortName: 'AI Escargot (Khó nhất)',
    description: 'Câu đố Sudoku của nhà toán học Arto Inkala, thiết kế riêng để thử thách thuật toán Backtracking.',
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
