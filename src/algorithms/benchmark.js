// Benchmark Engine: Comparative Performance Testing for all 4 Tree Algorithms

import { preprocessBinaryLifting, queryDistance } from './binaryLifting.js';
import { preprocessEulerRMQ, queryEulerDistance } from './eulerTourRMQ.js';
import { solveTarjanOffline } from './tarjanLCA.js';
import { solveAllQueriesBFS } from './naiveBFS.js';

export async function runBenchmark(n, adj, queries, root = 1) {
  const qCount = queries.length;
  const results = {
    n,
    q: qCount,
    algorithms: {},
    isIdentical: true,
  };

  // 1. Binary Lifting
  const blStart = performance.now();
  const blPre = preprocessBinaryLifting(n, adj, root);
  const blPreEnd = performance.now();

  const blAnswers = new Int32Array(qCount);
  for (let i = 0; i < qCount; i++) {
    blAnswers[i] = queryDistance(queries[i][0], queries[i][1], blPre.up, blPre.depth, blPre.LOGN);
  }
  const blEnd = performance.now();

  results.algorithms['binaryLifting'] = {
    name: 'Binary Lifting (Nhị phân nâng)',
    timeComplexity: 'O(N log N + Q log N)',
    spaceComplexity: 'O(N log N)',
    preTimeMs: Number((blPreEnd - blStart).toFixed(3)),
    queryTimeMs: Number((blEnd - blPreEnd).toFixed(3)),
    totalTimeMs: Number((blEnd - blStart).toFixed(3)),
    operationsEst: n * blPre.LOGN + qCount * blPre.LOGN,
    answers: blAnswers,
    description: 'Thuật toán tiêu chuẩn tối ưu cho các bài toán trực tuyến (online queries).',
  };

  // 2. Euler Tour + RMQ (Sparse Table)
  const rmStart = performance.now();
  const rmPre = preprocessEulerRMQ(n, adj, root);
  const rmPreEnd = performance.now();

  const rmAnswers = new Int32Array(qCount);
  if (rmPre) {
    for (let i = 0; i < qCount; i++) {
      rmAnswers[i] = queryEulerDistance(queries[i][0], queries[i][1], rmPre);
    }
  }
  const rmEnd = performance.now();

  results.algorithms['eulerRMQ'] = {
    name: 'Euler Tour + Sparse Table (RMQ)',
    timeComplexity: 'O(N log N + Q * 1)',
    spaceComplexity: 'O(N log N)',
    preTimeMs: Number((rmPreEnd - rmStart).toFixed(3)),
    queryTimeMs: Number((rmEnd - rmPreEnd).toFixed(3)),
    totalTimeMs: Number((rmEnd - rmStart).toFixed(3)),
    operationsEst: (rmPre ? rmPre.euler.length * rmPre.LOGM : 0) + qCount * 2,
    answers: rmAnswers,
    description: 'Truy vấn cực nhanh O(1) nhờ biến bài toán LCA thành Range Minimum Query.',
  };

  // 3. Tarjan Offline LCA
  const tjStart = performance.now();
  const tjAnswers = solveTarjanOffline(n, adj, queries, root);
  const tjEnd = performance.now();

  results.algorithms['tarjan'] = {
    name: "Tarjan's Offline LCA (DSU)",
    timeComplexity: 'O(N + Q · α(N))',
    spaceComplexity: 'O(N + Q)',
    preTimeMs: 0,
    queryTimeMs: Number((tjEnd - tjStart).toFixed(3)),
    totalTimeMs: Number((tjEnd - tjStart).toFixed(3)),
    operationsEst: n + qCount * 4,
    answers: tjAnswers,
    description: 'Xử lý toàn bộ truy vấn ngoại tuyến (offline) trong 1 lần duyệt DFS kết hợp DSU.',
  };

  // 4. Naive BFS
  // Cap naive BFS if n * q > 25,000,000 to prevent browser tab freezing
  const naiveOps = n * qCount;
  if (naiveOps <= 15000000) {
    const bfsStart = performance.now();
    const bfsAnswers = solveAllQueriesBFS(n, adj, queries);
    const bfsEnd = performance.now();

    results.algorithms['naiveBFS'] = {
      name: 'Duyệt BFS ngây thơ (Naive BFS)',
      timeComplexity: 'O(Q · (N + M)) = O(Q · N)',
      spaceComplexity: 'O(N)',
      preTimeMs: 0,
      queryTimeMs: Number((bfsEnd - bfsStart).toFixed(3)),
      totalTimeMs: Number((bfsEnd - bfsStart).toFixed(3)),
      operationsEst: naiveOps,
      answers: bfsAnswers,
      description: 'Chạy BFS độc lập cho từng truy vấn. Chậm khi Q và N lớn.',
    };
  } else {
    // Projected estimation
    const estimatedTime = Number(((naiveOps / 20000000) * 1000).toFixed(1));
    results.algorithms['naiveBFS'] = {
      name: 'Duyệt BFS ngây thơ (Naive BFS)',
      timeComplexity: 'O(Q · N)',
      spaceComplexity: 'O(N)',
      preTimeMs: 0,
      queryTimeMs: estimatedTime,
      totalTimeMs: estimatedTime,
      operationsEst: naiveOps,
      isSimulated: true,
      description: `Bị chặn vì N*Q = ${naiveOps.toLocaleString()} quá lớn, sẽ làm đơ trình duyệt. Ước tính ~${estimatedTime}ms.`,
    };
  }

  // Cross-verify answers between algorithms
  for (let i = 0; i < qCount; i++) {
    const a1 = blAnswers[i];
    const a2 = rmAnswers[i];
    const a3 = tjAnswers[i];
    if (a1 !== a2 || a1 !== a3) {
      results.isIdentical = false;
      break;
    }
  }

  return results;
}
