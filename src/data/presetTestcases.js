// Rich preset testcases covering diverse topologies, edge cases, and scales

export const PRESET_TESTCASES = [
  {
    id: 'sample',
    title: 'Test 1: Đề bài mẫu (Sample 5 căn hộ)',
    category: 'Cơ bản',
    badge: 'Đề bài',
    description: 'Cây 5 căn hộ từ đề bài. Kiểm thử tính đúng đắn với kết quả mẫu: [1, 3, 2].',
    data: `5 3
1 2
1 3
3 4
3 5
1 3
2 5
1 4`,
  },
  {
    id: 'bamboo',
    title: 'Test 2: Cây dây xích (Line / Bamboo)',
    category: 'Cấu trúc đặc thù',
    badge: 'Độ sâu cực đại',
    description:
      'Cây suy biến thành 1 đường thẳng (1-2-3-...-12). Kiểm thử trường hợp xấu nhất về độ sâu: kiểm tra nhảy nhị phân nhiều tầng.',
    data: `12 6
1 2
2 3
3 4
4 5
5 6
6 7
7 8
8 9
9 10
10 11
11 12
1 12
2 11
4 8
5 5
12 1
3 7`,
  },
  {
    id: 'star',
    title: 'Test 3: Cây hình sao (Star Graph)',
    category: 'Cấu trúc đặc thù',
    badge: 'Bậc cao nhất',
    description:
      'Đỉnh trung tâm 1 nối với tất cả các căn hộ còn lại. Độ cao h=1. Khoảng cách giữa 2 lá luôn bằng 2 qua đỉnh 1.',
    data: `9 5
1 2
1 3
1 4
1 5
1 6
1 7
1 8
1 9
2 3
4 8
1 5
7 7
6 9`,
  },
  {
    id: 'binary',
    title: 'Test 4: Cây nhị phân hoàn chỉnh (Complete Binary Tree)',
    category: 'Cân bằng',
    badge: 'Cân bằng O(log N)',
    description:
      'Cây nhị phân 15 căn hộ cân bằng hoàn hảo. Kiểm thử việc tìm LCA giữa hai nhánh con trái - phải đối xứng.',
    data: `15 7
1 2
1 3
2 4
2 5
3 6
3 7
4 8
4 9
5 10
5 11
6 12
6 13
7 14
7 15
8 9
8 15
4 7
10 13
1 15
11 11
2 10`,
  },
  {
    id: 'edge_cases',
    title: 'Test 5: Các ca kiểm thử biên (Corner & Edge Cases)',
    category: 'Biên & Lỗi tiềm ẩn',
    badge: 'Edge Cases',
    description:
      'Kiểm thử các trường hợp nhạy cảm: truy vấn trùng đỉnh (dist=0), cạnh kề nhau (dist=1), gốc đến lá, nốt lá lên cụm lá.',
    data: `7 7
1 2
2 3
2 4
1 5
5 6
5 7
3 3
1 1
1 2
2 4
3 4
6 7
3 7`,
  },
  {
    id: 'caterpillar',
    title: 'Test 6: Cây sâu róm (Caterpillar Graph)',
    category: 'Hỗn hợp',
    badge: 'Cụm phân nhánh',
    description:
      'Trục chính dài kết hợp các cụm lá gắn rải rác. Mô phỏng khu đô thị với trục đường chính và các ngõ cụt.',
    data: `16 8
1 2
2 3
3 4
4 5
5 6
1 7
1 8
2 9
3 10
3 11
4 12
5 13
6 14
6 15
6 16
7 8
7 16
10 11
9 13
1 6
8 14
15 15
2 12`,
  },
  {
    id: 'minimal_two',
    title: 'Test 7: Cây tối thiểu (N = 2 căn hộ)',
    category: 'Biên kích thước',
    badge: 'N = 2',
    description: 'Chỉ 2 căn hộ duy nhất nối nhau. Kiểm thử giới hạn dưới của cây liên thông.',
    data: `2 3
1 2
1 2
2 1
2 2`,
  },
  {
    id: 'medium_scale',
    title: 'Test 8: Cây quy mô vừa (N = 50, Q = 25)',
    category: 'Quy mô',
    badge: 'Medium (N=50)',
    description:
      'Cây ngẫu nhiên 50 căn hộ và 25 truy vấn. Đủ lớn để kiểm tra hiệu năng tính toán và giao diện trực quan.',
    data: (() => {
      const n = 50;
      const q = 25;
      const edges = [];
      for (let i = 2; i <= n; i++) {
        const p = 1 + Math.floor(Math.random() * (i - 1));
        edges.push(`${p} ${i}`);
      }
      const queries = [];
      for (let i = 0; i < q; i++) {
        const u = 1 + Math.floor(Math.random() * n);
        const v = 1 + Math.floor(Math.random() * n);
        queries.push(`${u} ${v}`);
      }
      return `${n} ${q}\n${edges.join('\n')}\n${queries.join('\n')}`;
    })(),
  },
  {
    id: 'large_benchmark',
    title: 'Test 9: Cây quy mô lớn (N = 2,000, Q = 1,000)',
    category: 'Hiệu năng cao',
    badge: 'Stress Test',
    description:
      'Cây 2,000 căn hộ và 1,000 truy vấn ngẫu nhiên. Kiểm thử tốc độ xử lý tức thì của Binary Lifting và Euler RMQ!',
    data: (() => {
      const n = 2000;
      const q = 1000;
      const edges = [];
      for (let i = 2; i <= n; i++) {
        const p = 1 + Math.floor(Math.random() * (i - 1));
        edges.push(`${p} ${i}`);
      }
      const queries = [];
      for (let i = 0; i < q; i++) {
        const u = 1 + Math.floor(Math.random() * n);
        const v = 1 + Math.floor(Math.random() * n);
        queries.push(`${u} ${v}`);
      }
      return `${n} ${q}\n${edges.join('\n')}\n${queries.join('\n')}`;
    })(),
  },
];
